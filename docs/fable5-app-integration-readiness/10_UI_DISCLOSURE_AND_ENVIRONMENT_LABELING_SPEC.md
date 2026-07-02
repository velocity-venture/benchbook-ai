# 10 - UI Disclosure and Environment Labeling Spec

Date: 2026-07-02
Phase: F5-02

## 1. Environment target labeling (contract clause C12 made concrete)

1. The deployment pins exactly one `environment_target` at build/config time: `preview_internal_qa` or `local_fixture`. There is no production value available to pin; `production_prohibited` exists in the enum only as an always-refuse sentinel so accidental configuration fails safe.
2. Every retrieval request and response carries the target; the UI renders it in a persistent header chip and in every source card (doc 04 environment_tier field).
3. Internal-QA builds show a persistent, non-dismissable banner: "INTERNAL QA - NOT FOR JUDICIAL RELIANCE". Banner presence is asserted by harness scenario ME-01 and is a stop condition if absent (SC-7).
4. Target mismatch between pinned config and response echo refuses and alerts (SC-1).

## 2. Disclosure elements carried over and extended

| Element | Exists today | Change at integration |
|---|---|---|
| Confidence badge (HIGH/MEDIUM/LOW) | Yes | Inputs become database verification levels; HIGH requires all citations verified_retrieved (GA-4) |
| Unverified-citation warnings | Yes | Driven by doc 04 levels; unresolved citations render as warnings, never as citations |
| Coverage banner | Yes | Source becomes database facts: active tier, family coverage, as-of date |
| "AI can make mistakes" notice | Yes | Keep verbatim |
| Refusal transparency | Partial (scope refusals) | All doc 05 refusals state what was refused, why, and permissible help |
| As-of date statement | No | Every answer states the as-of date used (C14) |
| Scope tags | No | TRE evidentiary tag, DCS reference-only tag on every relevant card |
| QA signoff status | No | Rendered on source cards in internal-QA tier |

## 3. Honesty rules

1. No UI element may imply proposition-level verification while `proposition_supported` is null (doc 04 section 3).
2. Reference material renders in a visually separate section and never counts toward answer confidence (doc 07 section 4).
3. The corpus browsers (TCA/TRJPP/DCS pages), while still flat-JSON, must not be presented inside the internal-QA route as database-backed; either they are re-pointed at integration or they carry a distinct "legacy demo corpus" label until retired. Decision recorded in F5-03 design.
4. Model attribution: `model_used` continues to surface in telemetry; QA sessions log it per answer via answer_audit_records.

## 4. Test hooks

`mock_environment_target_scenarios.json` ME-01 through ME-06: banner presence, header chip, target echo match, production sentinel refusal, mismatch refusal plus alert, and source-card tier tags.
