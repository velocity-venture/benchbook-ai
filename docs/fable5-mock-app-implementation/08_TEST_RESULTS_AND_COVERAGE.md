# 08 - Test Results and Coverage (F5-04 / M1)

Date: 2026-07-02. Machine mirror: `manifests/test_result_manifest.json`.

## Results

| Check | Result |
|---|---|
| `npm test` (full suite: 14 legacy files + 9 new) | 23 files, 226 tests, ALL PASS; run twice consecutively, both green (S13 double-run gate) |
| New qa-research tests | 110 across 9 files |
| Legacy suite | Unmodified, green at every step |
| `npx next build` | PASS; `/qa-research` (2.58 kB) and `/api/qa-research` compile on the edge runtime |
| `npm run lint` | No warnings or errors |
| `npx tsc --noEmit` | Clean for all F5-04 files; 2 PRE-EXISTING errors remain in legacy test files untouched by this phase (see below) |

### Pre-existing typecheck errors (baseline condition, not introduced here)

1. `src/__tests__/chat-route-corpus-loading-errors.test.ts(67)`: vi.doMock factory typing under vitest 4 (TS2769).
2. `src/__tests__/supabase-client-creation.test.ts(273)`: `responseCookieSet` property probe on NextResponse (TS2339).

Both files are unmodified from baseline `d3533bd` (verified by `git status`); the errors reproduce with the F5-04 files excluded. They do not affect `vitest run` (all 226 tests pass) or `next build` (tests are outside the build graph).

## Scenario coverage: 57/57

| Family | Scenarios | Suite | Status |
|---|---|---|---|
| MR retrieval | 10 | qa-route-retrieval.test.ts | 10/10 green |
| RF refusals | 14 | qa-route-refusals.test.ts | 14/14 green |
| MC citations | 8 | qa-route-citations.test.ts | 8/8 green (+ T-CIT-MISSING) |
| GG guardrails | 12 | qa-route-guardrails.test.ts | 12/12 green |
| MA audit | 7 | qa-route-audit.test.ts | 7/7 green |
| ME environment | 6 | qa-route-environment.test.ts (+ boot matrix in qa-boot-checks) | 6/6 green |

Scenario copies are sha256-pinned to the F5-02 canon by scenario-sync.test.ts (which also asserts the 57 count).

## Beyond the canon (additional cases)

Boot matrix (7 cases incl. flag variants and model-id rejection), 19 static forbidden-token scans plus fixture lint and module-graph coverage checks, contract-shape drift tests (refusal + citation objects vs contract JSONs, kind-enum equality), sink content-rule rejection tests (prohibited fields, passage-length, unhashed query/answer), input validation matrix (5 malformed shapes), trace-resolution test, GP-8 plain-injection test, MC-03 verifier unit test, claim-extraction dedupe test.

## Test mechanics

Constructor injection via `createQaResearchHandler(deps)`: real modules under test, no vi.mock of qa-research code. The mock adapter/model/audit sink are the M1 production bindings themselves, so the suites exercise the exact shipping code paths.
