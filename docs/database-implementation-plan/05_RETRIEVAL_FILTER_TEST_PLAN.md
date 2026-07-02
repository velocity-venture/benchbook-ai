# Retrieval Filter Test Plan

This plan defines retrieval behavior for a later authorized local dry run. It is not an app implementation plan.

## Retrieval Contract

All retrieval paths must converge on production-safe views or SECURITY DEFINER RPCs. App code should not query raw `authority_chunks`.

Every retrieval request must carry:

- `corpus_build_id`
- `as_of_date`
- retrieval mode
- authority family filters
- display and approval filters
- answer scope filters
- user or service identity for audit

## Exact Citation Lookup

Tests:

- Normalize common T.C.A. citation variants.
- Normalize TRJPP rule variants.
- Normalize TRE rule variants.
- Normalize DCS policy variants.
- Resolve aliases to one authority unit when unambiguous.
- Return collision report when one alias maps to conflicting units.
- Apply as-of date.
- Apply display gate.
- Write retrieval log.

Expected result:

- Exact lookup is deterministic.
- Restricted or pending chunks are never returned.
- Future-effective text is not returned as current law.

## Full-Text Retrieval

Tests:

- Apply FTS query after metadata filters.
- Filter by authority family.
- Filter by source type.
- Filter by corpus designation.
- Filter by approval status.
- Filter by production display status.
- Filter by version status and as-of date.
- Filter by chunk type.
- Filter by answer scope.
- Filter by DCS chapter when requested.
- Penalize warnings in ranking metadata.

Expected result:

- FTS improves recall but never widens legal scope.
- Every returned chunk is displayable, approved, current as-of date, and traceable.

## Semantic Retrieval Placeholder

Until embeddings are approved:

- Semantic retrieval should be disabled or return a controlled refusal.
- `embedding` values should remain null.
- Vector index should be absent unless embeddings have been generated in an approved later phase.

After embeddings are approved:

- Apply metadata filters before vector scoring where practical.
- Enforce display, approval, and effectivity gates after scoring.
- Log vector scores and candidate chunk IDs.

## Hybrid Retrieval

Hybrid retrieval should merge:

- exact citation hits
- FTS candidates
- semantic candidates when approved
- authority-aware reranking

Required priority:

1. exact citation current black-letter authority
2. current procedural rule authority
3. TRE only for evidence or procedure questions
4. approved DCS policy text when DCS mode or DCS issue is requested
5. history only as approved context
6. restricted material never

## Black-Letter-Only Mode

Required predicates:

- `chunk_type = black_letter_text`
- approved for production
- displayable black-letter status
- current as-of date
- statute or rule source type
- not TRE unless the request is evidentiary or procedural
- no DCS unless explicitly approved for that mode

Must exclude:

- history
- advisory comments
- annotations
- case notes
- research references
- metadata chunks
- unknown chunks
- pending DCS material

## TRE Limited-Scope Mode

TRE may be returned only when the request concerns:

- admissibility
- objections
- offers of proof
- expert proof
- hearsay
- judicial notice
- privilege
- evidence procedure

TRE must not be used to answer general custody, detention, delinquency, dependency and neglect, or DCS policy questions.

## DCS Retrieval Mode

DCS retrieval requires:

- DCS authority family
- source hash traceability
- DCS chapter membership filter when requested
- document type filter when requested
- extraction QA approval before production use
- duplicate membership dedupe

DCS duplicate handling must return one support chunk with membership metadata rather than repeated duplicate support.

## Restricted-Only Hit Behavior

If retrieval finds only restricted chunks:

- do not answer from restricted text
- write `refusal_records.refusal_kind = restricted_display_only`
- return a restrained refusal that the approved corpus lacks displayable support
- log candidate restricted chunk IDs only in internal audit, not user-facing output

## No-Support Behavior

If no approved displayable support is found:

- write `refusal_records.refusal_kind = no_authority_support`
- do not generate unsupported legal analysis
- return a closed-corpus refusal

## Retrieval Audit Requirements

Every retrieval attempt should record:

- query hash
- short query excerpt
- retrieval mode
- as-of date
- filters
- detected citations
- candidate chunk IDs
- returned chunk IDs
- scores
- rerank features
- corpus build ID
- refusal flag when generation is skipped
