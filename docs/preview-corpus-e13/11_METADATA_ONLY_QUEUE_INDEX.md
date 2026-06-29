# Metadata-Only Queue Index

Date: 2026-06-29

## Queue files

| Queue file | Rows | Purpose |
|---|---:|---|
| `unresolved_identity_units.csv` | 17 | Unit-level unresolved identity review |
| `unresolved_identity_chunks.csv` | 21 | Chunk-level unresolved identity review |
| `unknown_effectivity_versions.csv` | 15 | Version-level effectivity remediation |
| `unknown_effectivity_chunks.csv` | 39 | Chunk-level effectivity remediation |
| `qa_signoff_required_versions_summary.csv` | 439 | Corpus-admin signoff queue |
| `dcs_document_anchored_summary.csv` | 1146 | DCS guardrail/reference disposition queue |
| `restricted_lexis_content_summary.csv` | 2392 | Restricted annotation, case-note, advisory, and editorial queue |
| `pending_extraction_qa_summary.csv` | 4198 | Pending extraction QA queue |
| `dcs_handbook_reconciliation_checklist.csv` | 8 | Historical handbook evidence checklist |

## Field boundary

Queue headers use approved metadata fields only. They do not include `text`, `chunk_text`, `body`, `body_text`, `source_text`, `content`, `excerpt`, `full_text`, `page_text`, or OCR text fields.

## Review boundary

The queues are suitable for corpus-admin triage. They are not approval to modify remote data, open display gates, generate embeddings, or connect the app to preview corpus data.
