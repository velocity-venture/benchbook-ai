# 10 - Target Environment Control Design (F5-03)

Date: 2026-07-02
Contract source: F5-02 docs 10 and 11; answers objective question 6 (what target-control logic must exist before any live database connection).

## 1. Environment module (`lib/qa-research/environment.ts`)

| Function | Behavior |
|---|---|
| `bootValidate()` | Runs at module init of the QA route. Validates: `QA_RESEARCH_TARGET` present and in the M1 registry (`mock_only` only); `QA_RESEARCH_ENABLED` explicit; model IDs match an allowlist pattern (fixes defect D1 for this route); `QA_MODE_EXCERPT_LOGGING` absent or false by default. Any failure throws with named variables (pattern copied from `lib/supabase/env.ts`), making the route return a 503-style unavailable response, never a degraded answer |
| `resolveTarget()` | Returns the pinned target; unknown or production-flavored values throw `TargetNotAvailableError` |
| `label()` | Returns the UI label: `MOCK_ONLY` in M1 |
| `assertEcho(responseTarget)` | Compares the adapter response echo to the pin; mismatch refuses with variant `target_control` and raises the SC-1 alert |

## 2. Env keys introduced by M1 (documented in .env.example only)

| Key | Values | Default |
|---|---|---|
| `QA_RESEARCH_TARGET` | `mock_only` (M1 registry) | none; route unavailable if unset |
| `QA_RESEARCH_ENABLED` | `true`/`false` feature flag (narrow-only per C13) | false |
| `QA_MODE_EXCERPT_LOGGING` | `true`/`false` | false (P5) |

No database URL, no project ref, no credential key is introduced. The future preview binding (F5-05) will add its own target value and connection configuration under separate approval; M1 code paths make that value unrepresentable.

## 3. Layered production blocking before any live connection exists

1. Type layer: M1 target enum has no production member.
2. Registry layer: adapter factory throws on unknown targets.
3. Boot layer: `bootValidate()` re-checks and fails fast.
4. Request layer: `assertEcho` per request.
5. UI layer: banner plus target chip plus static no-production footer.
6. Test layer: ME-04/ME-05/ME-06 plus static-safety scans (no URL schemes, no refs, no credentials).
7. Config layer: deploy scripts and `wrangler.toml` remain forbidden files in M1, so no deployment path can even carry the new env keys to a hosted environment without a later reviewed change.

## 4. What must additionally be true before F5-05 flips to a live target

Carried from F5-01/F5-02, restated as the target-control precondition list: O6 reload executed and re-QAed; O2/O4 tier promotion; O7 build approval; the preview target value added to the registry in a reviewed commit; boot validation extended to verify the Supabase URL host against an allowlist; S2 object-verification run recorded; fixture-tier (T2) green; and the deploy-script allowlist work (F5-01 T2 gap) completed. These are enumerated in `manifests/mock_implementation_readiness_manifest.json` as the F5-05 gate set so nothing silently drops.
