import { NextRequest, NextResponse } from "next/server";

// Types
interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: Message[];
  query: string;
}

interface Source {
  title: string;
  citation: string;
  type: "TCA" | "DCS" | "TRJPP" | "LOCAL" | "CASELAW";
  snippet: string;
}

interface ChatResponse {
  response: string;
  sources: Source[];
}

// Environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX = process.env.PINECONE_INDEX || "benchbook-legal";
const PINECONE_HOST = process.env.PINECONE_HOST;

// System prompt for legal research
const SYSTEM_PROMPT = `You are BenchBook AI, a specialized legal research assistant for Tennessee Juvenile Court Judges.

Your knowledge includes:
- Tennessee Code Annotated (T.C.A.) Titles 36 and 37
- Department of Children's Services (DCS) policies
- Tennessee Rules of Juvenile Practice and Procedure (TRJPP)
- Local court rules
- Relevant Tennessee case law

Guidelines:
1. Always cite specific statutes, rules, or policies when possible (e.g., "T.C.A. § 37-1-114")
2. Be precise and accurate - these are legal matters
3. If you're uncertain about something, say so
4. Format responses clearly with headers and bullet points
5. Include procedural requirements and deadlines when relevant
6. Note any recent changes or amendments to the law

When discussing detention:
- T.C.A. § 37-1-114 governs detention criteria
- Detention hearing within 48 hours (excluding non-judicial days)
- Consider less restrictive alternatives

When discussing dispositions:
- T.C.A. § 37-1-129 lists available dispositions
- Consider child's best interests
- Document reasonable efforts

Always prioritize child safety and due process.`;

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { query, messages = [] } = body;

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    // Check if API keys are configured
    if (!OPENAI_API_KEY) {
      // Return mock response for development/demo
      return NextResponse.json(mockResponse(query));
    }

    // Step 1: Search Pinecone for relevant documents (if configured)
    let context = "";
    let sources: Source[] = [];

    if (PINECONE_API_KEY && PINECONE_HOST) {
      const searchResults = await searchPinecone(query);
      context = searchResults.context;
      sources = searchResults.sources;
    }

    // Step 2: Call OpenAI with context
    const response = await callOpenAI(query, context, messages);

    return NextResponse.json({
      response,
      sources,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

async function searchPinecone(query: string): Promise<{ context: string; sources: Source[] }> {
  try {
    // Generate embedding for query
    const embeddingResponse = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-large",
        input: query,
        dimensions: 3072,
      }),
    });

    const embeddingData = await embeddingResponse.json();
    const queryVector = embeddingData.data[0].embedding;

    // Search Pinecone
    const searchResponse = await fetch(`${PINECONE_HOST}/query`, {
      method: "POST",
      headers: {
        "Api-Key": PINECONE_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vector: queryVector,
        topK: 5,
        includeMetadata: true,
        namespace: "",
      }),
    });

    const searchData = await searchResponse.json();
    const matches = searchData.matches || [];

    // Extract context and sources
    const sources: Source[] = matches.map((match: any) => ({
      title: match.metadata.title || "Unknown",
      citation: match.metadata.section_id || match.metadata.citation || "",
      type: match.metadata.source as Source["type"],
      snippet: match.metadata.text?.substring(0, 200) || "",
    }));

    const context = matches
      .map((match: any) => match.metadata.text)
      .join("\n\n---\n\n");

    return { context, sources };
  } catch (error) {
    console.error("Pinecone search error:", error);
    return { context: "", sources: [] };
  }
}

async function callOpenAI(
  query: string,
  context: string,
  previousMessages: Message[]
): Promise<string> {
  const contextPrompt = context
    ? `\n\nRelevant legal documents:\n\n${context}\n\nBased on the above context and your knowledge, answer the following question:`
    : "";

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...previousMessages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    {
      role: "user",
      content: `${contextPrompt}\n\n${query}`,
    },
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages,
      temperature: 0.3, // Lower temperature for more consistent legal responses
      max_tokens: 2000,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

// Mock response for development/demo mode
function mockResponse(query: string): ChatResponse {
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
    };
  }

  if (queryLower.includes("transfer") || queryLower.includes("criminal court")) {
    return {
      response: `Under **T.C.A. § 37-1-134**, a child may be transferred to criminal court if:

**Eligibility:**
- The child is **16 or older** at the time of the alleged offense, OR
- The child is **14 or older** and charged with certain violent felonies

**Transfer Hearing Requirements:**
1. Notice to the child, parent, and counsel
2. Probable cause must be established
3. Court must consider the "Kent factors" including:
   - Seriousness of the alleged offense
   - Whether the offense was committed in an aggressive manner
   - Prior delinquency record
   - Likelihood of rehabilitation within the juvenile system
   - Interests of the community

**TRJPP Rule 212** governs the transfer hearing procedures and requires written findings.

⚠️ **Note:** A child under 16 cannot be transferred for any offense other than first-degree murder, attempted murder, or certain other violent crimes.`,
      sources: [
        {
          title: "Transfer to Criminal Court",
          citation: "T.C.A. § 37-1-134",
          type: "TCA",
          snippet: "Transfer hearings and procedures for juveniles...",
        },
        {
          title: "Transfer Hearing Procedures",
          citation: "TRJPP Rule 212",
          type: "TRJPP",
          snippet: "The court shall conduct a transfer hearing...",
        },
      ],
    };
  }

  // Default response
  return {
    response: `I can help you research Tennessee juvenile law on that topic. 

For the most accurate information, I recommend:
- Searching the **T.C.A. Title 37** (Juveniles) or **Title 36** (Domestic Relations)
- Reviewing relevant **DCS policies**
- Checking the **Tennessee Rules of Juvenile Practice and Procedure**

Would you like me to look up a specific statute or policy? Please provide more details about your question.`,
    sources: [],
  };
}
