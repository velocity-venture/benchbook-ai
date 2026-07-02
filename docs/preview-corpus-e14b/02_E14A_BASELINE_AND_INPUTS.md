# E14-A Baseline And Inputs

Date: 2026-06-29

## Inputs used

| Candidate artifact | Source queues | Rows |
| --- | --- | --- |
| unresolved_identity_patch_map_candidate.csv | unresolved_identity_units.csv, unresolved_identity_chunks.csv | 38 |
| unknown_effectivity_patch_map_candidate.csv | unknown_effectivity_versions.csv, unknown_effectivity_chunks.csv | 54 |
| qa_signoff_decision_register_candidate.csv | qa_signoff_required_versions_summary.csv | 439 |
| dcs_document_anchored_mapping_candidate.csv | dcs_document_anchored_summary.csv | 1146 |
| restricted_lexis_disposition_register_candidate.csv | restricted_lexis_content_summary.csv | 2392 |
| pending_extraction_qa_decision_register_candidate.csv | pending_extraction_qa_summary.csv | 4198 |
| dcs_handbook_reconciliation_evidence_register_candidate.csv | dcs_handbook_reconciliation_checklist.csv | 8 |

## Baseline preserved

- Displayable rows remain zero in the retained preview posture.
- Restricted and pending QA rows remain non-displayable.
- DCS remains guardrail/reference only.
- TRE remains limited-scope.
- Unknown and future effectivity rows remain gated.
- E14-A templates remain metadata-only.
