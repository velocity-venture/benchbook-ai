# Corpus Admin Effectivity Checklist

Date: 2026-06-29

## Before review

- Confirm the working file is metadata-only.
- Confirm unknown-effectivity and future-effective rows remain gated.
- Confirm no row is marked displayable by this review.

## Review steps

- Verify current version status.
- Verify current effective label.
- Verify `valid_from` and `valid_to`.
- Record proposed version status.
- Record proposed effective-date metadata.
- Mark owner escalation for ambiguous high-risk rows.
- Record production impact.
- Record stop condition.

## Stop conditions

- Current-law status cannot be verified from metadata.
- Effective date requires legal body text in a committed artifact.
- Future-effective material would become visible before its effective date.
- Unknown-effectivity material would become searchable or displayable.
