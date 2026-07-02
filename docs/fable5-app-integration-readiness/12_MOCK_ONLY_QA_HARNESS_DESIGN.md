# 12 - Mock-Only QA Harness Design

Date: 2026-07-02
Phase: F5-02. Design only; the harness is built in F5-04. Scenario data: the six JSON files under `mock-harness/` (metadata-only, no legal passages).

## 1. Purpose and tiers

The harness proves the contracts of docs 03-11 without any database or corpus dependency, so contract enforcement can be verified before, during, and after the real integration. Three tiers (consistent with F5-01):

| Tier | Backend | Runs | Proves |
|---|---|---|---|
| T1 mock | In-memory mock retrieval adapter returning scenario fixtures | CI, every change | Routing, envelopes, refusal conversion, citation levels, audit call sequences, UI event framing |
| T2 fixture | Local disposable Postgres with synthetic corpus (obviously fake authorities; loaded via existing dry-run tooling patterns) | Pre-merge and nightly | End-to-end SQL behavior: gates, as-of filtering, RPC semantics, audit row joins |
| T3 preview-manual | Reloaded preview, internal-QA tier | Before internal QA launch, then weekly | Real-corpus golden queries and refusal matrix (doc 13; F5-01 docs 10-11) |

This document specifies T1 fully; T2/T3 reuse the same scenario schema with different runners.

## 2. Architecture (module layout for F5-04)

- `scripts/qa_harness/` (new, no app imports beyond the route handler under test):
  - `run_mock_scenarios.ts` (T1 runner; loads scenario JSON, drives the QA route handler with a mock retrieval adapter and mock model client, asserts expectations)
  - `mock_retrieval_adapter.ts` (implements the doc 03 adapter interface from scenario fixtures)
  - `mock_model_client.ts` (returns scripted generations, including misbehaving ones for GA-series tests: fabricated citations, ruling-shaped text, injection compliance attempts)
  - `assertions.ts` (envelope, audit-sequence, and leakage assertions shared across tiers)
- Vitest integration: scenarios run as parameterized tests inside the existing `app/src/__tests__/` conventions.

Mock model client note: post-generation checks (GA series) are testable only if the model can misbehave on demand; scripted generations are therefore part of the scenario schema (`scripted_generation_profile` field, values like `well_behaved`, `fabricates_citation`, `recommends_ruling`, `injection_compliant`).

## 3. Scenario schema (shared by all six files)

Fields: scenario_id, category, description (metadata language only), request (contract request fields), fixture (mock retrieval outcome: result metadata rows without passages, or gate outcomes), scripted_generation_profile, expected (response class, refusal kind/variant/stage, citation levels, envelope separation, audit calls in order, leakage assertions), tier_applicability.

## 4. Coverage map

| File | Scenarios | Covers |
|---|---|---|
| mock_retrieval_scenarios.json | MR-01..MR-10 | Exact-citation hit, FTS hit, combined, TRE in/out of intent, DCS reference divert, zero-result refusal, retrieval error fail-closed, as-of conformity, result-limit clamp |
| mock_refusal_scenarios.json | RF-01..RF-14 | Doc 05 section 2 variant table, one-to-one |
| mock_citation_validation_scenarios.json | MC-01..MC-08 | Doc 04 verification levels, granularity clamp, scope tags, all-unresolved conversion |
| mock_guardrail_scenarios.json | GG-01..GG-12 | GP/GQ/GA classes, multi-turn window, post-refusal recovery, injection resistance |
| mock_audit_log_scenarios.json | MA-01..MA-07 | Write sequences per doc 09, reconstruction drill, fail-closed audit writes |
| mock_environment_target_scenarios.json | ME-01..ME-06 | Doc 10 labeling, sentinel and mismatch refusals, boot checks |

57 scenarios total at design time; the runner treats the JSON as the source of truth so QA can add scenarios without code changes.

## 5. Pass criteria (gate for calling T1 green)

100 percent scenario pass; zero leakage assertions failed; audit-sequence assertions exact (order and count); two consecutive green runs on unchanged code; runner completes with no network access (enforced by test environment).

## 6. Relationship to acceptance gates

T1 green is required before F5-04 merges any QA-route code. T1 plus T2 green is required before requesting owner decision O7 review completion. T3 green twice is the final gate before internal QA sessions (O8), unchanged from F5-01.
