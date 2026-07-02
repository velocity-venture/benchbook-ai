# Guardrail Enforcement Dashboard

Date: 2026-07-02 (F5-02)

## Enforcement pipeline (doc 06)

| Stage | Checks | Fail posture |
|---|---|---|
| Pre-retrieval | GP-1 window assembly, GP-2 target, GP-3 excluded titles, GP-4 web/general legal, GP-5 ruling, GP-6 credibility, GP-7 extra-record, GP-8 DCS demand, GP-9 classification | Refuse (fail closed on classifier error) |
| Post-retrieval | GQ-1 gate attestation, GQ-2 scope divert, GQ-3 family conformity, GQ-4 as-of conformity, GQ-5 zero-result | Internal-error refusal or divert |
| Post-generation | GA-1 citation verification, GA-2 response-side guardrail scan, GA-3 leakage scan, GA-4 confidence honesty | Demote, suppress, or refuse |

## Coverage vs the existing app

| Guardrail class | Exists today | F5-02 contract |
|---|---|---|
| Excluded titles 39/40/55 (statutory context) | YES (scope-guard.ts) | Carried over as GP-3 |
| DUI/traffic and adult-criminal topics | YES | Folded into GP-3/GP-4 |
| Web/general legal | NO | GP-4 |
| Ruling recommendation | NO | GP-5 |
| Credibility evaluation | NO | GP-6 |
| Extra-record factfinding | NO | GP-7 |
| DCS authority demand | NO | GP-8 |
| Window-level (multi-turn) checking | NO (current query only) | GP-1 |
| Response-side scans | NO | GA-2/GA-3 |
| Refusal-kind audit logging | NO | All stages via log_refusal_record |

## Acceptance (unchanged from F5-01 doc 09 section 5)

100 percent matrix class match; zero leakage; refusal records reconstruct; multi-turn persistence and recovery proven; two consecutive green runs; owner countersign before internal QA sessions.

## Stop conditions bound to guardrails

SC-3 (gate breach), SC-4 (bypass), SC-5 (leakage), SC-6 (fail-open classifier) freeze the QA route; SC-5 additionally requires owner acknowledgment to unfreeze (doc 14).
