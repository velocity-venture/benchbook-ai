# Effectivity Patch Map Plan

Date: 2026-06-29

## Queue baseline

| Item | Rows or count |
|---|---:|
| Unknown-effectivity versions | 15 |
| Unknown-effectivity chunks | 39 |
| Future-effective versions | 16 |
| Future chunks from local metadata | 120 |
| Current versions with future end date | 13 |

## Draft artifact

`draft-remediation-artifacts/unknown_effectivity_patch_map_template.csv`

## Purpose

The patch map records proposed metadata-only effectivity decisions for unknown, future-effective, current-law, and high-risk effectivity rows.

## Required review

For each proposed change, record:

- Current version status.
- Current effective label.
- Current `valid_from` and `valid_to` values.
- Proposed version status.
- Proposed `valid_from` and `valid_to` values.
- Reviewer role and date.
- Owner escalation flag.
- Production impact.
- Stop condition.

## Effectivity rules

- Unknown-effectivity rows remain excluded until a corpus administrator confirms effective date and current-law status.
- Future-effective rows remain gated before their effective date.
- Current rows with a future end date need as-of-date behavior verified before display work.
- High-risk juvenile and family-law rows require owner escalation if current-law status is ambiguous.

## Stop condition

Stop if effectivity cannot be resolved from metadata and an approved source-review workflow would be needed.

## Future use

E14-B may fill this template locally. E15 may only plan a preview reload after owner review of completed patch maps. No effectivity patch can open display gates by itself.
