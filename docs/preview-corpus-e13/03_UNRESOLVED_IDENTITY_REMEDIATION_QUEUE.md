# Unresolved Identity Remediation Queue

Date: 2026-06-29

## Queue files

- `review-queues/unresolved_identity_units.csv`
- `review-queues/unresolved_identity_chunks.csv`

## Counts

| Item | Result |
|---|---:|
| Unresolved authority units | 17 |
| Unresolved chunks | 21 |
| DCS unresolved chunks | 20 |
| TRE unresolved chunks | 1 |

## Required disposition choices

Each row must receive one of these corpus-admin decisions: Adopt, Adopt with revision, Archive, Reject, or Needs further review.

Default E13-A disposition is Needs further review. No unresolved row should become production-displayable. For DCS items, the reviewer must decide whether the item is a valid document-anchored guardrail row, a map-to-policy candidate, or a production exclusion. For the TRE annotation candidate, keep it restricted unless owner and license review approve a different treatment.

## Stop condition

Stop if resolving a row would require printing legal body text outside an approved review workflow or inferring authority identity from a filename alone.
