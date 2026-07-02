# Retained Batch Decision After E13-B

Date: 2026-06-29

## Retained batch

| Item | Value |
|---|---|
| Load batch id | `e84dc405-5ceb-4652-849d-e8467ac55a77` |
| Corpus build id | `7191eb09-8c7f-41c3-a0d9-740693c10799` |
| Build version | `phase-e10-preview-e84dc405-5ceb-4652-849d-e8467ac55a77` |

## E13-B finding

The retained batch remains useful for read-only QA. Displayable rows remain zero, family search probes return zero production rows, scope probes return zero displayable rows, alias lookup probes return zero production rows, DCS production eligibility remains zero, TRE non-limited scope remains zero, and embeddings remain zero.

## Recommendation

Keep the retained gated preview batch for continued read-only QA and local remediation planning. Do not execute rollback unless the owner separately approves cleanup.
