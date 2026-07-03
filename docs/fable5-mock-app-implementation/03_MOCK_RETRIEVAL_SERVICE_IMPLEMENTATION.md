# 03 - Mock Retrieval Service Implementation (F5-04 / M1)

Date: 2026-07-02

## Interface (the future live-adapter boundary, unchanged from F5-03 doc 05 except D3)

```
LegalRetrievalAdapter
  lookupCitationAlias(normalizedAlias, asOfDate) -> AliasResolution
  searchDisplayableChunks(queryTerms, asOfDate, familyCodes, limit) -> ChunkSearchResult
  deliverSpans(chunkIds) -> GatedSpan[]
  getChunkMetadata(chunkId) -> ChunkResult | null      // D3: metadata-only, never passage
  attestGates(rows) -> GateAttestation
  healthProbe() -> AdapterHealth
```

`createRetrievalAdapter(target)` resolves through a registry whose ONLY member is `mock_only`; any other value throws `TargetNotAvailableError`. The F5-05 live binding will implement this interface over `lookup_citation_alias` and `search_displayable_chunks` without touching the route, guardrails, verifier, or tests.

## Request classification (route side)

- Citation detection: synthetic citation patterns in the query set `retrieval_mode = exact_citation`; detected citations join the search terms.
- Intent: evidentiary patterns (hearsay, admissibility, authentication, etc.) select `evidentiary_procedural` with family filter `[tenn_rules_evidence]`; DCS+policy phrasing selects `reference_only` with `[dcs_policies_procedures]`; default is `general_answer` with `[tca_title_36, tca_title_37, trjpp]`.
- `result_limit` clamps to the 50-row RPC cap BEFORE the adapter call (MR-10).

## Gate semantics in the mock

`searchDisplayableChunks` returns as rows ONLY current + signed-off chunks whose effectivity window contains the as-of date. Restricted, pending-QA, unknown-effectivity, future-effective, and superseded matches surface exclusively as `blocked_class_counts` (integers); their content and identifiers never leave the adapter. The route maps zero-displayable outcomes to refusal variants by blocked-class precedence: restricted > future_effective > pending_qa > unknown_effectivity > none_found.

## Determinism and error injection

Identical inputs always produce identical envelopes (fixture matching is by lowercase term intersection plus normalized-citation equality). Constructor switches drive failure scenarios: `failMode: throw_on_search/throw_on_lookup` (MR-08), `echoTarget` (ME-05), `injectGateViolatingRow` (MR-09/GG-07), `injectOutOfFilterFamilies` (MR-05/GG-06/MC-07).

## Response contract compliance

The route composes the full `legal_retrieval_response` shape: outcome, results (with runtime-only `gated_chunk_passage` used solely for prompt assembly and never audited), envelope split counts, `effective_basis`, four-boolean `gate_attestation` (any false = internal-error refusal, MR-09), refusal object or null, and the retrieval-log audit reference. The contract-shape drift test validates builder outputs against the F5-02 contract JSONs' `required_fields`.
