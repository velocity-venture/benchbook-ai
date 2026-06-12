# 10 — Security, Privacy, and Deployment Review (Phase 9)

**Date:** 2026-06-10 · No secret values were inspected or exposed; variable names only.

## A. Current posture (largely sound)

- **Auth:** Supabase SSR cookie sessions; middleware protects `/dashboard`, `/chat`, `/settings`, `/tca`, `/trjpp`, `/dcs-policies`, `/onboarding` with an onboarding-completion gate; `/api/chat` re-checks `auth.getUser()` server-side (401 before body parse). No service-role key anywhere client-side; only `NEXT_PUBLIC_SUPABASE_ANON_KEY` in client context.
- **RLS:** strict per-user policies on all user tables (doc 04 §A); seat limits enforced in SQL; `rate_limits` RPC-only.
- **Rate limiting:** dual layer, 20 req/min/user, in-memory + `check_rate_limit` RPC (multi-instance safe), 429s tested.
- **Secrets hygiene:** no `.env`/keys committed; `.gitignore` covers env/key/cert patterns; `ANTHROPIC_API_KEY` deployed via `wrangler pages secret put`; `app/src/lib/supabase/env.ts` fails fast on missing/invalid config (commit `074bdad`).
- **Logging:** generic error messages only; no query content, tokens, or PII in production logs; streaming errors sanitized (no provider detail leak — tested).
- **Input validation:** query ≤2000, ≤20 messages ≤4000 chars, JSON shape checks, tested boundaries.
- **Deployment:** Cloudflare Pages (`app/wrangler.toml`, `build:cloudflare` = prebuild-corpus + next-on-pages), domain benchbook.ai; Supabase hosted DB with 7 migrations; `.vercel/` is legacy build metadata, not an active target; `docker-compose.yml`/`makefile.txt` reference an obsolete stack (Archive).

## B. Findings requiring action

| # | Finding | Severity |
|---|---|---|
| S1 | **Supabase email confirmations disabled** (`config.toml`) — anyone can register a working account with an unverified email; combined with no allowlist, any member of the public who finds the login page can create an account and query the system | High before external users; Medium now |
| S2 | **No CI** — tests run only by hand; nothing gates a deploy (compounds doc 05 §C: a deploy that breaks chat entirely would pass unnoticed) | High |
| S3 | **`npm audit`: ~40 transitive vulnerabilities** (Next 14 chain: xmldom, undici, path-to-regexp, tar, minimatch). Targeted patches fine; Next 14→16 major **not** recommended pre-launch | Medium |
| S4 | Outdated SDKs: `@anthropic-ai/sdk` 0.31.0, `@supabase/ssr` 0.8.0, `supabase-js` 2.93.3 | Low–Medium |
| S5 | **Audit-trail gaps for judicial use:** no refusal logs, verification results not persisted, `trust_metadata` never written, no corpus version per answer (docs 04–07). For a judge-facing system this is an accountability gap, not just a feature gap | High before internal *reliance*; blocking before external users |
| S6 | `seed-demo-data.sql` contains fictional juvenile case data (child initials, allegations) keyed to the first auth user; `[db.seed]` disabled by default but the file exists with deploy scripts nearby — must never run against prod | Medium (process control) |
| S7 | Queries are retained in `research_queries`/`chat_messages` indefinitely; Privacy page advertises 30–90-day retention windows — no retention job exists | Medium (privacy-claim mismatch) |
| S8 | JWT 1h + rotation: fine. Supabase auth rate limits configured. CORS handled by platform defaults; no permissive headers found. No debug endpoints found. `USE_MOCK_RESPONSES`/`NEXT_PUBLIC_DEBUG` flags exist — verify they are unset in prod | Low |
| S9 | No confidential/sealed-material controls of any kind (encryption-at-rest beyond platform default, access partitioning, sealed-case tagging) — currently fine **only because** the corpus is public law and queries are the only sensitive content. Privacy page correctly tells users not to submit case data, but nothing enforces it (queries containing party names are stored as-is) | Blocking for any sealed/confidential material |
| S10 | **Untracked source-of-record PDF folder at repo root** (`Benchbook.ai Database Files/`, 675+ Lexis-export PDFs, appeared 2026-06-10). Risks: (a) accidental bulk commit of ~100+ MB of licensed material into git history; (b) accidental deletion/modification before it is manifest-protected. Until the Phase B storage decision (git-lfs vs. external volume) is made, the folder should be added to `.gitignore` and treated as read-only; its first-look hashes are preserved in `APPENDIX_A_SOURCE_FILE_HASHES_20260610.txt`. LexisNexis license terms must be reviewed before redistributing or displaying annotation content | High (process); Required before any commit touching the folder |

## C. Classification by gate

**Required before internal judicial testing (Phase J):**
- Working chat path (doc 05 §C — overflow + model IDs) verified by smoke test
- Corpus rebuilt/current OR an explicit in-UI stale-corpus banner if any interim internal demo happens
- S2 (CI gate on tests), S5 minimum slice (log refusals; persist verification results; corpus_build_id on messages)
- S6 process control (prod seed prohibition written into DEPLOY.md)

**Required before external users:**
- S1 (email confirmation + an approved-user allowlist or invite gate — this is a judges' tool, not open signup)
- S3 targeted patches; S4 SDK updates; S7 retention job matching the privacy policy
- Full Phase F/G guardrails + golden QA green
- Pen-test pass over auth/RLS (live-Supabase RLS integration tests, doc 08)

**Required before any confidential or sealed material:**
- S9 program: data classification, sealed-matter handling policy, query-content scrubbing/warning, retention enforcement, audit review procedure, BAA-equivalent review of Anthropic/Supabase/Cloudflare data terms, and Judge/AOC sign-off. Recommend: keep sealed material **out of scope indefinitely** for V1.

**Future hardening:** SSO for court accounts; anomaly alerts on rate-limit hits; structured audit export for AOC review; key rotation runbook; Next.js major upgrade post-launch.

**Classification:** auth/RLS/rate-limit/secrets/logging — **Adopt**. Supabase auth config — **Adopt with revision** (S1). Deployment pipeline — **Adopt with revision** (S2 CI + smoke). docker-compose.yml, makefile.txt, `.vercel/`, `scripts/deploy_rag.sh`+`deploy_infra.sh` (dead AWS pipeline) — **Archive**. Retention/audit program — **build new**.
