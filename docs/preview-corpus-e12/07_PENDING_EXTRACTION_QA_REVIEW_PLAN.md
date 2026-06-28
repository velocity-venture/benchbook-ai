# Pending Extraction QA Review Plan

Date: 2026-06-28

## Summary

| Item | Count |
|---|---:|
| Pending extraction QA chunks | 4,198 |
| Restricted chunks | 2,392 |
| Displayable chunks | 0 |

## Pending chunks by family

| Family | Pending chunks |
|---|---:|
| `dcs_policies_procedures` | 2,014 |
| `tca_title_36` | 1,019 |
| `tca_title_37` | 992 |
| `tenn_rules_evidence` | 85 |
| `tenn_rules_juvenile_practice_procedure` | 88 |

## Pending chunks by type

| Chunk type | Pending chunks |
|---|---:|
| `black_letter_text` | 1,123 |
| `history` | 1,061 |
| `policy_text` | 747 |
| `manual` | 363 |
| `protocol` | 303 |
| `metadata` | 219 |
| `guide` | 176 |
| `unknown` | 160 |
| `work_aid` | 46 |

## Triage buckets

| Bucket | Count | Work plan |
|---|---:|---|
| High priority | 3,197 | Start with black-letter statutory/rule rows and high-risk family-law or juvenile-law cues. |
| Medium priority | 920 | Review lower-risk current rows after high-priority legal authority is done. |
| Needs effective-date review | 81 | Keep excluded until dates and version status are confirmed. |
| Restricted by license | 2,392 | Keep outside production display and retrieval. |
| Needs source verification | 2,014 DCS rows | Keep DCS guardrail/reference only until source currency and identity are verified. |

## Practical QA sequence

1. Verify source-file linkage and text hash integrity.
2. Review black-letter Title 36, Title 37, and TRJPP rows before DCS support material.
3. Review effectivity warnings before any display approval.
4. Keep history, metadata, and unknown chunks out of answer authority unless specifically approved.
5. Require owner or delegated corpus-admin signoff before any row moves toward production display.
