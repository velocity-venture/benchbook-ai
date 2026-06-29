# Production Retrieval Gate QA

Date: 2026-06-29

## Display views

| Gate | Count |
|---|---:|
| `v_current_displayable_chunks` | 0 |
| `v_black_letter_current_chunks` | 0 |
| `v_internal_qa_restricted_chunks` | 6,590 |

## Search probes

| Probe | Result rows |
|---|---:|
| Generic dependency and neglect probe | 0 |
| Generic custody probe | 0 |
| Generic procedure probe | 0 |

The search probes used `search_displayable_chunks(...)` and returned no rows.

## Exclusion checks

| Check | Count |
|---|---:|
| Pending or restricted rows in displayable view | 0 |
| Non-production-approved rows in displayable view | 0 |
| Future or unknown-effectivity displayable rows | 0 |
| DCS production-eligible rows | 0 |
| DCS rows in displayable view | 0 |

## Conclusion

Production-facing retrieval remains closed. The preview corpus cannot currently feed a judge-facing answer path through the displayable views or search RPC.
