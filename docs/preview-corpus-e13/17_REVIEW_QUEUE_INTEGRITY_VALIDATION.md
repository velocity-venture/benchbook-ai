# Review Queue Integrity Validation

Date: 2026-06-29

## Validator command

```bash
python3 scripts/metadata_qa/validate_e13a_review_queues.py
```

## Required queue files

| Queue file | Target rows | Observed rows | Status |
|---|---:|---:|---|
| `unresolved_identity_units.csv` | 17 | 17 | Pass |
| `unresolved_identity_chunks.csv` | 21 | 21 | Pass |
| `unknown_effectivity_versions.csv` | 15 | 15 | Pass |
| `unknown_effectivity_chunks.csv` | 39 | 39 | Pass |
| `qa_signoff_required_versions_summary.csv` | 439 | 439 | Pass |
| `dcs_document_anchored_summary.csv` | 1,146 | 1,146 | Pass |
| `restricted_lexis_content_summary.csv` | 2,392 | 2,392 | Pass |
| `pending_extraction_qa_summary.csv` | 4,198 | 4,198 | Pass |
| `dcs_handbook_reconciliation_checklist.csv` | 8 | 8 | Pass |

## Integrity checks

| Check | Status |
|---|---|
| Required queue files exist | Pass |
| CSV files parse | Pass |
| Required count targets match | Pass |
| `queue_category` present | Pass |
| `proposed_action` present | Pass |
| Prohibited body-passage columns absent | Pass |
| Secret-shaped patterns absent | Pass |
| Row contents printed by validator | No |

## Notes

The validator checks only local queue files. It does not import Supabase libraries, contact a database, read source PDFs, read source body passages, generate embeddings, or modify app code.
