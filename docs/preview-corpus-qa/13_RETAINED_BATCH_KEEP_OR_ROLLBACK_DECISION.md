# Retained Batch Keep Or Rollback Decision

Date: 2026-06-28

## Retained batch

| Item | Value |
|---|---|
| Load batch id | `e84dc405-5ceb-4652-849d-e8467ac55a77` |
| Corpus build id | `7191eb09-8c7f-41c3-a0d9-740693c10799` |
| Build version | `phase-e10-preview-e84dc405-5ceb-4652-849d-e8467ac55a77` |
| Target | `benchbook-ai` |
| Target ref | `clerihqbjyczarqkiqnb` |

## Decision options

| Option | E11 assessment |
|---|---|
| Keep retained gated preview batch | Recommended for E12-A and E12-B. |
| Roll back now | Not necessary based on E11 gates, but available if owner wants a clean preview baseline. |
| Retain only until specific QA tests complete | Acceptable and preferred if preview retention risk is a concern. |
| Reload later after cleanup | Useful after blocker triage, but not required before read-only QA. |

## Recommendation

Keep the retained gated preview batch for further internal database QA, specifically E12-A blocker triage and E12-B read-only retrieval/citation QA.

Do not connect the app, generate embeddings, open display gates, or promote production display while the retained batch remains in this state.

## Rollback status

No rollback was executed in E11. Any future rollback requires separate owner approval.
