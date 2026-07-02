# Corpus Admin Dashboard

Date: 2026-06-29

## Candidate artifact workload

| Artifact | Rows | Decision status | Proposed action | Production impact |
| --- | --- | --- | --- | --- |
| unresolved_identity_patch_map_candidate.csv | 38 | pending_corpus_admin_review | review_identity_metadata | blocks_app_integration_or_display_until_resolved |
| unknown_effectivity_patch_map_candidate.csv | 54 | pending_effectivity_review | verify_effective_date_or_exclude_from_production | exclude_from_display_until_resolved |
| qa_signoff_decision_register_candidate.csv | 439 | pending_qa_signoff | corpus_admin_signoff_required | non_displayable_until_signoff |
| dcs_document_anchored_mapping_candidate.csv | 1146 | guardrail_reference_only_pending_mapping | manual_dcs_mapping_or_keep_guardrail_only | production_answer_authority_prohibited |
| restricted_lexis_disposition_register_candidate.csv | 2392 | restricted_internal_qa_only | license_display_review_required | non_displayable |
| pending_extraction_qa_decision_register_candidate.csv | 4198 | pending_extraction_qa | verify_extraction_before_any_display | non_displayable |
| dcs_handbook_reconciliation_evidence_register_candidate.csv | 8 | evidence_required | verify_source_status_and_extraction_path | blocks_resolution_of_historical_dcs_source_gap |

## Authority family workload

| Authority family | Rows |
| --- | --- |
| dcs_policies_procedures | 3430 |
| tca_title_36 | 2273 |
| tca_title_37 | 1790 |
| tenn_rules_evidence | 535 |
| tenn_rules_juvenile_practice_procedure | 247 |

## Review rule

Every row remains a candidate only. No row becomes displayable, searchable, embedded, or production eligible from this package.
