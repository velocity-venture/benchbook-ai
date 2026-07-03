# Guardrail Dashboard - Mock Internal QA (F5-05)

Date: 2026-07-02. Audience: owner + security reviewer. QA verdict per guardrail class.

## Judicial guardrail classes (all VERIFIED by execution)

| Class | Stage | QA verdict | Evidence |
|---|---|---|---|
| Excluded titles 39/40/55 | pre-retrieval (window-wide) + post-generation backstop | HOLDS | RF-02/03/04, GG-02, MC-04 |
| Web / other-state / general legal | pre-retrieval | HOLDS | RF-05 |
| Ruling recommendation | pre-retrieval AND response-side | HOLDS both directions | RF-06, GG-03, GG-08, GG-10 |
| Credibility evaluation | pre-retrieval | HOLDS | RF-12, GG-04 |
| Extra-record factfinding | pre-retrieval | HOLDS | RF-13, GG-05 |
| DCS authority demand | pre-retrieval; DCS divert at retrieval | HOLDS | RF-07, MR-06, GG-06, MC-07 |
| TRE limited scope | retrieval (intent-gated) | HOLDS | MR-04/05, MC-06 |
| Restricted / pending / unknown / future material | retrieval (blocked classes) | HOLDS, most-restrictive-first | RF-08..11, MA-05 |
| Prompt injection | pre-retrieval + fail-closed classifier | HOLDS | GP-8 test, GG-12 |
| Citation mandate | post-generation | HOLDS | T-CIT-MISSING, MC-08, RF-14 |
| Leakage suppression | post-generation | HOLDS, zero leakage in events | GG-09, MC-04 |
| Target control | boot + per-request echo | HOLDS | GG-01, ME-04/05/06 |
| Audit fail-closed | both write positions | HOLDS | MA-07 + answer-audit failure test |

## Failure-direction audit

Every ambiguous or failed condition observed in QA resolved toward refusal: intent misclassification produces no-authority refusals; classifier/adapter/audit crashes refuse; zero-result causes pick the most restrictive class. No observed path degrades toward an unsourced or unlabeled answer.

## Watch items for the QA-exercise period

1. Over-refusal rate on real judge phrasings (risk N4): collect and tune patterns via reviewed data diffs only.
2. G3: demonstrate `model_no_support` before final template sign-off.
3. Pattern data (`guardrail-patterns.json`) is version-labeled; any change is a reviewable diff, never a silent edit.
