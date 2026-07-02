# 09 - No Live Database Attestation (F5-04 / M1)

Date: 2026-07-02

## Attestation

During the entire F5-04 phase:

- NO Supabase command was run (no `projects list`, `db query`, `db push`, `link`, migration command, or any other).
- NO remote `psql` was run; NO database URL, password, token, service-role key, or connection string was used, printed, or committed.
- The preview database (`legal_authority` schema) was NOT contacted; production was NOT contacted; nothing was written to any remote database.
- NO preview reload was executed; NO corpus rows were loaded; NO embeddings were generated; NO display gate changed. Preview remains: 0 displayable rows, 0 embeddings, deny-by-default gates.
- NO live database code was added: the qa-research module graph contains no external data-client import, no database endpoint string, and no connection configuration. The only network-capable seam (the model client) has a mock-only registry in M1.
- The existing app-data Supabase usage (auth, chat persistence) is untouched: no file under `app/src/lib/supabase/` changed; the chat route and page are unmodified.

## How the attestation is enforced going forward (not just asserted)

1. `qa-route-static-safety.test.ts` runs 19 forbidden-token scans over the whole qa-research module graph (route, page, all lib modules) on every `npm test`.
2. The three factory registries make any non-mock target a thrown `TargetNotAvailableError`.
3. `scripts/launch_readiness/validate_f5_04_mock_app_implementation.py` re-scans the mock implementation files and the F5-04 docs independently of the test framework.
4. The audit sink writes to memory only; there is no persistence implementation to misconfigure.

## Known benign scan hits (documented, not violations)

- `app/src/components/sidebar.tsx` contains pre-existing `@supabase`/`createClient` imports (sign-out button) that predate F5-04; the F5-04 diff adds only a nav block. The sidebar is not part of the mock implementation graph.
- `app/package.json` lists pre-existing `@supabase/*` dependencies; the F5-04 diff adds only the `test:qa` script. No dependency changed.
- `app/src/__tests__/qa-research/scenarios/mock_guardrail_scenarios.json` contains the English participle "embedding" inside a scenario description ("a crafted input embedding ignore-your-rules instructions"). The file is a checksum-locked copy of the F5-02 canon; the word is not an API call.
- Excluded-title strings (Title 39/40/55 shapes) appear in refusal tests, guardrail pattern data, and the citation verifier's out-of-universe detector: all refusal-detection contexts, never as allowed authorities. The fixture lint asserts no excluded-title authority exists in fixtures.
