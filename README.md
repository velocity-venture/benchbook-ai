# BenchBook.AI

Premium judicial productivity platform designed by Judge M.O. Eckel III for modern court operations. AI-powered legal research assistant built specifically for Tennessee state court judges.

## What It Does

BenchBook.AI provides instant, bench-ready legal research using Claude AI with direct access to the Tennessee legal corpus. Ask a question about Tennessee law and get a concise, citation-verified answer you can act on during a hearing.

**Key capabilities:**
- **AI Legal Research** — Ask questions about TCA, TRJPP rules, DCS policies
- **Citation Verification** — Every statute citation is cross-referenced against the loaded legal corpus
- **Hallucination Guard** — Confidence scoring (HIGH/MEDIUM/LOW) flags unverified citations and case law
- **Smart Model Routing** — Complex queries use Claude Sonnet; simple lookups use Haiku for cost efficiency
- **Bench Cards** — One-click common queries for detention, sentencing, DCS removal, and procedure

## Architecture

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14 (TypeScript, React 18) |
| AI/LLM | Claude Sonnet 4.6 / Haiku 4.5 (Anthropic) |
| Database | PostgreSQL (Supabase) |
| Auth | Supabase Auth |
| Deployment | Cloudflare Pages (edge runtime) |
| Legal Corpus | TCA Title 36/37, TRJPP, DCS — loaded directly into 1M token context |

### AI Pipeline

```
User Query
  → Smart Routing (Haiku for simple, Sonnet for complex)
  → Legal Corpus Loading (TCA, TRJPP, DCS from pre-built JSON)
  → Claude API (streaming SSE response)
  → Citation Validation (cross-reference against corpus index)
  → Hallucination Guard (confidence scoring + warnings)
  → Verified Response to Judge
```

### Cost Model
- Simple lookups (Haiku): ~$0.02/query
- Complex analysis (Sonnet): ~$0.09/query
- Prompt caching: 90% discount on repeated corpus access

## Getting Started

### Prerequisites
- Node.js 18+
- Anthropic API key ([console.anthropic.com](https://console.anthropic.com))
- Supabase project (for auth and persistence)

### Setup

```bash
# Clone and install
git clone <repo-url>
cd benchbook-ai/app
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys:
#   ANTHROPIC_API_KEY=sk-ant-api03-...
#   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
#   USE_CLAUDE_API=true

# Run development server
npm run dev
```

### Without API Keys (Demo Mode)
If `USE_CLAUDE_API` is not set or the Anthropic key is missing, the app runs in demo mode with hardcoded responses for common queries.

## Legal Corpus

The AI has direct access to these Tennessee legal sources:

| Source | Coverage |
|--------|----------|
| TCA Title 36 | Domestic Relations (custody, divorce, adoption) |
| TCA Title 37 | Juveniles (courts, proceedings, placement, DCS) |
| TRJPP | Tennessee Rules of Juvenile Practice and Procedure |
| DCS Policies | Chapter 14 (Investigations), Chapter 16 (Foster Care), Chapter 9 (Case Planning) |

See [legal-corpus/README.md](legal-corpus/README.md) for details on expanding the corpus.

## Pricing

| Plan | Price | Users |
|------|-------|-------|
| Solo | $69/month | Individual judge |
| Court | $199/month | Up to 5 staff |

## Testing

```bash
cd app
npm test          # Run all tests
npm run test:watch  # Watch mode
```

## Target Market

- **Primary:** Tennessee state court judges (General Sessions, Circuit, Juvenile)
- **Expansion:** Southeastern US, then national
- **Positioning:** Judge-built, judge-priced alternative to enterprise solutions like Learned Hand

---

*Entity: Velocity Venture Holdings LLC*
*Lead: Judge M.O. Eckel III*
*Status: Pre-revenue, development phase*
