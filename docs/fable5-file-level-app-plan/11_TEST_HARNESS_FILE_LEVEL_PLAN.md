# 11 - Test Harness File-Level Plan (F5-03)

Date: 2026-07-02
Machine mirror: `file-maps/test_file_plan.json`. All files are FUTURE M1 creations.

## 1. Test files to create under `app/src/__tests__/qa-research/`

| # | File | Drives | Scenario source |
|---|---|---|---|
| T1 | `scenario-sync.test.ts` | SHA-256 equality of local scenario copies vs the canonical F5-02 mock-harness JSONs | both copies |
| T2 | `qa-route-retrieval.test.ts` | MR-01..MR-10 through the route with mock adapter/model/logger | `scenarios/mock_retrieval_scenarios.json` |
| T3 | `qa-route-refusals.test.ts` | RF-01..RF-14 including excluded titles 39/40/55, web/general, ruling, credibility, extra-record, DCS demand, restricted, pending, unknown/future effectivity, citation-failure conversion | `scenarios/mock_refusal_scenarios.json` |
| T4 | `qa-route-citations.test.ts` | MC-01..MC-08 plus builder exclusivity, SYNTHETIC preservation, confidence honesty, T-CIT-MISSING mandatory-citation failure | `scenarios/mock_citation_validation_scenarios.json` |
| T5 | `qa-route-guardrails.test.ts` | GG-01..GG-12 (window checks, scope diverts, response-side scans, injection, fail-closed classifier) | `scenarios/mock_guardrail_scenarios.json` |
| T6 | `qa-route-audit.test.ts` | MA-01..MA-07, both modes, trace propagation, sink content-rule rejections | `scenarios/mock_audit_log_scenarios.json` |
| T7 | `qa-route-environment.test.ts` | ME-01..ME-06 (banner event, chip data, echo, sentinel, mismatch, boot) | `scenarios/mock_environment_target_scenarios.json` |
| T8 | `qa-route-static-safety.test.ts` | Source-scan assertions: no Supabase import, no service-role naming, no database URL schemes, no embeddings call, no flat-JSON corpus import, no `loadRelevantCorpus` reference, contract-shape drift check | module graph plus contract JSONs |
| T9 | `qa-boot-checks.test.ts` | bootValidate matrix: missing target, unknown target, production sentinel, bad model IDs, excerpt flag defaulted on | environment module |
| - | `scenarios/*.json` (6 synced copies) | data only | F5-02 canon |

## 2. Harness mechanics (mirroring existing conventions)

Same `importRouteWithMocks` pattern as the existing chat-route suites, except mocking happens through the M1 factories (constructor injection) rather than vi.mock of the SDK module: tests construct the route handler with `{adapter: mockAdapter(fixture, failMode), modelClient: mockModel(profile), auditLogger: mockSink(failMode), environment: pinned}`. vi.mock remains only for the Supabase auth/rate-limit boundary, exactly as the existing suites do it.

## 3. Explicit test-to-requirement map (objective questions 7-10)

| Requirement | Proven by |
|---|---|
| No general legal fallback exists | T8 static scans plus RF-01/MR-07 behavioral (zero-fixture query yields refusal, never prose); `no_general_fallback_tests.json` |
| Excluded titles refused | T3 RF-02/03/04 plus GG-02 window variant; `excluded_scope_tests.json` |
| Citations mandatory | T4 T-CIT-MISSING plus MC-08 conversion plus doc 07 page defensive rule component test |
| Judicial guardrails stop impermissible requests | T5 GG-03/04/05 plus T3 RF-06/12/13 plus GA-2 suppression (GG-08) |
| Audit object present for everything | T6 (every scenario in T2-T5 also asserts its audit linkage inline) |
| Target label present | T7 (first-SSE-event assertion in every suite's shared helper) |
| No Supabase import / no service-role / no db URL / no embeddings | T8 |

## 4. Exit gate for M1 (feeds doc 15 sequence)

All nine suites green twice consecutively; existing 14-file suite untouched and green; lint and typecheck clean; secrets scan of the diff clean. These are the M1 acceptance criteria in the Codex prompt (doc 17).
