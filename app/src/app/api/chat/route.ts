import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { promises as fs } from "fs";
import path from "path";

// Types
interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Source {
  title: string;
  citation: string;
  type: "TCA" | "DCS" | "TRJPP" | "LOCAL" | "CASELAW";
  snippet: string;
}

// Validation limits
const MAX_QUERY_LENGTH = 2000;
const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 4000;

// Simple in-memory rate limiter (per-user, 20 requests per minute)
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

// Environment variables
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const USE_CLAUDE_API = process.env.USE_CLAUDE_API === 'true';
const ENABLE_PROMPT_CACHING = process.env.ENABLE_PROMPT_CACHING !== 'false';

// Model configuration — latest Claude models
const HAIKU_MODEL = process.env.CLAUDE_HAIKU_MODEL || 'claude-haiku-4-5-20250414';
const SONNET_MODEL = process.env.CLAUDE_SONNET_MODEL || 'claude-sonnet-4-5-20250414';

// Initialize Anthropic client
const anthropic = ANTHROPIC_API_KEY ? new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
}) : null;

// Legal corpus cache
interface CorpusCache {
  tcaTitle36?: string;
  tcaTitle37?: string;
  trjppRules?: string;
  dcsRelevant?: string;
  lastUpdated: number;
}

const corpusCache: CorpusCache = {
  lastUpdated: 0
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// System prompt for legal research
const SYSTEM_PROMPT = `You are BenchBook AI, a specialized legal research assistant for Tennessee Juvenile Court Judges.

You have direct access to the complete Tennessee legal corpus including:
- Tennessee Code Annotated (T.C.A.) Titles 36 and 37
- Department of Children's Services (DCS) policies
- Tennessee Rules of Juvenile Practice and Procedure (TRJPP)
- Local court rules
- Relevant Tennessee case law

Guidelines:
1. Always cite specific statutes, rules, or policies when possible (e.g., "T.C.A. § 37-1-114")
2. Be precise and accurate - these are legal matters affecting children and families
3. If you're uncertain about something, say so explicitly
4. Format responses clearly with headers and bullet points for readability
5. Include procedural requirements and deadlines when relevant
6. Note any recent changes or amendments to the law
7. Extract exact citations and verify they exist in the provided legal corpus

When discussing detention:
- T.C.A. § 37-1-114 governs detention criteria
- Detention hearing within 48 hours (excluding non-judicial days)
- Consider less restrictive alternatives per TRJPP

When discussing dispositions:
- T.C.A. § 37-1-129 lists available dispositions
- Consider child's best interests and family preservation
- Document reasonable efforts per DCS policy

Always prioritize child safety, due process, and family preservation when possible.

IMPORTANT: You must extract and verify all legal citations from your response. Return them in the sources array with exact statute/rule numbers, titles, and relevant text snippets.`;

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Auth check: require authenticated user
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Rate limiting
    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait before making more requests." },
        { status: 429 }
      );
    }

    // Parse and validate request body
    let body: { query?: unknown; messages?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const { query, messages: rawMessages } = body;

    // Validate query
    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query is required and must be a string" },
        { status: 400 }
      );
    }

    if (query.length > MAX_QUERY_LENGTH) {
      return NextResponse.json(
        { error: `Query must be under ${MAX_QUERY_LENGTH} characters` },
        { status: 400 }
      );
    }

    // Validate messages array
    let messages: Message[] = [];
    if (rawMessages) {
      if (!Array.isArray(rawMessages)) {
        return NextResponse.json(
          { error: "Messages must be an array" },
          { status: 400 }
        );
      }

      if (rawMessages.length > MAX_MESSAGES) {
        return NextResponse.json(
          { error: `Maximum ${MAX_MESSAGES} messages allowed` },
          { status: 400 }
        );
      }

      for (const msg of rawMessages) {
        if (
          !msg ||
          typeof msg !== "object" ||
          !("role" in msg) ||
          !("content" in msg) ||
          typeof msg.content !== "string" ||
          !["user", "assistant"].includes(msg.role)
        ) {
          return NextResponse.json(
            { error: "Each message must have a valid role and content" },
            { status: 400 }
          );
        }
        if (msg.content.length > MAX_MESSAGE_LENGTH) {
          return NextResponse.json(
            { error: `Message content must be under ${MAX_MESSAGE_LENGTH} characters` },
            { status: 400 }
          );
        }
      }

      messages = rawMessages as Message[];
    }

    // Check if Claude API is enabled and configured
    if (!USE_CLAUDE_API || !anthropic) {
      console.log('Claude API disabled or not configured, using mock response');
      return NextResponse.json(mockResponse(query, startTime));
    }

    // Step 1: Classify query complexity for model routing
    const complexity = classifyQueryComplexity(query);
    const modelToUse = complexity === 'simple' ? HAIKU_MODEL : SONNET_MODEL;

    // Step 2: Load relevant legal corpus into context
    const legalCorpus = await loadRelevantCorpus(query);

    // Step 3: Stream Claude response
    const stream = await streamClaude(
      query,
      legalCorpus,
      messages,
      modelToUse,
      ENABLE_PROMPT_CACHING
    );

    // Track research query asynchronously (fire-and-forget)
    trackResearchQuery(user.id, query, []).catch((err) => {
      console.error("Research tracking error:", err);
    });

    // Return streaming response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Model-Used': modelToUse.includes('haiku') ? 'haiku' : 'sonnet',
        'X-Processing-Start': startTime.toString(),
      },
    });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

/**
 * Classify query complexity for smart model routing
 */
function classifyQueryComplexity(query: string): 'simple' | 'complex' {
  const queryLower = query.toLowerCase();

  const simpleIndicators = [
    query.length < 50,
    /t\.?c\.?a\.?\s*§?\s*\d+/.test(queryLower),
    /rule\s*\d+/.test(queryLower),
    /what\s+is\s+the\s+statute/i.test(query),
    /define|definition/i.test(query),
    /deadline|time\s*limit|days/i.test(query)
  ];

  const complexIndicators = [
    /analyz|compar|evaluat|assess/i.test(query),
    /what\s+factors?|how\s+should\s+i|what\s+are\s+my\s+options/i.test(query),
    /multiple|several|various/i.test(query),
    query.length > 150,
    (query.match(/\?/g) || []).length > 1,
    /consider|weigh|balance/i.test(query)
  ];

  const simpleScore = simpleIndicators.filter(Boolean).length;
  const complexScore = complexIndicators.filter(Boolean).length;

  return complexScore > simpleScore ? 'complex' : 'simple';
}

/**
 * Load relevant legal corpus sections based on query content
 */
async function loadRelevantCorpus(query: string): Promise<string> {
  const now = Date.now();

  if (now - corpusCache.lastUpdated > CACHE_TTL_MS) {
    await refreshCorpusCache();
    corpusCache.lastUpdated = now;
  }

  const queryLower = query.toLowerCase();
  let corpus = "";

  if (corpusCache.tcaTitle37) {
    corpus += `=== TENNESSEE CODE ANNOTATED - TITLE 37 (JUVENILES) ===\n\n${corpusCache.tcaTitle37}\n\n`;
  }

  if ((queryLower.includes('custody') || queryLower.includes('parent') ||
       queryLower.includes('guardian') || queryLower.includes('domestic')) &&
      corpusCache.tcaTitle36) {
    corpus += `=== TENNESSEE CODE ANNOTATED - TITLE 36 (DOMESTIC RELATIONS) ===\n\n${corpusCache.tcaTitle36}\n\n`;
  }

  if (corpusCache.trjppRules) {
    corpus += `=== TENNESSEE RULES OF JUVENILE PRACTICE AND PROCEDURE ===\n\n${corpusCache.trjppRules}\n\n`;
  }

  if (queryLower.includes('dcs') || queryLower.includes('department') ||
      queryLower.includes('investigation') || queryLower.includes('removal')) {
    if (corpusCache.dcsRelevant) {
      corpus += `=== DEPARTMENT OF CHILDREN'S SERVICES POLICIES ===\n\n${corpusCache.dcsRelevant}\n\n`;
    }
  }

  return corpus;
}

/**
 * Refresh legal corpus cache from files
 */
async function refreshCorpusCache(): Promise<void> {
  const corpusPath = path.join(process.cwd(), 'legal-corpus');

  try {
    try {
      const tcaTitle37Path = path.join(corpusPath, 'tca', 'title-37.html');
      const tcaTitle37Html = await fs.readFile(tcaTitle37Path, 'utf-8');
      corpusCache.tcaTitle37 = extractTextFromHtml(tcaTitle37Html);
    } catch (error) {
      console.error('Failed to load TCA Title 37:', error);
    }

    try {
      const tcaTitle36Path = path.join(corpusPath, 'tca', 'title-36.html');
      const tcaTitle36Html = await fs.readFile(tcaTitle36Path, 'utf-8');
      corpusCache.tcaTitle36 = extractTextFromHtml(tcaTitle36Html);
    } catch (error) {
      console.error('Failed to load TCA Title 36:', error);
    }

    try {
      const trjppPath = path.join(corpusPath, 'trjpp', 'all-rules.txt');
      corpusCache.trjppRules = await fs.readFile(trjppPath, 'utf-8');
    } catch (error) {
      console.error('Failed to load TRJPP rules:', error);
    }

    try {
      const dcsPath = path.join(corpusPath, 'dcs');
      const dcsFiles = await fs.readdir(dcsPath);
      const relevantDcsFiles = dcsFiles.filter(f =>
        f.includes('14.12') || f.includes('14.1') || f.includes('14.2')
      ).slice(0, 3);

      let dcsContent = '';
      for (const file of relevantDcsFiles) {
        dcsContent += `[DCS Policy ${file} - PDF content would be extracted here]\n\n`;
      }
      corpusCache.dcsRelevant = dcsContent;
    } catch (error) {
      console.error('Failed to load DCS policies:', error);
    }

  } catch (error) {
    console.error('Failed to refresh corpus cache:', error);
  }
}

/**
 * Extract clean text from HTML content
 */
function extractTextFromHtml(html: string): string {
  return html
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    .replace(/<style[^>]*>.*?<\/style>/gis, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Stream Claude API response with prompt caching
 */
async function streamClaude(
  query: string,
  legalCorpus: string,
  previousMessages: Message[],
  model: string,
  useCache: boolean
): Promise<ReadableStream> {
  if (!anthropic) {
    throw new Error('Anthropic client not initialized');
  }

  // Build system prompt blocks with prompt caching
  const systemBlocks: Anthropic.Messages.TextBlockParam[] = [
    {
      type: 'text' as const,
      text: SYSTEM_PROMPT,
      ...(useCache ? { cache_control: { type: 'ephemeral' as const } } : {}),
    },
  ];

  // Add legal corpus as a separate cached block
  if (legalCorpus) {
    systemBlocks.push({
      type: 'text' as const,
      text: `You have access to the following Tennessee legal corpus for this query:\n\n${legalCorpus}\n\nPlease answer the user's question based on this legal information, citing specific statutes and rules where applicable.`,
      ...(useCache ? { cache_control: { type: 'ephemeral' as const } } : {}),
    });
  }

  const messages: Anthropic.Messages.MessageParam[] = [
    ...previousMessages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    {
      role: 'user' as const,
      content: query,
    },
  ];

  // Create a ReadableStream that pipes Claude's streaming response
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const stream = anthropic!.messages.stream({
          model,
          max_tokens: 4000,
          temperature: 0.3,
          system: systemBlocks,
          messages,
        });

        stream.on('text', (text) => {
          // Send each text delta as an SSE event
          const data = JSON.stringify({ type: 'delta', text });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        });

        // Wait for final message to get usage stats
        const finalMessage = await stream.finalMessage();

        // Send metadata event with token usage and cache stats
        const usage = finalMessage.usage;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const usageAny = usage as any;
        const cacheCreation = usageAny.cache_creation_input_tokens || 0;
        const cacheRead = usageAny.cache_read_input_tokens || 0;

        const meta = JSON.stringify({
          type: 'done',
          tokens_used: usage.input_tokens + usage.output_tokens,
          cache_creation_input_tokens: cacheCreation,
          cache_read_input_tokens: cacheRead,
          cache_hit: cacheRead > 0,
          model_used: model.includes('haiku') ? 'haiku' : 'sonnet',
        });
        controller.enqueue(encoder.encode(`data: ${meta}\n\n`));
        controller.close();
      } catch (error) {
        console.error('Claude streaming error:', error);
        const errData = JSON.stringify({ type: 'error', message: 'Failed to generate response' });
        controller.enqueue(encoder.encode(`data: ${errData}\n\n`));
        controller.close();
      }
    },
  });
}

/**
 * Track research query for personal patterns analysis
 */
async function trackResearchQuery(userId: string, query: string, sources: Source[]) {
  const supabase = createClient();

  const sourcesData = sources.map(source => ({
    title: source.title,
    citation: source.citation,
    type: source.type,
    snippet: source.snippet.substring(0, 200)
  }));

  const { error } = await supabase
    .from("research_queries")
    .insert({
      user_id: userId,
      query: query.substring(0, 1000),
      query_type: 'chat',
      response_sources: sourcesData,
    });

  if (error) {
    console.error("Failed to track research query:", error);
    throw error;
  }

  Promise.resolve(
    supabase.rpc('update_user_research_patterns', { target_user_id: userId })
  )
    .then(() => { console.log('Research patterns updated'); })
    .catch((err: unknown) => { console.error('Failed to update research patterns:', err); });
}

/**
 * Mock response for development/demo mode when Claude API unavailable
 */
function mockResponse(query: string, startTime: number) {
  const queryLower = query.toLowerCase();

  if (queryLower.includes("detention")) {
    return {
      response: `Under **T.C.A. § 37-1-114(a)**, a child may be detained only if:

1. **Immediate endangerment** — Detention is necessary to protect the child or others from immediate harm
2. **Flight risk** — There is reason to believe the child may flee the jurisdiction
3. **No parent/guardian available** — The child has no parent, guardian, or custodian able to provide supervision
4. **Serious offense** — The child is charged with an offense that would be a felony if committed by an adult

**Key Procedural Requirements:**
- A detention hearing must be held within **48 hours** (excluding weekends and holidays) of the child being taken into custody
- The court must consider **less restrictive alternatives** before ordering detention
- Written findings are required explaining why detention is necessary

**DCS Policy 14.12** also requires caseworkers to document reasonable efforts to prevent removal before requesting court-ordered detention.`,
      sources: [
        {
          title: "Criteria for detention of child",
          citation: "T.C.A. § 37-1-114",
          type: "TCA",
          snippet: "A child may be held in detention prior to adjudication only if...",
        },
        {
          title: "DCS Investigation Policy",
          citation: "DCS Policy 14.12",
          type: "DCS",
          snippet: "Prior to any home removal, the investigator shall...",
        },
      ],
      model_used: 'sonnet',
      tokens_used: 1250,
      cache_hit: false,
      processing_time_ms: Date.now() - startTime
    };
  }

  return {
    response: `I can help you research Tennessee juvenile law on that topic.

For the most accurate information, I recommend:
- Searching the **T.C.A. Title 37** (Juveniles) or **Title 36** (Domestic Relations)
- Reviewing relevant **DCS policies**
- Checking the **Tennessee Rules of Juvenile Practice and Procedure**

Would you like me to look up a specific statute or policy? Please provide more details about your question.

*Note: This is a demo response. Enable Claude API for full functionality.*`,
    sources: [],
    model_used: 'haiku',
    tokens_used: 450,
    cache_hit: false,
    processing_time_ms: Date.now() - startTime
  };
}
