# BenchBook AI — Deployment Guide
**Target: TN Judicial Conference, February 23, 2026**

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
1. In Supabase Dashboard, go to **SQL Editor**
2. Paste the contents of `supabase/migrations/20260204_initial_schema.sql` and click **Run**
3. Paste the contents of `supabase/migrations/20260206_waitlist.sql` and click **Run**

### Step 3: Configure Environment
Copy your Supabase credentials from Dashboard > Settings > API:

Create `app/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key
OPENAI_API_KEY=sk-proj-xtdSjPLkb85...  (already in .env.local at root)
```

### Step 4: Sign Up & Seed Demo Data
1. Start the app: `cd app && npm run dev`
2. Go to http://localhost:3000/login
3. Click "Create Account" — use your real email
4. Check email for verification link, click it
5. In Supabase SQL Editor, paste `supabase/seed-demo-data.sql` and click **Run**

### Step 5: Verify
- Dashboard: Shows 5 cases, upcoming hearings, compliance alerts
- Chat: Ask "What are detention criteria?" — should return AI response with TCA citations
- Docket: Shows 7 hearings over next 2 weeks
- Documents: 3 sample documents in different states

---

## AI Chat Setup

The chat works in 3 modes (automatic fallback):

| Mode | Requirements | Quality |
|------|-------------|---------|
| **Pinecone + GPT-4o** | PINECONE_API_KEY + PINECONE_HOST | Best — real vector search + AI |
| **Local Search + GPT-4o** | OPENAI_API_KEY + search server running | Great — numpy vectors + AI |
| **Demo Mode** | Nothing | Good — hardcoded legal responses |

### For the conference demo, Local Search mode is recommended:

1. Start search server (loads 6,325 legal chunks):
   ```bash
   cd /path/to/benchbook-ai
   python3 scripts/search_server.py &
   ```
2. Start the app:
   ```bash
   cd app && npm run dev
   ```
3. Chat will automatically use local search when Pinecone isn't configured.

### Optional: Pinecone Setup (for production)
1. Go to [pinecone.io](https://pinecone.io) and sign up (free Starter plan works)
2. Create index:
   - Name: `benchbook-legal`
   - Dimensions: `3072`
   - Metric: `cosine`
   - Cloud: `AWS us-east-1` (serverless)
3. Get API key from Pinecone console
4. Add to `app/.env.local`:
   ```
   PINECONE_API_KEY=pcsk_...your-key
   PINECONE_HOST=https://benchbook-legal-xxxxx.svc.aped-xxxx.pinecone.io
   ```
5. Upload vectors:
   ```bash
   python3 scripts/ingest_local.py --embed --pinecone
   ```

---

## Vercel Deployment

1. Push to GitHub (already done)
2. Go to [vercel.com](https://vercel.com) and import `velocity-venture/benchbook-ai`
3. Set root directory to `app`
4. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
   - (Optional) `PINECONE_API_KEY`, `PINECONE_HOST`
5. Deploy

**Note:** Local search server won't work on Vercel. For production, use Pinecone or Demo mode.

---

## Demo Script (3 minutes)

1. **Landing Page** (30s) — Show the marketing page, waitlist form
2. **Login** (10s) — Sign in as the demo judge account
3. **Dashboard** (30s) — Active cases, today's hearings, compliance alerts
4. **AI Chat** (60s) — Ask: "What are the requirements for a detention hearing?"
   - Show the AI response with TCA/TRJPP citations
   - Point out the source badges (TCA, DCS, TRJPP)
5. **Docket** (30s) — Show week view, click "Schedule Hearing"
6. **Documents** (30s) — Generate a detention order from template
7. **TCA Explorer** (20s) — Search "37-1-114", show expandable section

---

## Legal Corpus (Pre-loaded)

| Source | Documents | Chunks | Description |
|--------|-----------|--------|-------------|
| TCA Title 36 | 1 HTML | 4,434 | Domestic Relations |
| TCA Title 37 | 1 HTML | 1,576 | Juveniles |
| TRJPP | 44 text files | 137 | Rules of Juvenile Practice |
| DCS Policies | 25 PDFs | 178 | Child Protective Services |
| **Total** | **71 files** | **6,325** | **All embedded with text-embedding-3-large** |

---

## Architecture

```
User Query → Chat UI → /api/chat (Next.js API Route)
                          ↓
                    Auth Check (Supabase)
                          ↓
                    Rate Limiting (20/min)
                          ↓
                    Search (Pinecone → Local → Demo)
                          ↓
                    GPT-4o with RAG context
                          ↓
                    Response + Source Citations
```

---

## Support

All code is at: `github.com/velocity-venture/benchbook-ai`

Key files:
- `app/` — Next.js 14 app (frontend + API routes)
- `scripts/ingest_local.py` — RAG ingestion pipeline
- `scripts/search_server.py` — Local vector search server
- `legal-corpus/` — Source documents
- `supabase/` — Database migrations and seed data
