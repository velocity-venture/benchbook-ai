# 02 - Mock Surface QA Baseline (F5-05)

Date: 2026-07-02. The verified state this QA phase ran against.

## Code under review

Branch `feature/qa-research-mock-only` at `c3eef92` (single commit over base `d3533bd`): 34 created app files (16 lib modules, edge route, page, 10 test files, 6 checksum-synced scenario copies), 3 touch-point edits (hidden nav block, test:qa script, .env.example docs), F5-04 docs/manifests/validator. Full file map: `docs/fable5-mock-app-implementation/02_IMPLEMENTED_FILE_MAP.md` (including deviations D1-D6).

## Verification state at phase start (re-executed, not inherited)

| Check | Result |
|---|---|
| `npm test` | 23 files, 226 tests, all green (re-run at F5-05 start on this clone) |
| Scenario coverage | 57/57 F5-02 scenarios via the six suites |
| `next build` | PASS (re-run in this phase) |
| `npm run lint` | clean (re-run in this phase) |
| Validators E13A/E14A/E14B, F5-01..F5-04 | all PASS (re-run in this phase) |
| tsc | clean except 2 pre-existing legacy test errors (G2, outside F5-04/05 files) |

## Architecture facts relevant to QA judgments

1. The suites exercise the REAL modules: `createQaResearchHandler(deps)` receives the shipping mock adapter, scripted model client, guardrail service, and audit sink; no qa-research module is mocked away. QA conclusions therefore describe shipping behavior, not test doubles.
2. Misbehavior is driven by scripted generation profiles (fabricates_citation, cites_excluded_title, recommends_ruling, leaks_restricted_marker, injection_compliant, ...) and adapter/sink failure switches: the adversarial paths are first-class, repeatable exercises.
3. Determinism: identical inputs give identical envelopes; every QA row in this package is re-runnable via `npm run test:qa`.
4. The only unrepresentable things are deliberate: live targets, live model bindings, and persistence do not exist in the M1 graph.

## Environmental caveats for this cloud clone

The static chunk validator and disposable-DB dry run require gitignored `data/ingestion-expanded/` inputs that exist only on the Mac Studio; both fail there with FileNotFoundError before any database action. This is a documented environmental limitation, not a defect, and neither is required by this phase's command list.
