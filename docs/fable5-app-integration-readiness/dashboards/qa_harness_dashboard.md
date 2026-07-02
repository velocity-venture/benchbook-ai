# QA Harness Dashboard

Date: 2026-07-02 (F5-02)

## Scenario inventory (designed this pass; built in F5-04)

| File | Prefix | Count | Focus |
|---|---|---:|---|
| mock_retrieval_scenarios.json | MR | 10 | Exact/FTS hits, TRE intent, DCS divert, zero-result, fail-closed, as-of, limit clamp |
| mock_refusal_scenarios.json | RF | 14 | Full doc 05 variant table one-to-one |
| mock_citation_validation_scenarios.json | MC | 8 | Verification levels, granularity clamp, scope tags, all-unresolved conversion |
| mock_guardrail_scenarios.json | GG | 12 | GP/GQ/GA classes, window checks, recovery, injection, fail-closed classifier |
| mock_audit_log_scenarios.json | MA | 7 | Write sequences, reconstruction drill, fail-closed audit |
| mock_environment_target_scenarios.json | ME | 6 | Banner, chips, echo match, sentinel, mismatch, boot checks |
| **Total** | | **57** | |

## Tier gates

| Tier | Backend | Gate it protects |
|---|---|---|
| T1 mock | In-memory adapter + scripted model client | Every F5-04 merge |
| T2 fixture | Local disposable Postgres, synthetic corpus | O7 review completion |
| T3 preview-manual | Reloaded preview, internal-QA tier | O8 (with golden suite, twice green) |

## Golden suite (doc 13)

8 blocks, 60-90 queries; corpus admin authors GB6 (citation forms) and GB1 (Title 37 bench topics) first; runner built in F5-04; first T3 run after E15 + O2.

## Burndown rules

Every failure gets one disposition: alias gap, metadata gap, ranking, prompt defect, guardrail defect. Regression lock: a previously passing query failing blocks internal QA sessions until triaged. Zero leakage tolerance at every tier.
