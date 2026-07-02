# 13 - Security and Secret Absence Plan (F5-03)

Date: 2026-07-02

## 1. Secret absence in M1 deliverables

1. M1 introduces zero new credentials: no database URL, no project ref, no key material. The three new env keys (doc 10) are booleans and an enum value.
2. Fixtures are synthetic; scenario files are metadata; neither can contain secrets by construction, and the F5-02/F5-03 validators scan them.
3. Every M1 commit runs the assembled-pattern guardrail scan over the diff (Codex prompt step); any hit stops the phase (SC-10).
4. Mock audit sink and console output are hash-only (S4), enforced structurally at the sink (doc 09 section 2).

## 2. Security review deltas M1 must respect (from F5-02 doc 11)

- QA route runs with user-session credentials only; no service-role usage anywhere in the new module graph (T8 asserts by source scan).
- Named-participant check for the QA page (S1) is OPTIONAL in M1 because the data is synthetic; it becomes mandatory before the F5-05 live-target flip. The route ships the membership hook with an allow-all-authenticated M1 default and a test asserting the hook exists, so F5-05 tightens config, not code.
- Rate limiting: same fail-closed limiter applied to the new route; refusals count toward limits.
- Error hygiene: no stack traces, SQL, or gate internals in user-visible errors; gate_attestation stays server-side.

## 3. Dependency posture

M1 adds no new runtime dependencies (types, fixtures, and factories are plain TypeScript/JSON; tests use the existing vitest). This keeps the security review surface at zero new packages. If implementation finds a genuine need, the Codex prompt requires stopping and recording the package for owner review rather than adding it silently.

## 4. Session persistence exception hygiene

If this cloud session's persistence hook commits the F5-03 package, the commit contains only documentation, JSON design artifacts, and one validator script; the guardrail scan and validator run before commit; attestations state the reason. (Same discipline as F5-01/F5-02.)
