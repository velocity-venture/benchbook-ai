# Technical App Integration Dashboard

Date: 2026-07-02 (F5-02)

## Contract status

| Contract | Spec doc | Machine file | Open items |
|---|---|---|---|
| Retrieval request/response | 03 | contracts/legal_retrieval_request_contract.json, legal_retrieval_response_contract.json | G3 delivery mechanism (F5-03, P3) |
| Citation object | 04 | contracts/citation_object_contract.json | none |
| Refusal object | 05 | contracts/refusal_object_contract.json | template texts (P6) |
| Guardrail decision | 06 | contracts/guardrail_decision_contract.json | pattern data files authored in F5-03/F5-04 |
| DCS/TRE scope | 07 | (behavioral; enforced via request/response) | G2 DCS reference mechanism (F5-03, P4) |
| Restricted/pending/effectivity | 08 | (behavioral) | none |
| Audit logging | 09 | contracts/audit_log_object_contract.json | write mechanics choice (F5-03) |
| UI/environment labeling | 10 | (behavioral; ME scenarios) | none |
| Security/RLS access | 11 | (behavioral) | S2 object-verification script (Codex Part 2) |

## Key implementation facts for F5-04

- Reuse from `/api/chat`: auth, fail-closed rate limiting, input validation, SSE framing, scope-guard streaming-refusal pattern.
- Replace: `loadRelevantCorpus()` context stuffing, flat-JSON evidence base, existence-only citation checks.
- New: retrieval adapter over `lookup_citation_alias` + `search_displayable_chunks`, envelope separation (answer_support vs reference_material), guardrail GP/GQ/GA pipeline, audit writes, target pin + echo + banner, boot checks (includes fixing the invalid default model IDs defect D1).
- Known RPC gaps compensated at app layer: G1 (TRE scope filter), G3 (text delivery), G2 (DCS reference surface); decisions land in F5-03.

## Harness status

57 scenarios designed across 6 files (see qa_harness_dashboard.md). T1 requires no database or network; T2 uses local disposable fixtures with synthetic corpus; T3 waits on E15/O2/O7.

## Defect ledger inherited from the legacy route (must not reach the QA route)

D1 invalid model IDs; D2 context stuffing; D3 non-blocking citation checks; D4 no audit trail; D5 last-message-only guardrails; D6 no as-of date; D7 no environment labeling. Each maps to a contract clause or stop condition; see doc 02 section 4.
