# 03 - Database Retrieval Contract Spec

Date: 2026-07-02
Phase: F5-02. Specification only; machine mirror in `contracts/legal_retrieval_request_contract.json` and `contracts/legal_retrieval_response_contract.json`.

## 1. Position in the request lifecycle

The retrieval contract sits between the guardrail gate (doc 06) and prompt assembly. It is the ONLY path by which legal text may enter an answer (F5-01 contract clause C1). It is served exclusively by the gate-enforcing database surface: `lookup_citation_alias`, `search_displayable_chunks`, and (if the owner approves one) a purpose-built internal-QA reference RPC. Raw table reads and service-role access are prohibited in user request paths.

## 2. Retrieval request (authoritative field list)

| Field | Type | Required | Rule |
|---|---|---|---|
| request_id | uuid | yes | Client-generated per retrieval; joins audit rows |
| user_id | uuid | yes | From authenticated session only |
| environment_target | enum: preview_internal_qa, local_fixture, production_prohibited | yes | Must match the deployment's pinned target; `production_prohibited` is a sentinel that always refuses (doc 10) |
| corpus_scope | const: tn_closed_universe_v1 | yes | Any other value refuses; future local-rules overlay would extend this enum by owner approval |
| query_classification | object (doc 06 output) | yes | Guardrail decision must be `proceed` before retrieval is attempted |
| retrieval_mode | enum: exact_citation, full_text, hybrid_future | yes | hybrid_future refuses until embeddings are separately approved |
| detected_citations | array of normalized alias strings | no | Populated by the citation detector for exact lookup first |
| family_filter | array of family codes | yes | Subset of: tca_title_36, tca_title_37, tenn_rules_juvenile_practice_procedure, tenn_rules_evidence, dcs_policies_procedures. Never empty; never outside this set |
| answer_scope_intent | enum: general_answer, evidentiary_procedural, reference_only | yes | Drives TRE and DCS scope enforcement (doc 07) |
| as_of_date | date | yes | Defaults to today at the route layer, passed explicitly to every RPC |
| result_limit | int 1-50 | yes | Mirrors the RPC hard cap |

## 3. Retrieval sequence (deterministic)

1. If `detected_citations` is non-empty: `lookup_citation_alias(alias, as_of_date)` per alias. Resolved aliases anchor the answer.
2. `search_displayable_chunks(query, as_of_date, family_filter, result_limit)` for topical support.
3. Zero rows from both = mandatory refusal path `no_authority_support` (doc 05). No fallback of any kind.
4. Post-filter (app layer, until an RPC scope parameter exists): drop TRE rows unless `answer_scope_intent = evidentiary_procedural`; DCS rows route to the reference envelope, never the answer envelope (doc 07).
5. Text delivery for retrieved chunk IDs uses the owner-approved delivery mechanism chosen in F5-03 design (gap G3): either a text-bearing gated RPC revision or authenticated view selects. Raw `authority_chunks` selects are prohibited either way.

## 4. Retrieval response (authoritative field list)

| Field | Type | Rule |
|---|---|---|
| request_id | uuid | Echo |
| environment_target | enum | Echo of the pinned target, surfaced to UI (doc 10) |
| outcome | enum: results, no_authority, refused_pre_retrieval | Drives answer vs refusal path |
| results[] | array | Each: authority_chunk_id, authority_unit_id, authority_version_id, canonical_citation, authority_family, answer_scope, chunk_type, page_start, page_end, text_sha256, rank (nullable for exact lookups), gated_chunk_passage (runtime-only field; never persisted to logs, never present in contract examples) |
| effective_basis | object | as_of_date used; version_status of every returned row (must be `current`) |
| gate_attestation | object | booleans the route asserts before use: all_rows_displayable, no_restricted_rows, no_pending_rows, scope_filter_applied. Any false = internal error refusal, never a degraded answer |
| refusal | object or null | Doc 05 contract object when outcome is not `results` |
| audit | object | retrieval_log_id (write happens before response returns; doc 09) |

## 5. Prompt assembly constraint

Only `gated_chunk_passage` spans from the response may carry legal text into the model prompt, each tagged with its canonical citation so generation can cite only retrieved authorities. System prompt forbids legal substance from model memory (F5-01 doc 09 L3). Span budget: hard token ceiling per request with deterministic truncation by rank order, never mid-span.

## 6. No-general-fallback enforcement points

1. Route code path: no branch reads the flat-JSON corpus on the QA route.
2. Prompt contract: states retrieved spans are the only authority.
3. Post-generation verification: citations not resolving to returned rows demote to unverified warnings or convert to refusal per doc 04 thresholds.
4. Harness: mock scenarios MR-07/MR-08 (doc 12) prove empty-retrieval yields refusal, not generic legal prose.

## 7. Error taxonomy

| Condition | Behavior |
|---|---|
| RPC error / timeout | Fail closed: user-safe 503-style refusal envelope, kind `no_authority_support` variant `retrieval_error`; audit row still written |
| Gate attestation failure | Fail closed with internal alert; treated as a defect, never retried with looser filters |
| Target mismatch (env label vs pinned config) | Refuse and alert; stop condition SC-1 (doc 14) |
