# 07 - Environment and Target Control QA Report (F5-05)

Date: 2026-07-02
Machine artifact: `exercises/mock_environment_exercise.json`. Answers phase question 7.

## Disclosure QA: PASS at three independent layers

1. **Envelope layer**: the environment event is the FIRST SSE event on every answer AND every refusal, carrying the banner "MOCK ONLY - SYNTHETIC DATA - NOT FOR JUDICIAL RELIANCE", target `mock_only`, label `MOCK_ONLY`, tier `mock`, the fixture-manifest hash, the as-of date, and the no-production notice.
2. **Transport layer**: every SSE response carries `X-Environment-Label: MOCK_ONLY`.
3. **Page layer**: non-dismissable banner, target chip (label + fixture hash + as-of), audit trace line, and the static no-production footer; verified by page-source assertions.

A QA participant cannot receive any response, including errors and refusals, without the mock disclosure.

## Target control QA: PASS across the layered blocks

- Production-shaped pins (including the `production_prohibited` sentinel) refuse EVERY request loudly with variant `target_control` and a boot alert, rather than failing silently.
- Missing/unknown targets, flag off, and invalid model ids make the route 503-unavailable at boot; no degraded operation exists.
- Per-request echo checking refuses on adapter/pin mismatch with a defect alert (the SC-1 behavior).
- No live target is representable: the type enum and all three factory registries contain only `mock_only`; the static scans confirm no db endpoint, external client, or vector path exists in the graph.
- All flags default off; enabling the surface requires three explicit environment values, documented only in `.env.example`.

## Residual observations (not defects)

1. The API accepts `as_of_date` but the M1 page exposes no date control; ties to template finding O1 (future_effective help key). Owner decides in the template sign-off.
2. Nav visibility uses the public flag (deviation D5); the route ignores it and remains server-flag-gated, so the nav can never expose a working route that the server flags have not enabled.
3. Deploy configs remain forbidden files: there is no path by which these env keys reach a hosted environment without a reviewed change.

## Conclusion

Disclosure and target control exceed the F5-02 contract requirements; no change requested.
