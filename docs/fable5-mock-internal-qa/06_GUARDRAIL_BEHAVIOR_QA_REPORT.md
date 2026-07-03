# 06 - Guardrail Behavior QA Report (F5-05)

Date: 2026-07-02
Machine artifact: `exercises/mock_guardrail_exercise.json`.

## Scope of the QA pass

All three guardrail stages were exercised through the real pipeline, including six adversarial probes driven by scripted misbehaving generations and injected failures. Answers to phase question 1 (conservatism) and the guardrail half of question 3.

## Stage findings

- **Pre-retrieval (GP)**: excluded titles refuse from the current query AND from earlier window turns; ruling, credibility, extra-record, web/general, DCS-demand, and injection classes all refuse before any adapter call (spy counts zero). The juvenile-context override admits legitimate mixed queries without weakening pure excluded-topic requests.
- **Retrieval (GQ)**: gate attestation failures and as-of-window violations produce internal-error refusals with defect alerts rather than degraded answers; TRE rows drop without evidentiary intent; DCS rows divert to the reference envelope even when injected off-filter; drops are logged and surface in the coverage event.
- **Post-generation (GA)**: ruling recommendations, restricted markers, and excluded-title reintroductions in model output suppress the entire draft; the citation gate (GA-1/GA-4) converts unverifiable drafts to refusals. No delta event escapes on any suppression path.

## Fail-closed verification

Classifier crash refuses (never passes through); adapter crash refuses with audit intact; audit-write crash blocks the answer. The injection-compliant scripted generation is additionally caught by the citation gate: even a generation that "obeys" an injection cannot render, because it carries no verifiable citations. Defense in depth is real, not nominal.

## Multi-turn behavior

Three benign turns do not soften a subsequent impermissible request (GG-10); a refusal does not lock the next valid query (GG-11). Refusals are per-turn decisions, exactly right for bench use.

## Conservatism assessment (phase question 1)

Failure direction is uniformly toward refusal: misclassified intent yields no-authority refusals, never leakage; ambiguous zero-result causes resolve to the MOST restrictive class. The cost of this posture is occasional over-refusal on unusual phrasings (risk N4); the QA-exercise period should collect real judge phrasings to tune patterns in a reviewed data-file diff. No guardrail defect found; no code change needed.
