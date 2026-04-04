import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildCitationIndex, verifyCitations, type CitationIndex, type VerifiedCitation } from "@/lib/citation-validator";

// Cloudflare Workers compatibility: use pre-built corpus JSON when filesystem is unavailable.
// The prebuild-corpus.js script generates this file at build time.
let prebuiltCorpus: { tcaTitle37: string; tcaTitle36: string; trjppRules: string; dcsText: string } | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  prebuiltCorpus = require("@/lib/legal-corpus-data.json");
} catch {
  // Pre-built corpus not available — will fall back to filesystem loading
}

// Dynamic imports for Node.js-only modules (unavailable in edge/Workers runtime)
let fsPromises: typeof import("fs").promises | null = null;
let pathModule: typeof import("path") | null = null;
let pdfParse: ((buffer: Buffer) => Promise<{ text: string }>) | null = null;

async function loadNodeModules() {
  if (fsPromises) return;
  try {
    const fs = await import("fs");
    fsPromises = fs.promises;
    pathModule = await import("path");
    // pdf-parse v2 exports PDFParse class, not a function
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfModule = require("pdf-parse");
    if (typeof pdfModule === "function") {
      pdfParse = pdfModule;
    }
  } catch {
    // Running in edge/Workers — filesystem not available
  }
}

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

// Rate limiting: in-memory fast path + Supabase-backed persistence
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

async function checkRateLimit(userId: string): Promise<boolean> {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  // Fast path: in-memory check
  if (entry && now <= entry.resetAt && entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  // Update in-memory counter
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    entry.count++;
  }

  // Authoritative check via Supabase (handles restarts and multi-instance)
  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_user_id: userId,
      p_max_requests: RATE_LIMIT_MAX,
    });
    if (error) {
      console.error('Supabase rate limit check failed, allowing request:', error);
      return true; // Fail open
    }
    return data as boolean;
  } catch (err) {
    console.error('Rate limit RPC error, allowing request:', err);
    return true; // Fail open
  }
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
  citationIndex?: CitationIndex;
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

CRITICAL CITATION RULES:
- ONLY cite statutes, rules, and policies whose text appears in the legal corpus provided below
- If a statute, rule, or policy is NOT found in the provided corpus, explicitly state: "This provision is not included in the available legal corpus"
- Never invent, guess, or approximate citation numbers — accuracy is paramount for judicial use
- Do not cite case law unless it appears in the corpus

Guidelines:
1. Always cite specific statutes, rules, or policies when possible (e.g., "T.C.A. § 37-1-114")
2. Be precise and accurate - these are legal matters affecting children and families
3. If you're uncertain about something, say so explicitly
4. Format responses clearly with headers and bullet points for readability
5. Include procedural requirements and deadlines when relevant
6. Note any recent changes or amendments to the law

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
    if (!(await checkRateLimit(user.id))) {
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

    // Step 3: Stream Claude response with citation verification
    const stream = await streamClaude(
      query,
      legalCorpus,
      messages,
      modelToUse,
      ENABLE_PROMPT_CACHING,
      corpusCache.citationIndex,
      (verifiedSources) => {
        // Track research query with real verified sources
        const sources: Source[] = verifiedSources.map(s => ({
          title: s.title,
          citation: s.citation,
          type: s.type,
          snippet: s.snippet.substring(0, 200),
        }));
        trackResearchQuery(user.id, query, sources).catch((err) => {
          console.error("Research tracking error:", err);
        });
      }
    );

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

  const dcsKeywords = [
    'dcs', 'department', 'investigation', 'removal', 'policy',
    'foster', 'placement', 'caseworker', 'substantiated',
    'home study', 'cftm', 'trial home visit', 'child protective',
    'abuse', 'neglect', 'safety plan', 'case plan'
  ];
  if (dcsKeywords.some(kw => queryLower.includes(kw))) {
    if (corpusCache.dcsRelevant) {
      corpus += `=== DEPARTMENT OF CHILDREN'S SERVICES POLICIES ===\n\n${corpusCache.dcsRelevant}\n\n`;
    }
  }

  return corpus;
}

/**
 * Refresh legal corpus cache from files or pre-built JSON
 */
async function refreshCorpusCache(): Promise<void> {
  // Try pre-built corpus first (Cloudflare Workers / edge runtime)
  if (prebuiltCorpus) {
    corpusCache.tcaTitle37 = prebuiltCorpus.tcaTitle37 || undefined;
    corpusCache.tcaTitle36 = prebuiltCorpus.tcaTitle36 || undefined;
    corpusCache.trjppRules = prebuiltCorpus.trjppRules || undefined;
    corpusCache.dcsRelevant = prebuiltCorpus.dcsText || undefined;
    console.log('Loaded corpus from pre-built JSON');

    corpusCache.citationIndex = buildCitationIndex(
      corpusCache.tcaTitle37,
      corpusCache.tcaTitle36,
      corpusCache.trjppRules,
      corpusCache.dcsRelevant
    );
    console.log(`Citation index built: ${corpusCache.citationIndex.tcaSections.size} TCA sections, ${corpusCache.citationIndex.trjppRules.size} TRJPP rules, ${corpusCache.citationIndex.dcsPolicies.size} DCS policies`);
    return;
  }

  // Fall back to filesystem loading (local dev / Node.js runtime)
  await loadNodeModules();
  if (!fsPromises || !pathModule) {
    console.error('No corpus source available: pre-built JSON missing and filesystem unavailable');
    return;
  }

  const corpusPath = pathModule.join(process.cwd(), 'legal-corpus');

  try {
    try {
      const tcaTitle37Path = pathModule.join(corpusPath, 'tca', 'title-37.html');
      const tcaTitle37Html = await fsPromises.readFile(tcaTitle37Path, 'utf-8');
      corpusCache.tcaTitle37 = extractTextFromHtml(tcaTitle37Html);
    } catch (error) {
      console.error('Failed to load TCA Title 37:', error);
    }

    try {
      const tcaTitle36Path = pathModule.join(corpusPath, 'tca', 'title-36.html');
      const tcaTitle36Html = await fsPromises.readFile(tcaTitle36Path, 'utf-8');
      corpusCache.tcaTitle36 = extractTextFromHtml(tcaTitle36Html);
    } catch (error) {
      console.error('Failed to load TCA Title 36:', error);
    }

    try {
      const trjppPath = pathModule.join(corpusPath, 'trjpp', 'all-rules.txt');
      corpusCache.trjppRules = await fsPromises.readFile(trjppPath, 'utf-8');
    } catch (error) {
      console.error('Failed to load TRJPP rules:', error);
    }

    try {
      const dcsPath = pathModule.join(corpusPath, 'dcs');
      const dcsFiles = await fsPromises.readdir(dcsPath);
      const pdfFiles = dcsFiles.filter(f => f.endsWith('.pdf'));

      let dcsContent = '';
      if (pdfParse) {
        for (const file of pdfFiles) {
          try {
            const pdfBuffer = await fsPromises.readFile(pathModule.join(dcsPath, file));
            const pdfData = await pdfParse(pdfBuffer);
            const text = (pdfData.text || '').trim();

            if (text.length < 100) {
              console.warn(`DCS PDF "${file}" returned near-empty text (${text.length} chars) — may be a scanned image`);
            }

            if (text.length > 0) {
              dcsContent += `=== DCS Policy: ${file} ===\n${text}\n\n`;
            }
          } catch (err) {
            console.error(`Failed to parse DCS PDF "${file}":`, err);
          }
        }
      }
      corpusCache.dcsRelevant = dcsContent;
      console.log(`DCS corpus loaded: ${pdfFiles.length} PDFs, ${Math.round(dcsContent.length / 1024)}KB text`);
    } catch (error) {
      console.error('Failed to load DCS policies:', error);
    }

    // Build citation index from loaded corpus
    corpusCache.citationIndex = buildCitationIndex(
      corpusCache.tcaTitle37,
      corpusCache.tcaTitle36,
      corpusCache.trjppRules,
      corpusCache.dcsRelevant
    );
    console.log(`Citation index built: ${corpusCache.citationIndex.tcaSections.size} TCA sections, ${corpusCache.citationIndex.trjppRules.size} TRJPP rules, ${corpusCache.citationIndex.dcsPolicies.size} DCS policies`);

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
  useCache: boolean,
  citationIndex?: CitationIndex,
  onComplete?: (sources: VerifiedCitation[]) => void
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
      text: `You have access to the following Tennessee legal corpus for this query:\n\n${legalCorpus}\n\nIMPORTANT: Only cite legal provisions whose text appears in the corpus above. If a user asks about a statute or rule not found in this corpus, explicitly state that it is not available in the current legal database rather than citing from memory. Answer the user's question based on this legal information, citing specific statutes and rules where applicable.`,
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

        let fullResponse = '';
        stream.on('text', (text) => {
          fullResponse += text;
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

        // Verify citations against corpus and send sources event
        const verifiedSources = citationIndex
          ? verifyCitations(fullResponse, citationIndex, legalCorpus)
          : [];

        if (verifiedSources.length > 0) {
          const sourcesEvent = JSON.stringify({
            type: 'sources',
            sources: verifiedSources,
          });
          controller.enqueue(encoder.encode(`data: ${sourcesEvent}\n\n`));
        }

        controller.close();

        // Fire completion callback for research tracking
        if (onComplete) {
          onComplete(verifiedSources);
        }
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
