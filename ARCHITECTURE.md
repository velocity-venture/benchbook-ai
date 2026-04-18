# BenchBook.AI Architecture

## Status: Claude Migration COMPLETE

The migration from OpenAI GPT-4o + Pinecone to Claude Sonnet 4.6 + direct context loading is fully complete. All legacy OpenAI/Pinecone code has been replaced.

## Current Architecture

### AI Pipeline

```
User Query
  │
  ├─ classifyQueryComplexity()
  │   ├─ Simple → Claude Haiku 4.5 ($0.02/query)
  │   └─ Complex → Claude Sonnet 4.6 ($0.09/query)
  │
  ├─ loadRelevantCorpus()
  │   ���─ TCA Title 37 (always loaded)
  │   ├─ TCA Title 36 (loaded for custody/domestic queries)
  │   ├─ TRJPP Rules (always loaded)
  │   └─ DCS Policies (loaded for DCS/removal queries)
  │
  ├─ streamClaude()
  │   ├─ System prompt (bench-ready format + hallucination guardrails)
  │   ├─ Legal corpus block (prompt cached)
  │   ├─ Conversation history
  │   └─ Streaming SSE response
  │
  ├─ runHallucinationGuard()
  │   ├─ verifyCitations(), cross-reference against corpus index
  │   ├─ computeConfidence(). HIGH/MEDIUM/LOW scoring
  │   └─ Flag unverified statutes and case law
  │
  └─ SSE Events → Client
      ├─ delta (streaming text)
      ├─ sources (verified citations)
      ├─ confidence (HIGH/MEDIUM/LOW + warnings)
      └─ done (token usage, cache stats)
```

### Smart Routing Rules

**Always Sonnet (complex):**
- Multiple TCA section references
- Sentencing, bond, probation, revocation queries
- Juvenile court (Title 37, TRJPP)
- DCS / dependency-neglect
- Legal standards (probable cause, due process, best interest)
- Queries >150 words
- Analysis/comparison requests
- Multiple questions in one query

**Haiku (simple), only when:**
- Single statute lookup, under 100 characters
- Definition or deadline questions
- Clarification of previous response

### Citation Validation

The `citation-validator.ts` module:
1. Builds a `CitationIndex` from the loaded corpus (TCA sections, TRJPP rules, DCS policies)
2. Extracts citations from Claude's response using regex patterns
3. Cross-references each citation against the index
4. Returns verified/unverified status with corpus snippets

Supported patterns:
- TCA: `T.C.A. § 37-1-114`, `TCA 37-1-114`, `T.C.A. section 37-1-114(a)`
- TRJPP: `Rule 114`, `TRJPP Rule 206`
- DCS: `DCS Policy 14.12`
- Case law: `Smith v. Jones`, `123 S.W.3d 456`: always flagged as unverified

### Hallucination Prevention

The `hallucination-guard.ts` module provides:
- **System prompt guardrails** injected into every Claude request
- **Post-response validation** of all citations
- **Confidence scoring:**
  - HIGH: All citations verified, no case law
  - MEDIUM: Statutes verified, but case law present
  - LOW: One or more statutes could not be verified
- **Warnings** displayed to the judge for unverified content

### Legal Corpus

Pre-built at build time by `scripts/prebuild-corpus.js` into `app/src/lib/legal-corpus-data.json`. This JSON is statically imported (no filesystem access needed at runtime, compatible with Cloudflare Workers edge runtime).

Current corpus (~5.9MB compressed):
- TCA Title 37 (Juveniles): 1.5MB
- TCA Title 36 (Domestic Relations): 4.4MB
- TRJPP Rules: 73KB
- DCS Policies: pending text extraction from PDFs

### Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| UI Components | Radix UI, Lucide icons |
| State | React hooks, Zustand |
| AI | Claude Sonnet 4.6 / Haiku 4.5 via @anthropic-ai/sdk |
| Auth | Supabase Auth (SSR) |
| Database | Supabase PostgreSQL (chat sessions, messages, feedback, research patterns) |
| Deployment | Cloudflare Pages (edge runtime) |
| Testing | Vitest |

### Key Files

| File | Purpose |
|------|---------|
| `app/src/app/api/chat/route.ts` | Main chat API, routing, corpus loading, streaming, validation |
| `app/src/lib/citation-validator.ts` | Citation extraction, verification, confidence scoring |
| `app/src/lib/hallucination-guard.ts` | Hallucination prevention guardrails |
| `app/src/lib/legal-corpus-data.json` | Pre-built corpus (generated at build time) |
| `app/src/app/(dashboard)/chat/page.tsx` | Chat UI with streaming, sources, confidence badges |
| `scripts/prebuild-corpus.js` | Build-time corpus processor |

### Database Schema (Supabase)

- `chat_sessions`: User chat sessions with titles
- `chat_messages`: Individual messages with role, content, sources
- `chat_feedback`: Thumbs up/down, bookmarks per message
- `research_queries`: Query tracking for usage analytics
- `waitlist`: Landing page waitlist signups

### Cost Model

| Plan | Price | Est. AI Cost | Margin |
|------|-------|-------------|--------|
| Solo ($69/mo) | 200 queries/mo | $8.20 | 88% |
| Court ($199/mo) | 800 queries/mo | $38.40 | 81% |
