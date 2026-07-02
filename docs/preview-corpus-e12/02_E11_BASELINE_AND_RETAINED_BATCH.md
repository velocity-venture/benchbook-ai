# E11 Baseline And Retained Batch

Date: 2026-06-28

## Retained preview batch

| Item | Value |
|---|---|
| Load batch id | `e84dc405-5ceb-4652-849d-e8467ac55a77` |
| Corpus build id | `7191eb09-8c7f-41c3-a0d9-740693c10799` |
| Build version | `phase-e10-preview-e84dc405-5ceb-4652-849d-e8467ac55a77` |
| Preview target from E11 | `benchbook-ai` |
| Preview project ref from E11 | `clerihqbjyczarqkiqnb` |

E12-A did not contact Supabase, so these target values are carried forward from E11 documentation rather than newly queried.

## E11 row-count baseline

| Item | Count |
|---|---:|
| Source files | 647 |
| Source file memberships | 677 |
| Authority families | 5 |
| Authority units | 1,321 |
| Authority versions | 1,343 |
| Authority chunks | 6,590 |
| Citation aliases | 3,598 |
| Chunk warnings | 359 |
| Extraction warnings | 864 |

## E11 gate baseline

| Gate | Count |
|---|---:|
| `v_current_displayable_chunks` | 0 |
| `v_black_letter_current_chunks` | 0 |
| `v_internal_qa_restricted_chunks` | 6,590 |
| DCS production-eligible chunks | 0 |
| TRE non-limited-scope chunks | 0 |
| Populated embeddings | 0 |
| Broad `authority_chunks` policies | 0 |

## E12-A local validation

The E12-A local dry run reproduced the same promoted counts in a disposable local database and then dropped that database. The local dry run reported:

| Check | Result |
|---|---|
| Remote database connection | false |
| Body text printed | false |
| Embeddings generated | false |
| Local disposable database created | true |
| Local disposable database dropped | true |
| Draft migrations applied locally | 10 |
| Local displayable view count | 0 |
| Local internal QA restricted view count | 6,590 |
