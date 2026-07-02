# Unknown Effectivity Remediation Queue

Date: 2026-06-29

## Queue files

- `review-queues/unknown_effectivity_versions.csv`
- `review-queues/unknown_effectivity_chunks.csv`

## Counts

| Item | Result |
|---|---:|
| Unknown-effectivity versions | 15 |
| Unknown-effectivity chunks | 39 |
| Future-effective versions from local dry run | 16 |
| Future chunks from local metadata | 120 |
| Current versions with future end date | 13 |

## Warning categories

Rows distinguish current-law confidence issues, future-effective issues, unknown-effective-date issues, QA signoff required, and high-risk legal domain cues. High-risk cues are based on metadata fields only.

## Review rule

Unknown-effectivity rows remain excluded until a corpus administrator confirms effective date, current-law status, and as-of-date behavior. No unknown-effectivity row should be promoted to display or retrieval by default.
