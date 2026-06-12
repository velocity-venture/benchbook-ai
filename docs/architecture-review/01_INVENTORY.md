# 01 — Repository and Environment Inventory (Phase 0)

**Date:** 2026-06-10 · Read-only review · All commands non-destructive

## Git state

| Item | Value |
|---|---|
| `pwd` | `/Users/m3_ai_factory/Projects/benchbook-ai` |
| Branch | `refactor/codex-gpt55-launch-prep` |
| Dirty files (pre-existing, untouched) | `app/src/__tests__/citations.test.ts`, `app/src/__tests__/scope-guard.test.ts`, `app/src/lib/citation-validator.ts`, `app/src/lib/scope-guard.ts` (all `M`); `audits/` (untracked) |
| Pre-Claude snapshot | `~/Desktop/benchbook-ai-pre-fable5-20260610-205641` (outside repo) |

Recent log (10): `e3bc1bb` fix: handle unavailable corpus data · `7f23e20` fix: scope feedback toggles to current user · `074bdad` fix: validate Supabase environment configuration · `39c4aee`–`0b62ab5` seven `test:` commits covering research patterns, chat route validation, Supabase client, persistence/RLS, streaming, corpus cache, auth/rate limits.

## Top-level structure

```
app/                      Next.js 14 application (src, android, ios, resources, .vercel, .next, node_modules)
audits/                   Test-coverage audit docs (untracked; 2026-04-26 FINAL + _archive/)
benchbook-ai-infra/       SST v3 AWS/Pinecone ingestion infra (disconnected from app)
legal-corpus/             Corpus source dir — INCOMPLETE (see 02)
scripts/                  Build/deploy/ingestion scripts
supabase/                 config.toml, 7 migrations, seed-demo-data.sql
docs/                     (created by this review: architecture-review/)
+ 20 root-level .md docs (mixed eras; see classification table)
```

## Frameworks and runtimes

| Component | Version | Note |
|---|---|---|
| Next.js | 14.2.35 | Edge runtime for `/api/chat`; deployed via `@cloudflare/next-on-pages` 1.13.14 |
| React | 18.3.1 | |
| TypeScript | 5.x | |
| `@anthropic-ai/sdk` | 0.31.0 | Outdated (latest 0.9x) |
| `@supabase/ssr` / `supabase-js` | 0.8.0 / 2.93.3 | Outdated, non-blocking |
| Capacitor | 8.3.0 | iOS/Android WebView shells wrapping https://benchbook.ai |
| Vitest | 4.1.3 | 14 test files, ~2,417 lines; no CI workflow exists |
| pdf-parse | 2.4.5 | Declared in app deps; PDF work actually lives in Python scripts |
| Python pipeline | pdfplumber/PyPDF2, OpenAI embeddings, Pinecone | `scripts/ingest_local.py`, `scripts/search_server.py`, `benchbook-ai-infra` — not used by the app |

## Key directories

- **Database/migrations:** `supabase/migrations/` — `20260204_initial_schema.sql`, `20260206_waitlist.sql`, `20260209003525_init_chat_persistence.sql`, `20260214_research_patterns.sql`, `20260404_rate_limiting.sql`, `20260430_plan_seat_guardrails.sql`, `20260501_chat_trust_metadata.sql`.
- **Tests:** `app/src/__tests__/` (14 files).
- **Corpus/data:** `legal-corpus/{tca,trjpp,dcs}` + bundled `app/src/lib/legal-corpus-data.json` (6.78 MB, buildDate 2026-04-18T07:23:44Z).
- **Scripts:** `scripts/` — `prebuild-corpus.js`, `validate-corpus.js`, `ingest_local.py`, `search_server.py`, `deploy_*.sh`, `setup_supabase.sh`, `build-android.sh`, `build-ios.sh`.
- **Docs:** root-level (ARCHITECTURE.md, CODEX-*.md, PRODUCT.md, DEPLOY.md, MOBILE.md, etc.).

## Environment templates (names only — no values inspected)

- Root `.env.example` and `app/.env.example`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`, `USE_CLAUDE_API`, `ENABLE_PROMPT_CACHING`, `CLAUDE_HAIKU_MODEL`, `CLAUDE_SONNET_MODEL`, `CORPUS_CACHE_TTL_MINUTES`, `NEXT_PUBLIC_DEBUG`, `USE_MOCK_RESPONSES`, `LEGAL_CORPUS_PATH`.
- `benchbook-ai-infra/.env.example`: legacy SST/Pinecone/OpenAI variables (deprecated pipeline).
- No `.env` with real values found in the repo; `.gitignore` covers `.env*`, keys, certs. No secrets encountered.

## Generated/vendor/build artifacts (NOT substantive architecture)

`app/node_modules/` (~966 MB) · `app/.next/` (~348 MB) · `app/.vercel/` (~38 MB, legacy Vercel metadata) · `app/android/`, `app/ios/` native shells and their build dirs · Spotlight/OS artifacts none committed. All properly gitignored; none committed to history.

## Anomalies noted at inventory time

1. `legal-corpus/README.md` describes files that do not exist (`tca/title-36.html`, `tca/title-37.html`, `trjpp/all-rules.txt`, `dcs/*.pdf` — actual DCS files are `.txt`; `local-rules/` directory absent).
2. The only TCA files present are placeholder stubs for Titles 39/40/55 — the *excluded* titles.
3. `app/src/lib/legal-corpus-data.json` is the only operative corpus and is committed binary-large JSON, not regenerable from current repo contents.
4. Default Anthropic model IDs in `app/src/app/api/chat/route.ts:93-94` (`claude-haiku-4-5-20250414`, `claude-sonnet-4-5-20250414`) do not correspond to real Anthropic model IDs; production behavior depends on `CLAUDE_*_MODEL` env overrides.
