# DCS Document-Anchored Disposition Plan

Date: 2026-06-29

## Queue file

- `review-queues/dcs_document_anchored_summary.csv`

## Counts

| Item | Result |
|---|---:|
| DCS chunks | 2014 |
| DCS document-anchored chunks | 1146 |
| DCS guardrail/reference-only chunks | 2014 |
| DCS production-eligible chunks | 0 |
| Document type distribution | faq: 14, guide: 194, guidelines: 4, handbook: 30, manual: 367, n_a: 103, protocol: 367, tip_sheet: 7, work_aid: 60 |

## Default disposition

Adopt with revision as guardrail/reference only. Production eligible remains zero. Manual mapping is required before any higher authority status. DCS currency and source verification are required before any production-answer authority discussion.

## Stop conditions

Stop if a row lacks reliable DCS policy identity, source currency cannot be verified, production-answer authority would be inferred from a document title, or DCS production-eligible count would become greater than zero without separate owner approval.
