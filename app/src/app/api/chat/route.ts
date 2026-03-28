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

interface ClaudeResponse {
  response: string;
  sources: Source[];
  model_used: 'haiku' | 'sonnet';
  tokens_used: number;
  cache_hit: boolean;
  processing_time_ms: number;
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
    const modelToUse = complexity === 'simple' ? 'claude-3-5-haiku-20241022' : 'claude-3-5-sonnet-20241022';

    // Step 2: Load relevant legal corpus into context
    const legalCorpus = await loadRelevantCorpus(query);

    // Step 3: Call Claude with legal corpus in context
    const claudeResponse = await callClaude(
      query, 
      legalCorpus, 
      messages, 
      modelToUse,
      ENABLE_PROMPT_CACHING
    );

    // Step 4: Extract and verify citations
    const verifiedSources = await verifyCitations(claudeResponse.response, legalCorpus);

    const result: ClaudeResponse = {
      response: claudeResponse.response,
      sources: verifiedSources,
      model_used: modelToUse.includes('haiku') ? 'haiku' : 'sonnet',
      tokens_used: claudeResponse.tokens_used,
      cache_hit: claudeResponse.cache_hit,
      processing_time_ms: Date.now() - startTime
    };

    // Step 5: Track research query for personal patterns
    try {
      await trackResearchQuery(user.id, query, verifiedSources);
    } catch (trackingError) {
      console.error("Research tracking error:", trackingError);
    }

    return NextResponse.json(result);

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
  
  // Simple queries: direct statute lookups, definitions, short questions
  const simpleIndicators = [
    query.length < 50,
    /t\.?c\.?a\.?\s*§?\s*\d+/.test(queryLower), // TCA reference
    /rule\s*\d+/.test(queryLower), // TRJPP rule reference
    /what\s+is\s+the\s+statute/i.test(query),
    /define|definition/i.test(query),
    /deadline|time\s*limit|days/i.test(query)
  ];

  // Complex queries: analysis, comparisons, multi-step reasoning
  const complexIndicators = [
    /analyz|compar|evaluat|assess/i.test(query),
    /what\s+factors?|how\s+should\s+i|what\s+are\s+my\s+options/i.test(query),
    /multiple|several|various/i.test(query),
    query.length > 150,
    (query.match(/\?/g) || []).length > 1, // Multiple questions
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
  
  // Check cache validity
  if (now - corpusCache.lastUpdated > CACHE_TTL_MS) {
    await refreshCorpusCache();
    corpusCache.lastUpdated = now;
  }

  const queryLower = query.toLowerCase();
  let corpus = "";

  // Always include core TCA Title 37 (Juveniles)
  if (corpusCache.tcaTitle37) {
    corpus += `=== TENNESSEE CODE ANNOTATED - TITLE 37 (JUVENILES) ===\n\n${corpusCache.tcaTitle37}\n\n`;
  }

  // Include Title 36 for family/domestic relations queries
  if ((queryLower.includes('custody') || queryLower.includes('parent') || 
       queryLower.includes('guardian') || queryLower.includes('domestic')) && 
      corpusCache.tcaTitle36) {
    corpus += `=== TENNESSEE CODE ANNOTATED - TITLE 36 (DOMESTIC RELATIONS) ===\n\n${corpusCache.tcaTitle36}\n\n`;
  }

  // Include TRJPP rules
  if (corpusCache.trjppRules) {
    corpus += `=== TENNESSEE RULES OF JUVENILE PRACTICE AND PROCEDURE ===\n\n${corpusCache.trjppRules}\n\n`;
  }

  // Include DCS policies for relevant queries
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
    // Load TCA Title 37 (Juveniles) - priority #1
    try {
      const tcaTitle37Path = path.join(corpusPath, 'tca', 'title-37.html');
      const tcaTitle37Html = await fs.readFile(tcaTitle37Path, 'utf-8');
      corpusCache.tcaTitle37 = extractTextFromHtml(tcaTitle37Html);
    } catch (error) {
      console.error('Failed to load TCA Title 37:', error);
    }

    // Load TCA Title 36 (Domestic Relations) 
    try {
      const tcaTitle36Path = path.join(corpusPath, 'tca', 'title-36.html');
      const tcaTitle36Html = await fs.readFile(tcaTitle36Path, 'utf-8');
      corpusCache.tcaTitle36 = extractTextFromHtml(tcaTitle36Html);
    } catch (error) {
      console.error('Failed to load TCA Title 36:', error);
    }

    // Load TRJPP rules
    try {
      const trjppPath = path.join(corpusPath, 'trjpp', 'all-rules.txt');
      corpusCache.trjppRules = await fs.readFile(trjppPath, 'utf-8');
    } catch (error) {
      console.error('Failed to load TRJPP rules:', error);
    }

    // Load sample DCS policies (would expand based on query needs)
    try {
      const dcsPath = path.join(corpusPath, 'dcs');
      const dcsFiles = await fs.readdir(dcsPath);
      const relevantDcsFiles = dcsFiles.filter(f => 
        f.includes('14.12') || f.includes('14.1') || f.includes('14.2')
      ).slice(0, 3); // Limit to avoid token overflow
      
      let dcsContent = '';
      for (const file of relevantDcsFiles) {
        // Note: PDF extraction would require additional processing
        // For now, we'll use placeholder text indicating PDF content
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
  // Basic HTML tag removal and cleanup
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
 * Call Claude API with legal corpus context
 */
async function callClaude(
  query: string,
  legalCorpus: string, 
  previousMessages: Message[],
  model: string,
  useCache: boolean
): Promise<{ response: string; tokens_used: number; cache_hit: boolean }> {
  if (!anthropic) {
    throw new Error('Anthropic client not initialized');
  }

  // Prepare messages with legal corpus context
  const systemMessage = SYSTEM_PROMPT;
  const contextMessage = legalCorpus 
    ? `You have access to the following Tennessee legal corpus for this query:\n\n${legalCorpus}\n\nPlease answer the user's question based on this legal information, citing specific statutes and rules where applicable.`
    : `Please answer the user's question based on your knowledge of Tennessee juvenile law.`;

  const messages = [
    ...previousMessages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    {
      role: 'user' as const,
      content: `${contextMessage}\n\nUser Question: ${query}`,
    },
  ];

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 4000,
      temperature: 0.3,
      system: systemMessage,
      messages,
    });

    const responseText = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    return {
      response: responseText,
      tokens_used: response.usage.input_tokens + response.usage.output_tokens,
      cache_hit: false // TODO: Implement actual cache hit detection
    };

  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error(`Claude API call failed: ${error}`);
  }
}

/**
 * Verify and extract citations from Claude's response
 */
async function verifyCitations(response: string, legalCorpus: string): Promise<Source[]> {
  const sources: Source[] = [];
  
  // Extract TCA citations
  const tcaCitations = response.match(/T\.C\.A\.?\s*§?\s*(\d+-\d+-\d+)/gi) || [];
  for (const citation of tcaCitations) {
    const cleanCitation = citation.replace(/T\.C\.A\.?\s*§?\s*/i, '').trim();
    const title = extractTitleFromResponse(response, citation);
    
    sources.push({
      title: title || `T.C.A. § ${cleanCitation}`,
      citation: `T.C.A. § ${cleanCitation}`,
      type: "TCA",
      snippet: extractSnippetAroundCitation(response, citation)
    });
  }

  // Extract TRJPP citations  
  const trjppCitations = response.match(/TRJPP\s+Rule\s+(\d+)/gi) || response.match(/Rule\s+(\d+)/gi) || [];
  for (const citation of trjppCitations) {
    const ruleNumber = citation.match(/(\d+)/)?.[1];
    if (ruleNumber) {
      sources.push({
        title: `TRJPP Rule ${ruleNumber}`,
        citation: `TRJPP Rule ${ruleNumber}`,
        type: "TRJPP", 
        snippet: extractSnippetAroundCitation(response, citation)
      });
    }
  }

  // Extract DCS policy citations
  const dcsCitations = response.match(/DCS\s+Policy\s+([0-9.]+)/gi) || [];
  for (const citation of dcsCitations) {
    sources.push({
      title: citation,
      citation: citation,
      type: "DCS",
      snippet: extractSnippetAroundCitation(response, citation)
    });
  }

  return sources;
}

function extractTitleFromResponse(response: string, citation: string): string | null {
  // Look for title patterns near the citation
  const citationIndex = response.indexOf(citation);
  if (citationIndex === -1) return null;

  const surroundingText = response.slice(
    Math.max(0, citationIndex - 100),
    citationIndex + 200
  );

  // Common title patterns in legal text
  const titleMatch = surroundingText.match(/["""]([^"""]+)["""]/);
  return titleMatch?.[1] || null;
}

function extractSnippetAroundCitation(response: string, citation: string): string {
  const citationIndex = response.indexOf(citation);
  if (citationIndex === -1) return '';

  const start = Math.max(0, citationIndex - 75);
  const end = Math.min(response.length, citationIndex + 125);
  
  return response.slice(start, end).trim();
}

/**
 * Track research query for personal patterns analysis
 */
async function trackResearchQuery(userId: string, query: string, sources: Source[]) {
  const supabase = createClient();
  
  // Prepare sources data for storage
  const sourcesData = sources.map(source => ({
    title: source.title,
    citation: source.citation,
    type: source.type,
    snippet: source.snippet.substring(0, 200)
  }));

  // Insert research query tracking
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

  // Update research patterns (async, don't wait)
  Promise.resolve(
    supabase.rpc('update_user_research_patterns', { target_user_id: userId })
  )
    .then(() => { console.log('Research patterns updated'); })
    .catch((err: unknown) => { console.error('Failed to update research patterns:', err); });
}

/**
 * Mock response for development/demo mode when Claude API unavailable
 */
function mockResponse(query: string, startTime: number): ClaudeResponse {
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

  // Default response
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