# BenchBook AI. Deployment Guide
**Platform: Cloudflare Pages**

---

## Quick Start (15 minutes)

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
   - Name: `benchbook-ai`
   - Region: `US East (N. Virginia)` (closest to TN)
   - Generate a strong database password (save it)
3. Wait for project to provision (~2 minutes)

### Step 2: Run Database Migrations
**Recommended (CLI):**
```bash
SUPABASE_PROJECT_REF=your-project-ref ./scripts/deploy_supabase.sh
```

**Manual (SQL Editor):**
1. In Supabase Dashboard, go to **SQL Editor**
2. Run these migrations in order:
   - `supabase/migrations/20260204_initial_schema.sql`
   - `supabase/migrations/20260206_waitlist.sql`
   - `supabase/migrations/20260209003525_init_chat_persistence.sql`
   - `supabase/migrations/20260214_research_patterns.sql`
   - `supabase/migrations/20260404_rate_limiting.sql`

### Step 3: Configure Environment
Copy your Supabase credentials from Dashboard > Settings > API.

Create `app/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key
ANTHROPIC_API_KEY=sk-ant-api03-...
USE_CLAUDE_API=true
ENABLE_PROMPT_CACHING=true
```

### Step 4: Sign Up & Seed Demo Data
1. Start the app: `cd app && npm run dev`
2. Go to http://localhost:3000/login
3. Click "Create Account", use your real email
4. Check email for verification link, click it
5. In Supabase SQL Editor, paste `supabase/seed-demo-data.sql` and click **Run**

### Step 5: Verify
- Landing page: Waitlist signup, pricing, demo query
- Chat: Ask "What are detention criteria?", should return AI response with TCA citations
- Sources: Verified citations from T.C.A., TRJPP, and DCS

---

## AI Chat Architecture

The chat uses **Claude Sonnet 4.6** with direct legal corpus loading (no vector search):

| Component | Details |
|-----------|---------|
| **LLM** | Claude Sonnet 4.6 (complex) / Haiku 4.5 (simple lookups) |
| **Legal Corpus** | TCA Title 36 & 37, TRJPP rules, DCS policies, loaded directly into 1M token context |
| **Prompt Caching** | 90% cost reduction on repeated corpus access |
| **Citation Verification** | Post-processing validates all T.C.A., TRJPP, and DCS references against corpus |
| **Rate Limiting** | In-memory + Supabase-backed, 20 requests/minute per user |

---

## Cloudflare Pages Deployment

### Prerequisites
- Cloudflare account with Pages enabled
- `wrangler` CLI installed: `npm install -g wrangler`
- Authenticated: `wrangler login`

### Option A: CLI Deployment
```bash
cd app

# Pre-build legal corpus for Workers runtime
node ../scripts/prebuild-corpus.js

# Build with next-on-pages
npx @cloudflare/next-on-pages

# Deploy
npx wrangler pages deploy .vercel/output/static --project-name=benchbook-ai
```

### Option B: GitHub Integration (Recommended for CI/CD)
1. In Cloudflare Dashboard > Pages > Create a project
2. Connect `velocity-venture/benchbook-ai` repository
3. Configure build:
   - **Build command:** `cd app && npm run build:cloudflare`
   - **Build output directory:** `app/.vercel/output/static`
   - **Root directory:** `/` (project root)
4. Add environment variables in Pages settings (see below)
5. Deploy

### Environment Variables
Set these in Cloudflare Dashboard > Pages > benchbook-ai > Settings > Environment variables:

**Secrets (use `wrangler pages secret put`):**
```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

**Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
USE_CLAUDE_API=true
ENABLE_PROMPT_CACHING=true
NODE_VERSION=18
```

### Custom Domain
1. Pages > benchbook-ai > Custom domains > Add
2. Enter `benchbook.ai` and `www.benchbook.ai`
3. If domain DNS is on Cloudflare, records are auto-configured
4. Otherwise, add CNAME: `benchbook.ai → benchbook-ai.pages.dev`

---

## Legal Corpus

The legal corpus is pre-processed at build time into a JSON bundle for Workers compatibility:

| Source | Format | Size | Description |
|--------|--------|------|-------------|
| TCA Title 36 | HTML → JSON | 4.4MB | Complete Domestic Relations Code |
| TCA Title 37 | HTML → JSON | 1.5MB | Complete Juveniles Code |
| TRJPP | Text → JSON | 73KB | Complete Rules of Juvenile Practice and Procedure |
| DCS Policies | PDF | 25 files | Parsed at runtime (Node.js) or pre-extracted |

**Workers Compatibility Notes:**
- The `scripts/prebuild-corpus.js` script runs at build time to create `app/src/lib/legal-corpus-data.json`
- This JSON file is bundled into the Worker, eliminating runtime filesystem access
- Total corpus size (~6MB) is within Cloudflare Workers' 25MB script limit
- DCS PDFs require Node.js runtime for parsing; they are included in the pre-built JSON when pre-extracted text is available

---

## Mobile Apps

See [MOBILE.md](./MOBILE.md) for Capacitor native app build and submission instructions.

---

## Architecture

```
User Query → Landing Page or Chat UI
                    ↓
              Cloudflare Pages (Next.js)
                    ↓
              /api/chat (Cloudflare Workers)
                    ↓
              Auth Check (Supabase)
                    ↓
              Rate Limiting (in-memory + Supabase RPC)
                    ↓
              Smart Model Routing (Haiku vs Sonnet)
                    ↓
              Legal Corpus Loading (pre-built JSON)
                    ↓
              Claude API with Prompt Caching
                    ↓
              Citation Verification
                    ↓
              Streaming Response + Verified Sources
```

---

## Support

Repository: `github.com/velocity-venture/benchbook-ai`

Key files:
- `app/`: Next.js 14 app (frontend + API routes)
- `app/wrangler.toml`: Cloudflare Pages configuration
- `scripts/prebuild-corpus.js`: Legal corpus pre-processor
- `scripts/deploy-production.sh`: Deployment documentation script
- `legal-corpus/`: Source legal documents (server-side only)
- `supabase/`: Database migrations and seed data
