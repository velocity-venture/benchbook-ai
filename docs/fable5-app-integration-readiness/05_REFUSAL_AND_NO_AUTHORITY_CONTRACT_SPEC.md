# 05 - Refusal and No-Authority Contract Spec

Date: 2026-07-02
Phase: F5-02. Machine mirror: `contracts/refusal_object_contract.json`. Test mirror: `mock-harness/mock_refusal_scenarios.json` and F5-01 doc 10 (matrix M01-M22).

## 1. Refusal object (authoritative field list)

| Field | Rule |
|---|---|
| refusal_id | uuid; equals the `refusal_records` row id written via `log_refusal_record` |
| refusal_kind | One of the schema enum: out_of_scope, no_authority_support, future_effective_only, restricted_display_only, unsupported_answer, safety_guardrail |
| refusal_variant | App-level discriminator within a kind (see section 2) |
| stage | pre_retrieval (guardrail), retrieval (zero rows / gate), post_generation (citation failure) |
| user_message_key | Template key; user-facing text comes from a fixed template table, not free generation |
| permissible_help | What the system CAN do instead (locate authorities, corpus browsers), rendered with every refusal |
| matched_terms_hash | Hashed trigger metadata in production mode; plain matched terms allowed in QA mode only per owner flag |
| audit | retrieval_log_id (nullable for pre-retrieval), refusal_record_id |
| environment_target | Echo |

Refusal SSE framing follows the existing scope-guard pattern: `delta` (template text), `confidence` LOW with explicit "this is a refusal, not a legal answer" warning, `coverage` summary, structured `refusal` event (new), `done` with model_used reflecting the stage (`scope-guard`, `retrieval-gate`, or the generating model for post-generation conversions).

## 2. Required refusal behaviors (variant table)

| Trigger | Kind | Variant | Stage | Notes |
|---|---|---|---|---|
| No authority found | no_authority_support | none_found | retrieval | Zero displayable rows; no fallback prose |
| Excluded Title 39/40/55 | out_of_scope | excluded_title | pre_retrieval | Existing scope-guard patterns carry over |
| Web/general legal request | out_of_scope | general_legal_or_web | pre_retrieval | Other states, federal beyond corpus, "search the web" |
| Case-specific ruling request | safety_guardrail | ruling_recommendation | pre_retrieval | Doc 06 class GR-1 |
| Credibility evaluation | safety_guardrail | credibility_evaluation | pre_retrieval | GR-2 |
| Extra-record factfinding | safety_guardrail | extra_record_facts | pre_retrieval | GR-3; includes person/party lookups |
| DCS production-answer request | safety_guardrail or reference redirect | dcs_authority_demand | pre_retrieval or post-filter | Reference card offered; never controlling authority (doc 07) |
| Restricted Lexis display request | restricted_display_only | restricted_lexis | retrieval | Material class named without exposing metadata beyond the class label |
| Pending extraction QA material | no_authority_support | pending_qa_only | retrieval | Gates exclude the rows; message says material is not yet QA-approved |
| Unknown effectivity material | no_authority_support | unknown_effectivity | retrieval | |
| Future-effective-only material | future_effective_only | future_effective | retrieval | May state that a future-effective version exists without rendering its text, per owner-approved template |
| Citation validation failure | no_authority_support | citation_validation_failure | post_generation | All support unresolved (doc 04 level table) |
| Retrieval infrastructure error | no_authority_support | retrieval_error | retrieval | Fail closed |
| Target mismatch | safety_guardrail | target_control | pre_retrieval | Stop condition SC-1; alerts operator |

## 3. Invariants

1. Every refusal writes a `refusal_records` row, including pre-generation refusals where no model was called.
2. Refusal text never contains legal substance, restricted metadata, or model-memory law.
3. Refusals always offer permissible help; no dead ends.
4. A refusal never locks the session: the next valid query proceeds normally (matrix M21).
5. Refusal templates are versioned files reviewed by the owner; template changes re-run the refusal matrix.

## 4. Test hooks

`mock_refusal_scenarios.json` scenarios RF-01 through RF-14 map one-to-one to section 2 rows, each with expected kind, variant, stage, audit assertions, and zero-leakage checks.
