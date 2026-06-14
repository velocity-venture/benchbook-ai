# Retrieval Index Design

## Retrieval Order

1. Exact citation lookup.
2. Metadata-filtered full-text search.
3. Metadata-filtered semantic search with pgvector.
4. Authority-aware reranking.
5. Display, approval, and effectivity enforcement.
6. Answer packaging with traceability.

Exact citation lookup must run before semantic search. A judge entering a statute, rule, or policy number should not depend on embeddings.

## Exact Citation Lookup

Use `citation_aliases.normalized_alias` for deterministic lookup.

Normalization should handle:

- Tennessee Code citation variants
- rule abbreviations
- DCS policy references
- section symbol and plain "Section" variants
- punctuation and whitespace differences
- common user shorthand

On exact hit:

- fetch the authority unit
- apply as-of-date version filter
- fetch approved displayable chunks
- include sibling chunks only when the retrieval mode allows them

## Full-Text Search

Use generated `tsvector` on `authority_chunks.text` with a GIN index.

Recommended query tools:

- `websearch_to_tsquery` for natural queries
- `plainto_tsquery` for simple phrases
- `ts_rank_cd` for ranking

FTS must always be filtered by:

- authority family
- source type
- corpus designation
- approval status
- display status
- effective date
- version status
- chunk type
- DCS chapter when applicable

## pgvector Semantic Retrieval

Use `authority_chunks.embedding vector(1536)` as a placeholder. Do not populate until an approved embedding phase.

When embeddings exist:

- vector search must be scoped by metadata filters first
- vector hits must not override display restrictions
- vector hits must not serve future-effective text as current law
- vector hits must be reranked against exact citation and FTS results

## Authority-Aware Reranking

Suggested ranking features:

- exact citation match
- canonical citation match
- current as-of-date version
- approved displayable status
- black-letter chunk type
- requested authority family
- DCS chapter match
- source type match
- corpus designation
- FTS score
- vector score
- chunk length sanity
- warning penalty
- duplicate text penalty

Default authority priority:

1. current black-letter statutes
2. current black-letter Tennessee procedural rules
3. TRE only for evidence/procedure questions
4. approved DCS policy text where relevant
5. history only as context if approved
6. restricted materials never in production answers

## Black-Letter Only Retrieval Mode

Filters:

- `chunk_type = black_letter_text`
- production display allowed
- approved for production
- valid as of date
- exclude advisory comments, annotations, case notes, history, DCS non-policy text, unknown chunks

Use this mode for high-risk statutory questions and any answer requiring direct rule statements.

## TRE Limited-Scope Retrieval

TRE rows carry `answer_scope = limited_evidentiary_procedural`.

TRE answer use should require the question to be about:

- admissibility
- objections
- offers of proof
- expert proof
- hearsay
- judicial notice
- evidentiary privileges or exclusions
- related procedural evidence issues

For non-evidence questions, TRE can be guardrail/reference metadata but not primary answer authority.

## DCS Duplicate Handling

Do not duplicate chunks for exact duplicate DCS PDFs. Retrieval should:

- resolve source hash to one source file
- preserve all memberships through `source_file_memberships`
- allow filters by DCS chapter through memberships
- return one text chunk with all relevant source paths or chapter memberships in metadata
- avoid repeated answer support from duplicate text

## Production Query Shape

All retrieval paths should converge on a production-safe candidate view or RPC. The raw chunk table contains restricted rows and should not be queried directly by app code.

Minimum candidate predicate:

```sql
c.approval_status = 'approved_for_production'
and c.production_display_status in ('displayable_black_letter', 'displayable_policy_text')
and v.valid_from <= :as_of_date
and (v.valid_to is null or :as_of_date < v.valid_to)
```

## Retrieval Logs

Every retrieval attempt should write `retrieval_logs`:

- query hash and short excerpt
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

## Answer Packaging

The model should receive only approved, displayable chunks. Each chunk must be packaged with:

- chunk ID
- canonical citation
- authority family
- version label
- as-of date
- page span
- source path
- source hash
- chunk text hash
- display status

The prompt should require citation per proposition against provided chunk IDs.

