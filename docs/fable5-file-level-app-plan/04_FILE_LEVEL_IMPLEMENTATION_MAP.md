# 04 - File-Level Implementation Map (F5-03)

Date: 2026-07-02
Status: PLAN ONLY. Nothing listed here was created or modified in F5-03. Machine mirrors: `file-maps/future_mock_only_files_to_create.json`, `file-maps/future_mock_only_files_to_modify.json`, `file-maps/files_forbidden_until_live_db_phase.json`, `file-maps/test_file_plan.json`.

## 1. Files to CREATE in M1 (future mock-only phase, owner decision M-1)

### Route and page (2)

| # | Path | Responsibility |
|---|---|---|
| C1 | `app/src/app/api/qa-research/route.ts` | Edge route implementing the F5-02 request lifecycle: auth, fail-closed rate limit, input validation, GP guardrails, adapter retrieval, GQ checks, prompt assembly, streaming, GA checks, audit calls, extended SSE envelope. Binds ONLY the mock adapter in M1 via the environment factory |
| C2 | `app/src/app/(dashboard)/qa-research/page.tsx` | QA workspace page: consumes extended SSE vocabulary, renders MOCK_ONLY banner, target chip, envelope separation (answer_support vs reference_material), citation cards per doc 04 fields, refusal presentation, audit trace ID display |

### Library modules under `app/src/lib/qa-research/` (15)

| # | Path | Responsibility |
|---|---|---|
| C3 | `types.ts` | TypeScript types mirroring the six F5-02 contracts exactly (request, response, citation, refusal, guardrail decision, audit envelope) |
| C4 | `environment.ts` | Target pin resolution (`QA_RESEARCH_TARGET` env), MOCK_ONLY label, production sentinel always-refuse, boot validation (target, model ID allowlist, QA-mode flag default off), per-request echo check |
| C5 | `retrieval-adapter.ts` | `LegalRetrievalAdapter` interface (lookupCitationAlias, searchDisplayableChunks, deliverSpans) plus factory keyed by environment target. M1 registry contains ONLY the mock binding; any non-mock target throws at boot |
| C6 | `mock-retrieval-adapter.ts` | Adapter implementation over static fixtures; deterministic; simulates gate outcomes (zero-result, restricted-block, pending-block, unknown/future effectivity, as-of windows, error injection) |
| C7 | `mock-fixtures.json` | Synthetic corpus metadata: obviously-fake authorities (SYNTHETIC marker in every citation string and `synthetic: true` on every record), placeholder passages, no legal text. Shape per `mock-backend-design/mock_fixture_design.json` |
| C8 | `guardrail.ts` | GP-1..GP-9, GQ-1..GQ-5, GA-1..GA-4 pipeline; imports (never modifies) the existing `scope-guard.ts` for GP-3 topics; fail-closed wrapper; decision objects per contract |
| C9 | `guardrail-patterns.json` | Pattern data for the new classes (ruling, credibility, extra-record, web/general, DCS demand); versioned data, no code |
| C10 | `refusals.ts` | Refusal envelope builder plus SSE refusal streamer generalizing `streamScopeRefusal` |
| C11 | `refusal-templates.json` | Template keys to user-facing texts (owner-reviewed per P6); permissible-help blocks |
| C12 | `citation-verifier.ts` | Doc 04 verification levels against adapter results; granularity clamp; all-unresolved conversion to refusal |
| C13 | `audit-logger.ts` | `AuditLogger` interface (logRetrieval, logRefusal, logAnswer, logCitationVerification) with ordered-write and fail-closed semantics |
| C14 | `mock-audit-logger.ts` | In-memory sink with sequence capture for tests plus console-safe summary (hash-only) |
| C15 | `model-client.ts` | `ModelClient` interface (streamAnswer) plus factory; anthropic binding wraps existing SDK usage; mock binding for tests |
| C16 | `mock-model-client.ts` | Scripted generation profiles: well_behaved, fabricates_citation, cites_adjacent_authority, cites_excluded_title, cites_subsection, recommends_ruling, leaks_restricted_marker, injection_compliant, not_called guard |
| C17 | `prompt-contract.ts` | System prompt builder per F5-01 doc 09 L3: retrieved spans only, refusal hooks, TRE/DCS clauses, as-of statement; exports `SYSTEM_PROMPT_VERSION` for audit rows |

### Tests under `app/src/__tests__/qa-research/` (9 files plus scenario copies)

Detailed in doc 11 and `file-maps/test_file_plan.json`: six scenario-driven suites (retrieval, refusals, citations, guardrails, audit, environment), one static-safety suite, one scenario-sync suite, one boot-check suite, plus `scenarios/` holding checksum-synced copies of the six F5-02 mock-harness JSONs.

## 2. Files to MODIFY in M1 (all marked not_modified_in_f5_03; total 3, all low-risk)

| # | Path | Change | Risk |
|---|---|---|---|
| M-a | `app/src/components/sidebar.tsx` | One nav entry for QA Research, rendered only when the environment module reports a QA tier | Low; single conditional block |
| M-b | `app/package.json` | Optional `test:qa` script (`vitest run src/__tests__/qa-research`) | Trivial |
| M-c | `app/.env.example` (and root `.env.example` if present) | Document `QA_RESEARCH_TARGET`, `QA_RESEARCH_ENABLED`, `QA_MODE_EXCERPT_LOGGING` (default off) | Docs-only |

Nothing else changes. Explicitly unchanged: `api/chat/route.ts`, `chat/page.tsx`, all trust libs, all Supabase libs, middleware, configs, deploy files.

## 3. Files FORBIDDEN until the live-DB phase (F5-05+) or later approvals

Machine mirror lists every path; categories: all `supabase/` migration directories and config; `scripts/database_load/*`; `scripts/ingestion*/*`; `scripts/metadata_qa/*` (existing); source PDFs (`Benchbook.ai Database Files/`, untracked); `data/ingestion-expanded/*`; `data/source-manifest/*`; `app/src/lib/supabase/*` (no legal-retrieval bindings in M1); legacy chat route and page; `wrangler.toml`; deploy scripts; capacitor/mobile configs; `legal-corpus/*` and `scripts/prebuild-corpus.js` (old chain untouched until retirement decision); any file that would embed a database URL or production target.

## 4. Route/API boundary for later real retrieval (answering objective question 5)

The boundary is `LegalRetrievalAdapter` (C5). In F5-05, one new file `supabase-retrieval-adapter.ts` implements the interface over `lookup_citation_alias` and `search_displayable_chunks` plus the owner-chosen text-delivery mechanism (P3), and the factory gains a `preview_internal_qa` binding gated by O6/O2/O7 completion. No route, page, guardrail, verifier, or test file changes when the real adapter arrives; that isolation is the point of the interface.
