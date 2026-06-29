# E13-B Read-Only Retrieval QA Plan

Date: 2026-06-29

## Status

This is a plan only. E13-B was not executed.

## Scope if separately approved

E13-B should be read-only preview retrieval and citation QA against the retained preview target. It must not write remote data, load corpus rows, generate embeddings, modify app code, relax display gates, or contact production.

## Expanded retrieval probes

Use count-only probes by family and gate class:

- Title 36 pending extraction QA.
- Title 37 pending extraction QA.
- TRJPP pending extraction QA.
- TRE limited-scope only.
- DCS guardrail/reference only.
- Unknown-effectivity rows.
- Future-effective rows.
- Restricted Lexis rows.
- QA signoff required rows.

Expected result for production-displayable retrieval remains zero while display gates remain closed.

## Citation alias probes

Use count-only citation alias checks by authority family:

- Title 36 aliases.
- Title 37 aliases.
- TRJPP aliases.
- TRE aliases.
- DCS aliases.

Expected result: aliases may exist internally, but production lookup must return zero displayable rows until gates are separately approved.

## Function and policy checks

Verify read-only function signatures and policy posture:

- `search_displayable_chunks` remains read-only.
- `lookup_citation_alias` remains read-only.
- Any audit or refusal function that writes is not called.
- Broad public read policy on `authority_chunks` remains absent.
- Displayable views remain zero.

## Body-passage avoidance

Queries must return only counts, booleans, function signatures, policy names, grouped metadata, and IDs when needed for reconciliation. Do not select legal passages, chunk body fields, source passages, page text, or long excerpts.

## Stop conditions

Stop if any query would require a remote write, app integration, embedding generation, production access, display-gate relaxation, secret exposure, or legal body-passage output.
