# QA Signoff Workflow

Date: 2026-06-29

## Queue file

- `review-queues/qa_signoff_required_versions_summary.csv`

## Count

| Item | Result |
|---|---:|
| Versions requiring QA signoff | 439 |
| High-risk version keys from local dry run | 406 |
| QA rows by version status | current: 419, future_effective: 16, unknown_effectivity: 15 |

## Reviewer role

Primary reviewer: corpus administrator. Owner review is required for ambiguous current-law status, high-risk juvenile or family-law categories, or any proposed production-display change.

## Required source authority

The reviewer must verify source-file identity, source hash, citation or rule identity, current-law status, and extraction warnings. DCS material also requires source currency and policy identity verification.

## Review evidence

Record metadata evidence only in the queue: source file, source hash, authority family, citation metadata, version status, effective-date metadata, warning category, and reviewer decision. Do not record legal body text or excerpts in the queue.

## Signoff states

- Not started
- In review
- Signed off for internal QA only
- Signed off for production consideration
- Needs owner decision

## Rejection states

- Rejected as non-authority
- Archived as historical or duplicate
- Held for license review
- Held for source verification
- Held for effectivity review

## Audit record requirements

Every signoff must record reviewer role, date, metadata evidence reviewed, decision, production impact, stop condition, and whether owner approval is required before promotion.

## Promotion impact

Signoff alone does not open display gates. Production display requires a later separately approved phase that updates metadata, verifies gates, and confirms no restricted, pending, DCS, TRE, future-effective, or unknown-effectivity row is exposed improperly.
