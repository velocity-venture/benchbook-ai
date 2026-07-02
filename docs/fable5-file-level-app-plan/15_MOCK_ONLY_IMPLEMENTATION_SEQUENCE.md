# 15 - Mock-Only Implementation Sequence (F5-03)

Date: 2026-07-02
The exact sequence Codex follows if/when the owner approves mock-only app code changes (decision M-1). Answers objective question 11. Branch: feature branch `feature/qa-research-mock-only` off `refactor/codex-gpt55-launch-prep` (or the current branch itself only if the owner explicitly prefers; the feature branch is recommended).

## Commit-by-commit sequence (each commit: tests green, lint clean, typecheck clean, guardrail diff scan clean)

| Step | Commit content | Files | Gate proven |
|---|---|---|---|
| S1 | Types plus contract-shape drift test | `lib/qa-research/types.ts`, `__tests__/qa-research/scenarios/` (6 synced copies), `scenario-sync.test.ts`, contract-shape section of `qa-route-static-safety.test.ts` | R4, R5 pinned before any feature code |
| S2 | Static-safety scans (they fail red on violations from here forward) | rest of `qa-route-static-safety.test.ts` | R1 pinned |
| S3 | Environment control plus boot checks | `environment.ts`, `qa-boot-checks.test.ts`, `.env.example` entries | D1/D7, ME-04/06 |
| S4 | Fixtures plus mock adapter | `mock-fixtures.json`, `retrieval-adapter.ts`, `mock-retrieval-adapter.ts` | Fixture design per doc 05; R6 marker test stub |
| S5 | Guardrail pipeline plus patterns | `guardrail.ts`, `guardrail-patterns.json` | GP/GQ/GA units |
| S6 | Refusals plus templates | `refusals.ts`, `refusal-templates.json` | Doc 05 variants (template texts flagged for owner review P6 in the PR) |
| S7 | Citation verifier | `citation-verifier.ts` | Doc 04 levels, builder exclusivity |
| S8 | Audit logger interface plus mock sink | `audit-logger.ts`, `mock-audit-logger.ts` | Content-rule rejections |
| S9 | Model client interface plus scripted mock | `model-client.ts`, `mock-model-client.ts`, `prompt-contract.ts` | R8 prompt-pin test |
| S10 | The route | `app/api/qa-research/route.ts` | Lifecycle assembly; T2/T3 suites start passing end to end |
| S11 | Scenario suites completed | `qa-route-{retrieval,refusals,citations,guardrails,audit,environment}.test.ts` | Full 57-scenario coverage |
| S12 | The page plus nav touch | `(dashboard)/qa-research/page.tsx`, `components/sidebar.tsx` (one block), `package.json` (optional script) | Doc 07 UI rules; R3/R10 isolation |
| S13 | Full-suite double run plus completion report | `docs/` M1 completion report (metadata only) | Exit gate: all suites green twice; existing 14 files green; report includes verified_resolved policy note for owner |

## Rules across all steps

- No commits outside the listed files; anything unexpected stops the phase (SC-11).
- The existing 14-file suite runs in every step; a single legacy failure stops work.
- No new dependencies; genuine need stops for owner review (doc 13 section 3).
- Template texts (S6) and the M1 completion report (S13) are flagged for the owner explicitly in the PR description.
- The feature branch merges back to `refactor/codex-gpt55-launch-prep` only after owner review of the completion report.

## What M1 completion unlocks (not part of M1)

E15-B/F5-05 preparation may then bind a real adapter under the gate set in doc 10 section 4. Nothing in M1's merge changes any gate, corpus row, or database state anywhere.
