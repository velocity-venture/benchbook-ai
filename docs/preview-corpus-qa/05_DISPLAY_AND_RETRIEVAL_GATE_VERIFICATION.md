# Display And Retrieval Gate Verification

Date: 2026-06-28

## Display views

| Gate | Count |
|---|---:|
| `v_current_displayable_chunks` | 0 |
| `v_black_letter_current_chunks` | 0 |
| `v_internal_qa_restricted_chunks` | 6,590 |

## Retrieval probes

| Probe | Count |
|---|---:|
| `search_displayable_chunks('qa probe', date '2026-06-28', null, 20)` | 0 |
| `lookup_citation_alias('tennrjuvp101', date '2026-06-28')` | 0 |

The probes were count-only. No returned corpus text was requested or printed.

## Display status

| Display status | Chunks |
|---|---:|
| `pending_extraction_qa` | 4,198 |
| `restricted_pending_license_review` | 2,392 |

Pending or restricted rows in the displayable view: 0.

## Answer scope

| Answer scope | Chunks |
|---|---:|
| `general_answer_authority` | 1,059 |
| `guardrail_reference_only` | 3,054 |
| `limited_evidentiary_procedural` | 533 |
| `not_answer_authority` | 1,944 |

## Conclusion

Display and retrieval gates remain closed. The preview corpus is retained for database QA only and is not production-displayable.
