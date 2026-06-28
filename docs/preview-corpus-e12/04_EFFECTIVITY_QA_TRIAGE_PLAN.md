# Effectivity QA Triage Plan

Date: 2026-06-28

This is a metadata-only plan. It does not include legal body text or source excerpts.

## Summary

| Item | Count |
|---|---:|
| Authority versions | 1,343 |
| Current versions | 1,312 |
| Future-effective versions | 16 |
| Future-effective chunks | 120 |
| Unknown-effectivity versions | 15 |
| Unknown-effectivity chunks | 39 |
| Current versions with future end date | 13 |
| Versions requiring QA signoff | 439 |
| High-risk version keys from local dry run | 406 |

The local metadata reconstruction produced one extra QA-signoff candidate when topic cues were grouped outside the database. The authoritative count remains 439 from E11 and the local dry-run database verification.

## Unknown-effectivity queue

| # | Family | Source file | Chunks | Chunk types | Warning codes | Risk cues |
| --- | --- | --- | ---: | --- | --- | --- |
| 1 | `tca_title_37` | `37_2_203_37_3_405.pdf` | 3 | `annotation_candidate:1, black_letter_text:1, history:1` | `effective_dated_version_unit` |  |
| 2 | `tca_title_37` | `37_2_203_37_3_405.pdf` | 3 | `annotation_candidate:1, black_letter_text:1, history:1` | `effective_dated_version_unit` |  |
| 3 | `tca_title_37` | `37_2_203_37_3_405.pdf` | 1 | `black_letter_text:1` | `effective_dated_version_text` |  |
| 4 | `tca_title_37` | `37_2_203_37_3_405.pdf` | 3 | `annotation_candidate:1, black_letter_text:1, history:1` | `effective_dated_version_unit` | `termination_parental_rights` |
| 5 | `tca_title_37` | `37_2_203_37_3_405.pdf` | 3 | `annotation_candidate:1, black_letter_text:1, history:1` | `effective_dated_version_unit` | `custody` |
| 6 | `tca_title_37` | `37_2_203_37_3_405.pdf` | 3 | `annotation_candidate:1, black_letter_text:1, history:1` | `effective_dated_version_unit` |  |
| 7 | `tca_title_37` | `37_2_203_37_3_405.pdf` | 3 | `annotation_candidate:1, black_letter_text:1, history:1` | `effective_dated_version_unit` |  |
| 8 | `tca_title_37` | `37_2_203_37_3_405.pdf` | 3 | `annotation_candidate:1, black_letter_text:1, history:1` | `effective_dated_version_unit` | `custody, removal` |
| 9 | `tca_title_37` | `37_2_203_37_3_405.pdf` | 3 | `annotation_candidate:1, black_letter_text:1, history:1` | `effective_dated_version_unit` |  |
| 10 | `tca_title_37` | `37_2_203_37_3_405.pdf` | 1 | `black_letter_text:1` | `effective_dated_version_text` |  |
| 11 | `tca_title_37` | `37_2_203_37_3_405.pdf` | 3 | `annotation_candidate:1, black_letter_text:1, history:1` | `effective_dated_version_unit` |  |
| 12 | `tca_title_37` | `37_2_203_37_3_405.pdf` | 3 | `annotation_candidate:1, black_letter_text:1, history:1` | `effective_dated_version_unit` | `removal, termination_parental_rights` |
| 13 | `tca_title_37` | `37_2_203_37_3_405.pdf` | 3 | `annotation_candidate:1, black_letter_text:1, history:1` | `effective_dated_version_unit` |  |
| 14 | `tca_title_37` | `37_2_203_37_3_405.pdf` | 1 | `black_letter_text:1` | `effective_dated_version_text` | `custody` |
| 15 | `tca_title_37` | `37_2_203_37_3_405.pdf` | 3 | `annotation_candidate:1, black_letter_text:1, history:1` | `effective_dated_version_unit` |  |

## QA buckets

| Bucket | Count | Required action |
|---|---:|---|
| Current-law confidence issues | 13 | Confirm the current version and future end date before any display approval. |
| Future-effective issues | 16 versions, 120 chunks | Keep as-of-date gated and verify effective start date handling. |
| Unknown effective date issues | 15 versions, 39 chunks | Exclude until a reliable status is assigned. |
| High-risk legal areas | 406 version keys | Require corpus-admin signoff before display eligibility. |

## High-risk topic cues

Topic cues overlap, so the counts below should not be summed.

| Topic cue | Version count |
|---|---:|
| Juvenile-court procedure | 304 |
| Custody | 48 |
| Termination or parental-rights cues | 42 |
| Dependency or neglect | 27 |
| Adoption | 23 |
| Removal | 7 |
| Surrender | 6 |

## Disposition rule

Every unknown-effectivity row remains excluded until reviewed. No effective-dated row should become production-displayable unless the corpus administrator confirms the effective date, current-law status, and as-of-date behavior.
