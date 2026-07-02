# QA Dashboard - Mock Harness Coverage (F5-03)

Date: 2026-07-02. Audience: QA reviewer. Canon: F5-02 mock-harness (57 scenarios), all mapped to planned test files.

## Scenario coverage map (planned)

| Family | Scenarios | Planned test file | Plan artifact | Covered |
|---|---|---|---|---|
| MR retrieval | 10 | qa-route-retrieval.test.ts | test-plan/mock_retrieval_tests.json | 10/10 |
| RF refusals | 14 | qa-route-refusals.test.ts | test-plan/mock_refusal_tests.json | 14/14 |
| MC citations | 8 | qa-route-citations.test.ts | test-plan/mock_citation_tests.json | 8/8 + T-CIT-MISSING |
| GG guardrails | 12 | qa-route-guardrails.test.ts | test-plan/mock_guardrail_tests.json | 12/12 |
| MA audit | 7 | qa-route-audit.test.ts | test-plan/mock_audit_log_tests.json | 7/7 |
| ME environment | 6 | qa-route-environment.test.ts + qa-boot-checks.test.ts | test-plan/mock_environment_target_tests.json | 6/6 + 4 boot cases |

## Objective suites (beyond the scenario canon)

| Objective | Plan artifact | Cases |
|---|---|---|
| Closed universe holds (39/40/55, web, non-authorized excluded) | test-plan/excluded_scope_tests.json | 8 behavioral + 2 static |
| No general legal fallback | test-plan/no_general_fallback_tests.json | 5 behavioral + 4 static |

## Integrity mechanisms

- `scenario-sync.test.ts` sha256-pins the local scenario copies to the F5-02 canon; edits to either side without the other fail CI.
- `qa-route-static-safety.test.ts` runs source scans (8 scan classes) so prohibited imports fail before behavior is even exercised.
- Fixtures are SYNTHETIC-namespaced (TCA 36-9-9xx style reserved fake ranges); a fixture lint asserts no excluded-title namespaces appear.

## What QA should verify at M1 exit

1. All 57 scenario cases plus 20 additional planned cases green under `npm test`.
2. The MOCK ONLY banner and SYNTHETIC citation prefixes visible in every answer screenshot.
3. Refusal wording matches the owner-reviewed template set (P6) exactly.
4. `getRecords(trace_id)` reconstructs every demo request end to end.

## Status caveat

Everything on this page is PLANNED; no test files exist at F5-03 close. This dashboard becomes a live checklist during M1.
