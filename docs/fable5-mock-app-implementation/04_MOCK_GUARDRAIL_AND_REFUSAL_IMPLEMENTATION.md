# 04 - Mock Guardrail and Refusal Implementation (F5-04 / M1)

Date: 2026-07-02

## Pipeline placement

| Stage | Where | Checks |
|---|---|---|
| Pre-retrieval | `guardrail.ts` preRetrieval() over query + full conversation window | GP-3 excluded titles/topics (reuses `scope-guard.ts` unmodified, window-wide); GP-4 web/general-legal; GP-5 ruling; GP-6 credibility; GP-7 extra-record; GP-8 injection; GP-9 DCS-authority demand. GP-2 (target control) is enforced by environment boot + echo checks |
| Post-retrieval | postRetrieval() over adapter rows | GQ-4 as-of conformity (defect alert); GQ-1 displayability attestation; GQ-2 scope filter and envelope separation (DCS diverts to reference even off-filter; TRE drops without evidentiary intent; drops logged); GQ-5 dedupe; GQ-3 zero-authority resolution at the route |
| Post-generation | scanGeneration() + citation verifier | GA-2 response-side ruling scan; GA-3 leakage scan (restricted markers, excluded titles reintroduced); GA-1 citation verification; GA-4 conversion rule (any failure converts to refusal, never a degraded answer) |

## Fail-closed wrapper

Any classifier exception inside preRetrieval refuses with variant `classifier_error` (GG-12); pattern data is compiled at module init from `guardrail-patterns.json` so pattern changes are reviewable data diffs.

## Refusal envelope discipline

`buildRefusalObject` resolves wording ONLY from `refusal-templates.json` (19 templates, all flagged for owner review, P6); a missing template key throws rather than free-generating. Kinds are locked to the six-member `refusal_records` enum (asserted against the contract JSON in the static-safety suite). Every refusal envelope carries: kind, variant, stage, `user_message_key`, owner-reviewed title/message, non-empty permissible-help list, audit references, and the environment target. Refusals never lock the input (GG-11) and never leak matched legal substance (matched terms travel as a hash).

## Variant map implemented

excluded_title, general_legal_or_web, ruling_recommendation, credibility_evaluation, extra_record_facts, dcs_authority_demand, prompt_injection, classifier_error, none_found, pending_qa_only, unknown_effectivity, future_effective, restricted_lexis, citation_validation_failure, retrieval_error, internal_gate_error, target_control, audit_write_failure, input_invalid, model_no_support, leakage_suppressed.
