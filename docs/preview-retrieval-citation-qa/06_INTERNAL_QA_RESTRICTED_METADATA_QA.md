# Internal QA Restricted Metadata QA

Date: 2026-06-29

## Internal QA view

| Check | Count |
|---|---:|
| `v_internal_qa_restricted_chunks` | 6,590 |

## Display status

| Display status | Chunks |
|---|---:|
| `pending_extraction_qa` | 4,198 |
| `restricted_pending_license_review` | 2,392 |

## Answer scope

| Answer scope | Chunks |
|---|---:|
| `general_answer_authority` | 1,059 |
| `guardrail_reference_only` | 3,054 |
| `limited_evidentiary_procedural` | 533 |
| `not_answer_authority` | 1,944 |

## Authority family

| Family | Chunks |
|---|---:|
| `dcs_policies_procedures` | 2,014 |
| `tca_title_36` | 2,197 |
| `tca_title_37` | 1,644 |
| `tenn_rules_evidence` | 533 |
| `tenn_rules_juvenile_practice_procedure` | 202 |

## Review metadata

Metadata-column presence checks found 49 expected review-support columns across `authority_chunks`, `authority_units`, `authority_versions`, and `source_files`, including IDs, source hashes, citation fields, display status, answer scope, version status, effectivity fields, warning support, and metadata JSON.

## Conclusion

The retained preview batch supports future internal QA queues without opening production display. The metadata posture is useful for review, but the batch remains non-displayable by design.
