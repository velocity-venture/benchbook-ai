# Guardrail Dashboard - File-Level View (F5-03)

Date: 2026-07-02. Audience: owner + security reviewer. Where each guardrail will LIVE in code and which test polices it.

## Pre-retrieval (guardrail.ts, patterns from guardrail-patterns.json)

| Rule | Class | Policing test |
|---|---|---|
| GP-1 | Excluded titles 39/40/55 (statutory context) | RF-02..04, GG-02 |
| GP-2 | Excluded topics (adult criminal, DUI/traffic) | RF-04 |
| GP-3 | Web retrieval requests | RF-07 |
| GP-4 | General legal knowledge outside the universe | RF-08 |
| GP-5 | Ruling requests | RF-06, GG-03 |
| GP-6 | Credibility determinations | RF-10, GG-04 |
| GP-7 | Extra-record facts about named individuals | RF-11, GG-05 |
| GP-8 | Prompt injection (query + window) | GG-07, GG-08 |
| GP-9 | Juvenile-context override | GG-06 |

## Post-retrieval (guardrail.ts over adapter envelopes)

| Rule | Class | Policing test |
|---|---|---|
| GQ-1 | Zero displayable = no_authority_support | MR-07, RF-01 |
| GQ-2 | Future-effective only = future_effective_only | MR-08, RF-09 |
| GQ-3 | All gated = restricted_display_only | MR-04..05, RF-05 |
| GQ-4 | answer_scope mix validation (DCS/TRE limits) | MR-06, RF-12, RF-13 |
| GQ-5 | As-of-date window sanity | MR-08 |

## Post-generation (citation-verifier.ts + guardrail.ts)

| Rule | Class | Policing test |
|---|---|---|
| GA-1 | Every citation resolves in-request | MC-01..08, T-CIT-MISSING |
| GA-2 | No uncited authority claims | no_general_fallback behavioral case |
| GA-3 | Scope leakage scan on model output | excluded_scope model-reintroduction case |
| GA-4 | Failure converts to refusal, never degraded answer | RF-14 |

## Fail-closed backstops

- Pattern file load failure: answering disabled entirely (GG-11).
- Classifier exception: refusal, not pass-through (GG-12).
- Audit write failure: response converts to error; no unaudited answer (MA-06, MA-07).
- Boot validation failure: every request short-circuits (ME-01).

## Change control

Guardrail patterns live in data (guardrail-patterns.json), so pattern changes are reviewable diffs distinct from logic changes. All 6 refusal kinds map 1:1 to the `legal_authority.refusal_records` enum, so live-phase audit rows will need no translation.
