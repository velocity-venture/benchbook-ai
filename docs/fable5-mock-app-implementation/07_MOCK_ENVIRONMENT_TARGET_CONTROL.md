# 07 - Mock Environment Target Control (F5-04 / M1)

Date: 2026-07-02

## Environment variables (documented in app/.env.example, all default off)

| Variable | Values | Behavior |
|---|---|---|
| QA_RESEARCH_TARGET | `mock_only` (only M1 registry member) | Missing/unknown = route 503-unavailable; production-shaped values (incl. the `production_prohibited` sentinel) = loud always-refuse posture with variant `target_control` (ME-04) |
| QA_RESEARCH_ENABLED | must be exactly `true` | Anything else = 503-unavailable |
| QA_MODE_EXCERPT_LOGGING | `true`/other | Defaults off (P5); enabling surfaces a boot alert |
| NEXT_PUBLIC_QA_RESEARCH_ENABLED | `true`/other | Nav visibility only; the route ignores it |

`QA_RESEARCH_MODEL` (optional) is checked against a model-id allowlist pattern at boot; M1 never calls a live model, the name is audit metadata only.

## Layered production blocking (implemented)

1. Type layer: the `EnvironmentTarget` type has exactly one member.
2. Registry layer: all three factories (adapter, model, audit) throw `TargetNotAvailableError` on anything but `mock_only`.
3. Boot layer: `bootValidate` fails fast with named variables; validated once and cached.
4. Request layer: `assertEcho` compares each adapter response echo to the pin; mismatch refuses with `target_control` and a defect alert (ME-05 / SC-1).
5. Transport layer: every SSE response carries `X-Environment-Label: MOCK_ONLY`.
6. UI layer: non-dismissable banner "MOCK ONLY - SYNTHETIC DATA - NOT FOR JUDICIAL RELIANCE", target chip with fixture-manifest hash and as-of date, static no-production footer.
7. Test layer: ME suite (6/6), boot matrix, and 19 static forbidden-token scans.
8. Config layer: no deploy file, wrangler config, or lockfile changed; the new env keys exist nowhere but `.env.example` documentation.

## SSE environment event (first event of every envelope)

`{ target, label, banner, tier: "mock", no_production_notice, fixture_manifest_sha256, as_of_date }` plus `boot_alert: true` in the sentinel-refusal posture. The page renders exclusively from this event; absence of the banner is stop condition SC-7.
