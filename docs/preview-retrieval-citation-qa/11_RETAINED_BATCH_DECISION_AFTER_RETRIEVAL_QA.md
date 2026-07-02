# Retained Batch Decision After Retrieval QA

Date: 2026-06-29

## Retained batch

| Item | Value |
|---|---|
| Load batch id | `e84dc405-5ceb-4652-849d-e8467ac55a77` |
| Corpus build id | `7191eb09-8c7f-41c3-a0d9-740693c10799` |
| Build version | `phase-e10-preview-e84dc405-5ceb-4652-849d-e8467ac55a77` |

## E12-B finding

The retained preview batch remains gated:

- displayable rows: 0;
- search displayable probes: 0 rows;
- citation lookup probes: 0 rows;
- DCS production-eligible rows: 0;
- TRE non-limited-scope rows: 0;
- future or unknown-effectivity displayable rows: 0;
- populated embeddings: 0.

## Recommendation

Keep the retained gated preview batch for continued read-only QA unless the owner wants a clean preview baseline. Do not roll it back in E12-B.

Rollback should require separate owner approval and a reviewed rollback artifact.
