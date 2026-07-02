# F5-04 Report: Mock-Only QA Research App Implementation (M1)

Date: 2026-07-02
Phase: F5-04 / M1, executed under owner approvals M-1 (mock-only implementation), M-2 (policy defaults ratified as a block), M-3 (default branch)
Branch: `feature/qa-research-mock-only` off `refactor/codex-gpt55-launch-prep` at `d3533bd`
Author role: mock-only app implementation; no database, no live data, no display-gate change anywhere.

## 1. What was built

The first working binding of the app integration contract, entirely against synthetic data:

- **API route** `app/src/app/api/qa-research/route.ts` (edge runtime): a thin wrapper over `lib/qa-research/route-handler.ts`, which implements the full F5-02 request lifecycle: boot validation, input validation, GP-1..9 pre-retrieval guardrails, adapter retrieval, GQ post-retrieval gates, prompt assembly, scripted mock generation, GA post-generation gates with citation verification, ordered audit writes, SSE envelope (`environment`, `delta`, `citations`, `sources`, `refusal`, `confidence`, `coverage`, `done`).
- **16 library modules** under `app/src/lib/qa-research/`: contract types, environment target control, `LegalRetrievalAdapter` interface + mock binding + synthetic fixtures, guardrail pipeline + pattern data, refusal builder + owner-reviewable templates, citation verifier, audit logger interface + in-memory mock sink, model client interface + scripted mock profiles, prompt contract, and the route handler pipeline.
- **QA page** `app/src/app/(dashboard)/qa-research/page.tsx`: pure renderer of the SSE events with the MOCK ONLY banner, target chip, citation cards, reference-material section, refusal panel, audit trace line, and no-production footer. Auth comes from the existing dashboard layout; the page itself performs no data access.
- **10 test files** (9 suites + shared harness) plus 6 checksum-synced scenario copies: all 57 F5-02 scenarios implemented and green, plus boot matrix, static-safety scans, contract-shape drift checks, and sink content-rule tests. 110 new tests; full suite 226/226 green twice consecutively.
- **3 touch-point modifications**: one conditional nav block in `sidebar.tsx` (hidden by default), one `test:qa` script in `app/package.json`, documentation-only entries in `app/.env.example`.

## 2. The twelve objectives, each proven by tests

| # | Objective | Proof |
|---|---|---|
| 1 | Mock retrieval follows the response contract | MR suite (10/10); contract-shape test |
| 2 | Citations mandatory for non-refusal answers | T-CIT-MISSING, MC-08, RF-14 (conversion) |
| 3 | Refusals for excluded scope and impermissible requests | RF suite (14/14) |
| 4 | DCS guardrail/reference only | MR-06, MC-07, RF-07, GG-06 |
| 5 | TRE limited-scope | MR-04 (in scope), MR-05 (dropped without evidentiary intent), MC-06 |
| 6 | Restricted/pending/unknown/future material blocked | RF-08..RF-11, MA-05 |
| 7 | Titles 39/40/55, web, general fallback refused | RF-02..05, GG-02, MC-04, static scans |
| 8 | Ruling/credibility/extra-record requests refused | RF-06/12/13, GG-03/04/05, GG-08 (response side) |
| 9 | Audit objects for every request | MA suite (7/7) plus per-suite audit assertions |
| 10 | Environment labeled MOCK_ONLY | ME suite (6/6), transport header, page banner |
| 11 | No Supabase import / db URL / service-role / embeddings / web path | static-safety suite (19 forbidden-token scans over the module graph) |
| 12 | No legal body text anywhere | SYNTHETIC fixture lint; audit sink content-rule enforcement; validator scans |

## 3. Fail-closed posture (implemented, not aspirational)

Adapter failure, gate-attestation failure, as-of-window violations, guardrail classifier crashes, audit-write failures, citation verification failures, and model-output violations each convert to a refusal or error envelope; no path degrades to an unsourced or unaudited answer. The audit sink additionally REJECTS (throws on) prohibited field names, passage-length strings, and unhashed queries, so content-rule violations fail structurally.

## 4. Production blocking layers

Type enum without a production member; factory registries with exactly one `mock_only` binding (`TargetNotAvailableError` otherwise); boot validation with the loud always-refuse posture for production-shaped values (ME-04); per-request echo assertion (ME-05/SC-1); UI banner + chip + footer; static scans; and the M1 diff touches no deploy or wrangler config.

## 5. Deviations from the F5-03 file map (all recorded in doc 02)

1. `lib/qa-research/route-handler.ts` added: Next.js route modules may only export route fields, so the injectable pipeline lives behind the route.
2. `__tests__/qa-research/support/harness.ts` added: shared test harness (deps builder + SSE parser).
3. `getChunkMetadata` added to the adapter interface: metadata-only lookup needed for MC-02 verified_resolved demotion (no span fetch, per M-2).
4. Live model binding NOT included: the M1 model registry is mock-only, so the qa-research graph has no network path at all; the provider binding arrives with a later phase behind the same interface.
5. `NEXT_PUBLIC_QA_RESEARCH_ENABLED` documented for nav visibility (client components cannot read server-only flags); the route remains governed by the server-side flag regardless.
6. Test imports use relative paths (the project's vitest setup has no path-alias resolution; existing suites rely on `vi.doMock` by module id, which the qa-research suites deliberately avoid to test real modules).

## 6. Verification summary (details in doc 08)

Full suite 226/226 twice; `next build` passes with `/qa-research` and `/api/qa-research` on the edge runtime; `next lint` clean; `tsc --noEmit` clean except two PRE-EXISTING errors in legacy test files untouched by this phase (`chat-route-corpus-loading-errors.test.ts`, `supabase-client-creation.test.ts`, both vitest-4/next typing issues present at baseline `d3533bd`). All six repo validators pass; the F5-04 validator passes; guardrail scans clean (known benign hits documented in the forbidden-path manifest).

## 7. What this phase did NOT do

No Supabase command, no database contact (preview or production), no live retrieval binding, no preview reload, no corpus rows loaded, no embeddings, no migration/loader/ingestion/PDF/generated-corpus change, no display-gate change, no new dependencies, no change to `/api/chat` or the chat page or any trust lib, no secrets, no legal body text.

## 8. Owner follow-ups

1. Review the refusal template texts (`lib/qa-research/refusal-templates.json`, P6 carry-over) in this PR.
2. Note the `verified_resolved` demotion behavior (M-2 item 1) demonstrated by MC-02.
3. Next phase options in doc 11: internal QA exercise of the mock surface, or F5-05 preparation (live adapter design under the O6+O2+O7 gate chain). O1 (E14C corpus review) remains the program critical path.
