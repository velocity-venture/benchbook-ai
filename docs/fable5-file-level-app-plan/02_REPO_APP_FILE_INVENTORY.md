# 02 - Repo App File Inventory (F5-03)

Date: 2026-07-02
Machine mirror: `file-maps/existing_app_file_inventory.json`. Classification detail per surface: F5-02 doc 01 stands; this inventory adds the file-level granularity M1 planning needs.

## 1. App source (57 TypeScript files under `app/src/`)

| Group | Files | Classification | M1 relevance |
|---|---|---|---|
| API routes | `app/api/chat/route.ts`, `app/api/research-patterns/route.ts`, `app/api/waitlist/route.ts`, `app/auth/callback/route.ts` | Adopt with revision (chat plumbing) / Adopt | READ as pattern source; NOT modified in M1 |
| Dashboard pages | `(dashboard)/{chat,dashboard,tca,trjpp,dcs-policies,onboarding,settings}/page.tsx`, `layout.tsx`, `error.tsx` | Adopt / Adopt with revision | chat/page.tsx is the UI pattern source for the new QA page; NOT modified in M1 |
| Marketing/auth pages | `page.tsx`, `login/`, `privacy/`, `terms/`, root `layout.tsx` | Adopt | Untouched |
| Trust libs | `lib/{scope-guard,citation-validator,hallucination-guard,corpus-coverage,query-router}.ts` | Adopt with revision | IMPORTED by new M1 modules, never modified in M1 |
| Persistence/infra libs | `lib/chat-persistence.ts`, `lib/supabase/{client,server,middleware,env}.ts`, `lib/utils.ts`, `middleware.ts` | Adopt | Imported unchanged; `env.ts` is the boot-check pattern source |
| Flat-JSON data libs | `lib/{tca-data,trjpp-data,dcs-data}.ts`, `lib/legal-corpus-data.json` | Adopt with revision then Archive | Explicitly excluded from every M1 import path in the new QA modules (fallback-absence test T-NF series) |
| Components | `components/ui/*` (5), `components/{sidebar,research-patterns,voice-input}.tsx`, `contexts/preferences-context.tsx` | Adopt (voice-input NFR) | sidebar.tsx is the single M1 nav modification |
| Types | `types/speech-recognition.d.ts` | Adopt | Untouched |

## 2. Tests (14 files, `app/src/__tests__/`)

All Adopt. Conventions M1 must mirror (verified by reading `chat-route-input-validation.test.ts`): vi.mock of `@anthropic-ai/sdk` and Supabase server module, dynamic route import per test (`importRouteWithMocks` pattern), Request cast to NextRequest, constants asserted against route limits. No vitest.config file exists; vitest runs on defaults via `npm test` (`vitest run`).

## 3. Config and deployment

| File | Classification | M1 relevance |
|---|---|---|
| `app/package.json` | Adopt with revision | Optional single-line M1 change (`test:qa` convenience script); `prebuild` corpus chain untouched in M1 |
| `app/tsconfig.json` | Adopt | `@/*` alias confirmed; new modules live under it |
| `app/next.config.mjs`, `postcss`, `tailwind` | Adopt | Untouched |
| `app/wrangler.toml` | Adopt with revision (target-control notes later) | FORBIDDEN in M1 |
| `app/capacitor.config.ts`, `android/`, `ios/` | Adopt (dormant) | Untouched |
| `.env.example` files | Adopt with revision | M1 documents three new env keys (doc 10); example-file edit only |
| Deploy scripts (`scripts/deploy-production.sh`, `deploy_supabase.sh`, `setup_supabase.sh`) | Adopt with revision (allowlists later) | FORBIDDEN in M1 |

## 4. Supabase schema files (read-only context for M1)

`supabase/migrations/` (7 app migrations plus 10 E6 rehearsal files), `supabase/migrations_draft/` (10), `supabase/migrations_preview/` (10), `supabase/config.toml`, `supabase/seed-demo-data.sql`. ALL FORBIDDEN to M1. The RPC signatures the future real adapter will bind to (F5-05) are documented in F5-02 doc 03 from these files; M1 needs no schema access at all.

## 5. Pipeline scripts (out of app scope, forbidden to M1)

`scripts/database_load/*`, `scripts/ingestion*/*`, `scripts/metadata_qa/*`, `scripts/source_manifest/*`: forbidden. `scripts/launch_readiness/*`: validators only; M1 adds nothing here (harness lives in app tests per doc 11 of this package).

## 6. Verified integration absence (re-checked this pass)

`grep -r 'legal_authority\|authority_chunks\|lookup_citation_alias\|search_displayable_chunks' app/src/` returns zero hits at `a918f6b`.
