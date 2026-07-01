# QA and Guardrail Dashboard

Date: 2026-07-01 (Fable 5 launch acceleration pass)

## Guardrail layer status

| Layer | Status | Next step |
|---|---|---|
| L1 pre-generation scope guard | PARTIAL (excluded-title and criminal/traffic classes exist in app module) | Extend to ruling/credibility/extra-record classes per doc 09 section 3 (integration phase) |
| L2 retrieval gating | READY (database-level, verified) | Maintain through reload |
| L3 prompt contract | DRAFT REQUIRED | Doc 09 section 4 elements; authored in next Fable design pass |
| L4 post-generation verification | PARTIAL (existence-only validator exists) | Re-point at alias RPC; proposition support deferred |
| L5 refusal audit | SCHEMA READY, unwired | Contract C11 at integration |
| L6 UI honesty | PARTIAL (badges exist) | QA banner and as-of display at integration |

## Test asset status

| Asset | Status |
|---|---|
| Refusal matrix (22 rows M01-M22) | DESIGNED (doc 10 + guardrail_test_manifest.json) |
| Golden query plan (8 blocks, 60-90 queries) | DESIGNED (doc 11); authoring can start now |
| Harness mock tier | NOT BUILT (design next Fable pass; build X4) |
| Harness fixture tier (synthetic corpus) | NOT BUILT; depends on disposable-DB fixtures |
| Preview manual tier | NOT RUNNABLE until E15 + O2 |
| Acceptance gate | Defined: doc 09 section 5; two consecutive green runs required |

## Refusal kind coverage map

| refusal_records kind | Covered by matrix rows |
|---|---|
| out_of_scope | M10, M11, M12, M13 |
| no_authority_support | M05, M09, M18, M19 |
| future_effective_only | M17 |
| restricted_display_only | M08 |
| unsupported_answer | (post-internal-QA, proposition support) |
| safety_guardrail | M07, M14, M15, M16, M20, M22 |

## Leakage tolerance

Zero. Any restricted-text, DCS-as-authority, excluded-title, or model-memory-law event in any tier is a hard fail that blocks internal QA sessions until triaged.
