# 06 - Judicial Guardrail Contract Spec

Date: 2026-07-02
Phase: F5-02. Machine mirror: `contracts/guardrail_decision_contract.json`. Builds on F5-01 doc 09 (layers L1-L6); this spec fixes the app-facing decision object and check ordering.

## 1. Pre-retrieval checks (GP series, deterministic, server-side, in order)

| # | Check | Fail action |
|---|---|---|
| GP-1 | Assemble the guarded window: current query plus prior turns that will enter the prompt. All subsequent checks run on the window, not the last message alone | - |
| GP-2 | Environment target check: pinned target is preview_internal_qa or local_fixture; anything else refuses (target_control) | Refuse safety_guardrail |
| GP-3 | Excluded-title and excluded-topic patterns (existing scope-guard, statutory-context aware) | Refuse out_of_scope |
| GP-4 | General-legal/web request patterns | Refuse out_of_scope |
| GP-5 | Ruling-recommendation patterns (GR-1): outcome-seeking verbs applied to the pending matter | Refuse safety_guardrail |
| GP-6 | Credibility-evaluation patterns (GR-2) | Refuse safety_guardrail |
| GP-7 | Extra-record factfinding patterns (GR-3): person/party/case lookups, record-external investigation | Refuse safety_guardrail |
| GP-8 | DCS-authority-demand patterns: proceed with reference-only intent flag rather than hard refusal when the underlying topic is answerable from statutes/rules | Flag or refuse per doc 07 |
| GP-9 | Query classification output assembled: answer_scope_intent, family_filter recommendation, detected citations | - |

Classifier design rules: pattern data lives in versioned data files, not code; fail-closed on classifier error; every decision logged (hashed in production mode).

## 2. Post-retrieval checks (GQ series, after RPC results, before prompt assembly)

| # | Check | Fail action |
|---|---|---|
| GQ-1 | Gate attestation: every returned row displayable, current, non-restricted, non-pending | Internal-error refusal; defect alert |
| GQ-2 | Scope filter: TRE rows dropped unless evidentiary intent; DCS rows diverted to reference envelope | Silent filter, logged |
| GQ-3 | Family filter conformity: no row outside the requested families | Internal-error refusal |
| GQ-4 | As-of conformity: every row's version window contains as_of_date | Internal-error refusal |
| GQ-5 | Zero-result branch: route to no_authority refusal | Refusal |

## 3. Post-generation checks (GA series)

| # | Check | Fail action |
|---|---|---|
| GA-1 | Citation verification per doc 04 levels | Demote or convert to refusal |
| GA-2 | Response-side guardrail scan: generated text does not contain ruling recommendations, credibility conclusions, or extra-record factual assertions (pattern scan plus template constraints) | Suppress and refuse safety_guardrail; log unsupported_answer where citation-shaped |
| GA-3 | Leakage scan: no restricted-class markers, no excluded-title citations rendered as authority | Suppress and refuse |
| GA-4 | Confidence computation from verification results; badge honesty rule: HIGH only when all citations verified_retrieved | Badge demotion |

## 4. Guardrail decision object

Fields: decision (proceed, refuse, flag_reference_only), stage, checks_run[] (id, outcome, matched metadata hash), refusal (doc 05 object when refusing), classification (answer_scope_intent, family_filter, detected_citations), timing_ms. Every decision object is persisted with the retrieval log (doc 09) so QA can reconstruct why any request proceeded or refused.

## 5. Stop conditions (contract-level)

Guardrail bypass discovered (any answer path skipping GP/GQ/GA), classifier fail-open behavior observed, or any leakage event in GA-3: freeze the QA route (feature flag off), file a defect, re-run the full refusal matrix after fix. These mirror doc 14 stop conditions SC-4 through SC-6.

## 6. Test hooks

`mock_guardrail_scenarios.json` GG-01 through GG-12: one per GP/GQ/GA class, plus multi-turn persistence (window check), post-refusal recovery, and injection resistance. Acceptance thresholds live in F5-01 doc 09 section 5 and are unchanged: 100 percent class match, zero leakage, two consecutive green runs.
