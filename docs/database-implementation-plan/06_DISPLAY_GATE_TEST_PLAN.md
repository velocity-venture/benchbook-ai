# Display Gate Test Plan

Display gates protect judicial trust, licensing boundaries, and closed-universe answer integrity.

## Production Display Rule

Production answer retrieval may use a chunk only if:

- the chunk is approved for production
- the chunk has a displayable production status
- the authority version is current for the as-of date
- the answer scope allows the requested use
- the retrieval mode allows the chunk type

## Restricted Classes

These classes are blocked from production answers by default:

- Lexis annotations
- case notes
- advisory comments
- research references
- restricted pending license review chunks
- internal QA-only chunks
- pending extraction QA chunks
- unknown chunks unless explicitly approved

## Tests By Retrieval Path

### Exact Citation

- A restricted citation match returns no production answer support.
- An approved black-letter citation match returns displayable chunks only.
- A future-effective citation match is excluded from current-law mode.

### Full-Text Search

- FTS does not return restricted rows.
- FTS does not return pending extraction QA rows.
- FTS does not return DCS staged rows until approved.
- FTS does not return TRE rows for non-evidence questions.

### Semantic Search

- Before embeddings, semantic search is disabled or controlled.
- After embeddings, semantic hits still pass display and effectivity gates.
- Vector score cannot override a display restriction.

### Internal QA

- Internal QA can count restricted rows.
- Internal QA can inspect metadata.
- Internal QA reports must not print long legal source text.
- Internal QA access must write an audit record.

## Test Data Conditions

The dry-run corpus currently includes:

- 2,392 restricted pending license review chunks
- 4,195 pending extraction QA chunks
- 1,118 annotation candidates
- 979 case note candidates
- 295 advisory comments
- 747 policy text chunks pending QA

Expected production-safe result before approval:

- zero restricted chunks
- zero pending extraction QA chunks
- zero DCS pending chunks
- zero annotations
- zero case notes
- zero advisory comments

If no chunks are approved for production, production retrieval returning zero rows is correct.

## License Decision Tests

If a later license approval changes display rights:

1. Add a license decision record.
2. Promote only approved classes.
3. Keep all non-approved restricted classes blocked.
4. Add tests for newly allowed classes.
5. Log every answer using newly enabled material.

## Failure Conditions

The build fails display gate QA if:

- restricted chunks appear in a production view
- pending extraction QA chunks appear in a production view
- exact citation lookup bypasses display gates
- FTS bypasses display gates
- vector retrieval bypasses display gates
- current-law mode includes future-effective rows
- TRE appears as general answer authority
- DCS staged material appears before approval
