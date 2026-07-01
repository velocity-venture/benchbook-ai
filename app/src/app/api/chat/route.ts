import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildCitationIndex, type CitationIndex, type VerifiedCitation } from "@/lib/citation-validator";
import { runHallucinationGuard, HALLUCINATION_GUARDRAILS } from "@/lib/hallucination-guard";
import { classifyQueryComplexity } from "@/lib/query-router";

export const runtime = 'edge';

// Cloudflare Workers / Edge runtime: legal corpus is pre-built at build time into a JSON file.
// This eliminates all filesystem access at runtime.
import prebuiltCorpus from "@/lib/legal-corpus-data.json";

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
    // Evict expired entries so the map stays bounded across long-lived isolates
    if (rateLimitMap.size >= 500) {
      for (const [key, value] of rateLimitMap) {
        if (now > value.resetAt) rateLimitMap.delete(key);
      }
    }
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

// Model configuration — current model aliases (dated IDs here must exist or every request 404s)
const HAIKU_MODEL = process.env.CLAUDE_HAIKU_MODEL || 'claude-haiku-4-5';
const SONNET_MODEL = process.env.CLAUDE_SONNET_MODEL || 'claude-sonnet-4-6';

// Initialize Anthropic client
const anthropic = ANTHROPIC_API_KEY ? new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
}) : null;

// Legal corpus, prepared once per isolate. The corpus is baked in at build time,
// so there is nothing to refresh — building the citation index (regex scans over
// several MB of text) is the expensive part and must not repeat per request.
interface Corpus {
  // Always sent: Title 37 + TRJPP, pre-joined so the cached prompt prefix is byte-stable
  stableText: string;
  // Sent only when the query matches the relevant keywords
  tcaTitle36?: string;
  dcsRelevant?: string;
  citationIndex: CitationIndex;
}

let corpus: Corpus | null = null;

function getCorpus(): Corpus {
  if (corpus) return corpus;

  const tcaTitle37 = prebuiltCorpus.tcaTitle37 || undefined;
  const tcaTitle36 = prebuiltCorpus.tcaTitle36 || undefined;
  const trjppRules = prebuiltCorpus.trjppRules || undefined;
  const dcsRelevant = prebuiltCorpus.dcsText || undefined;

  let stableText = "";
  if (tcaTitle37) {
    stableText += `=== TENNESSEE CODE ANNOTATED - TITLE 37 (JUVENILES) ===\n\n${tcaTitle37}\n\n`;
  }
  if (trjppRules) {
    stableText += `=== TENNESSEE RULES OF JUVENILE PRACTICE AND PROCEDURE ===\n\n${trjppRules}\n\n`;
  }

  corpus = {
    stableText,
    tcaTitle36,
    dcsRelevant,
    citationIndex: buildCitationIndex(tcaTitle37, tcaTitle36, trjppRules, dcsRelevant),
  };
  return corpus;
}

// System prompt for legal research — bench-ready judicial responses
const SYSTEM_PROMPT = `You are BenchBook.AI, a judicial research assistant for Tennessee state court judges. Responses must be concise, authoritative, and immediately actionable from the bench.

You have direct access to the Tennessee legal corpus including:
- Tennessee Code Annotated (T.C.A.) Titles 36 and 37
- Department of Children's Services (DCS) policies
- Tennessee Rules of Juvenile Practice and Procedure (TRJPP)

RESPONSE FORMAT — Structure every answer as follows:
1. Direct answer in 1-2 sentences
2. Applicable statute with section number (T.C.A. § [title]-[chapter]-[section])
3. Key procedural requirements or elements
4. Practical notes for bench application

Do not write academic or law-review-style analysis unless asked. Judges need answers they can act on during a hearing.

For questions with multiple approaches, present numbered options with the most common practice first.

${HALLUCINATION_GUARDRAILS}

KEY PROCEDURAL REFERENCES:
- Detention criteria: T.C.A. § 37-1-114, hearing within 48 hours (excluding non-judicial days)
- Dispositions: T.C.A. § 37-1-129, consider child's best interests and family preservation
- Reasonable efforts: Document per DCS policy before any removal
- Less restrictive alternatives: Always consider per TRJPP before detention

Never speculate. Either cite the specific provision or state the topic is not in your available corpus.`;

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

    // Require Claude API to be enabled and configured
    if (!USE_CLAUDE_API) {
      return NextResponse.json(
        { error: "Claude API is not enabled. Set USE_CLAUDE_API=true in environment." },
        { status: 500 }
      );
    }
    if (!anthropic) {
      return NextResponse.json(
        { error: "Anthropic API key not configured. Set ANTHROPIC_API_KEY in environment." },
        { status: 500 }
      );
    }

    // Step 1: Classify query complexity for model routing
    const complexity = classifyQueryComplexity(query);
    const modelToUse = complexity === 'simple' ? HAIKU_MODEL : SONNET_MODEL;

    // Step 2: Load relevant legal corpus into context
    const legalCorpus = loadRelevantCorpus(query);

    // Step 3: Stream Claude response with citation verification
    const stream = await streamClaude(
      query,
      legalCorpus,
      messages,
      modelToUse,
      ENABLE_PROMPT_CACHING,
      getCorpus().citationIndex,
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

// classifyQueryComplexity is in lib/query-router.ts for testability

interface RelevantCorpus {
  // Identical for every query — cached prompt prefix stays warm across all queries
  stable: string;
  // Query-dependent sections (Title 36, DCS) — kept out of the stable block so
  // their presence/absence never invalidates the cached stable prefix
  conditional: string;
}

/**
 * Load relevant legal corpus sections based on query content
 */
function loadRelevantCorpus(query: string): RelevantCorpus {
  const { stableText, tcaTitle36, dcsRelevant } = getCorpus();
  const queryLower = query.toLowerCase();
  let conditional = "";

  if ((queryLower.includes('custody') || queryLower.includes('parent') ||
       queryLower.includes('guardian') || queryLower.includes('domestic')) &&
      tcaTitle36) {
    conditional += `=== TENNESSEE CODE ANNOTATED - TITLE 36 (DOMESTIC RELATIONS) ===\n\n${tcaTitle36}\n\n`;
  }

  const dcsKeywords = [
    'dcs', 'department', 'investigation', 'removal', 'policy',
    'foster', 'placement', 'caseworker', 'substantiated',
    'home study', 'cftm', 'trial home visit', 'child protective',
    'abuse', 'neglect', 'safety plan', 'case plan'
  ];
  if (dcsKeywords.some(kw => queryLower.includes(kw)) && dcsRelevant) {
    conditional += `=== DEPARTMENT OF CHILDREN'S SERVICES POLICIES ===\n\n${dcsRelevant}\n\n`;
  }

  return { stable: stableText, conditional };
}

/**
 * Stream Claude API response with prompt caching
 */
async function streamClaude(
  query: string,
  legalCorpus: RelevantCorpus,
  previousMessages: Message[],
  model: string,
  useCache: boolean,
  citationIndex?: CitationIndex,
  onComplete?: (sources: VerifiedCitation[]) => void
): Promise<ReadableStream> {
  if (!anthropic) {
    throw new Error('Anthropic client not initialized');
  }

  // System blocks ordered stable-first so prompt-cache prefixes survive across
  // queries: [prompt + always-loaded corpus] is byte-identical for every request,
  // and the query-dependent corpus block sits after it with its own breakpoint.
  const cacheControl = useCache ? { cache_control: { type: 'ephemeral' as const } } : {};
  const systemBlocks: Anthropic.Messages.TextBlockParam[] = [];

  if (legalCorpus.stable) {
    systemBlocks.push({
      type: 'text' as const,
      text: `${SYSTEM_PROMPT}\n\nYou have access to the following Tennessee legal corpus for this query:\n\n${legalCorpus.stable}`,
      ...cacheControl,
    });
  } else {
    systemBlocks.push({ type: 'text' as const, text: SYSTEM_PROMPT, ...cacheControl });
  }

  if (legalCorpus.conditional) {
    systemBlocks.push({
      type: 'text' as const,
      text: legalCorpus.conditional,
      ...cacheControl,
    });
  }

  if (legalCorpus.stable || legalCorpus.conditional) {
    systemBlocks.push({
      type: 'text' as const,
      text: `IMPORTANT: Only cite legal provisions whose text appears in the corpus above. If a user asks about a statute or rule not found in this corpus, explicitly state that it is not available in the current legal database rather than citing from memory. Answer the user's question based on this legal information, citing specific statutes and rules where applicable.`,
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
        const cacheCreation = usage.cache_creation_input_tokens ?? 0;
        const cacheRead = usage.cache_read_input_tokens ?? 0;

        const meta = JSON.stringify({
          type: 'done',
          tokens_used: usage.input_tokens + usage.output_tokens,
          cache_creation_input_tokens: cacheCreation,
          cache_read_input_tokens: cacheRead,
          cache_hit: cacheRead > 0,
          model_used: model.includes('haiku') ? 'haiku' : 'sonnet',
        });
        controller.enqueue(encoder.encode(`data: ${meta}\n\n`));

        // Run hallucination guard: verify citations and compute confidence
        let verifiedSources: VerifiedCitation[] = [];
        if (citationIndex) {
          const guardResult = runHallucinationGuard(
            fullResponse,
            citationIndex,
            legalCorpus.stable + legalCorpus.conditional
          );
          verifiedSources = guardResult.citations;

          // Send sources event
          if (verifiedSources.length > 0) {
            const sourcesEvent = JSON.stringify({
              type: 'sources',
              sources: verifiedSources,
            });
            controller.enqueue(encoder.encode(`data: ${sourcesEvent}\n\n`));
          }

          // Send confidence event
          const confidenceEvent = JSON.stringify({
            type: 'confidence',
            level: guardResult.confidence,
            reason: guardResult.confidenceReason,
            warnings: guardResult.warnings,
          });
          controller.enqueue(encoder.encode(`data: ${confidenceEvent}\n\n`));
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

  const { error } = await supabase
    .from("research_queries")
    .insert({
      user_id: userId,
      query: query.substring(0, 1000),
      query_type: 'chat',
      response_sources: sources,
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

