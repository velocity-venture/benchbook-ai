# F5-03 Report: File-Level App Integration Plan and Mock-Backend Feature-Branch Design

Date: 2026-07-02
Phase: F5-03 (third Fable 5 planning pass)
Baseline: branch `refactor/codex-gpt55-launch-prep`, HEAD `a918f6b`
Author role: planning and design only; no app code, migrations, pipelines, or databases touched.

## 1. What this phase produced

F5-01 accelerated the corpus-side launch plan. F5-02 defined the app-integration contracts (C1-C14) and a 57-scenario mock QA harness. F5-03, this package, converts those contracts into a FILE-LEVEL implementation plan: exactly which files a future mock-only phase (M1/F5-04) will create, which it will touch, which are forbidden, in what commit order, and how every planned behavior is tested, so that implementation can start the moment the owner approves decision M-1.

Deliverables (all under `docs/fable5-file-level-app-plan/` unless noted):

- 20 numbered docs (00-19): scope, inventory, architecture findings, file-level map, mock backend design, contract validation, UI guardrail/refusal flow, citation rendering, audit flow, environment control, test harness plan, no-live-database enforcement, security plan, risk register, 13-step implementation sequence, owner decision packet, next-session prompts.
- 5 file maps (`file-maps/`): existing inventory (with per-group M1 action), 27-entry create map, 3-entry modify map (all deferred, marked `not_modified_in_f5_03`), forbidden-files map (8 categories including migrations, loaders, ingestion, PDFs, generated corpus sources, live-DB connection files, production target config), and the 9-file test plan.
- 7 mock-backend design contracts (`mock-backend-design/`): route, retrieval service (LegalRetrievalAdapter), guardrail service (GP-1..9, GQ-1..5, GA-1..4), citation validator, audit logger, environment label, fixture design.
- 8 test plans (`test-plan/`): the six scenario families (MR/RF/MC/GG/MA/ME, 57/57 covered) plus two objective suites (excluded-scope, no-general-fallback).
- 5 manifests and 5 dashboards (machine mirrors and one-page views for owner, engineer, QA, guardrail reviewer, risk reviewer).
- Validator: `scripts/launch_readiness/validate_fable5_file_level_app_plan.py` (stdlib-only, checks package completeness and the phase's own prohibitions).

## 2. Design pillars

1. **One authority seam.** `LegalRetrievalAdapter` is the only path by which legal authority reaches the app. Its methods mirror the two security-definer RPCs (`lookup_citation_alias`, `search_displayable_chunks`, 50-row clamp). In M1 the factory enum contains only `'mock'`; a live binding is not a config choice but a type change, reviewable and forbidden until F5-05 under the O6+O2+O7 gate chain.
2. **Mock-first, labeled loudly.** M1 ships against SYNTHETIC fixtures in reserved fake citation ranges with mandatory SYNTHETIC display prefixes, a MOCK ONLY banner, a target chip with fixture hash, and an environment echo on every envelope. Nothing mock can pass as authority.
3. **Fail closed everywhere.** Guardrail pattern load failure, classifier exceptions, audit write failures, boot validation failures, malformed adapter payloads: each converts to refusal or error, never to a degraded answer. All six `refusal_records` kinds map 1:1 so live-phase audit needs no translation.
4. **Tests precede code.** The 13-step sequence (S1-S13) lands scenario sync and static safety scans in S1-S2, before any feature module exists. The existing 14-file suite stays green at every commit.
5. **Closed universe enforced twice.** Behaviorally (refusal/guardrail scenarios for Titles 39/40/55, web retrieval, general knowledge, ruling/credibility/extra-record classes) and statically (no supabase import, no flat-JSON corpus import, no embeddings, no loadRelevantCorpus in the qa-research graph).

## 3. What F5-03 did NOT do

No file under `app/` was created or modified. No migrations, loader scripts, ingestion scripts, source PDFs, or generated corpus sources were touched. No Supabase command was run; no database (preview or production) was contacted; no secrets were used, printed, or committed. No corpus rows were loaded and no embeddings were generated. Display gates are exactly as F5-02 left them: 0 displayable rows, deny-by-default. The three files listed in the modify map are plans only, each marked `not_modified_in_f5_03`.

## 4. Owner actions requested (doc 16)

- **M-1 (blocking):** approve the M1 mock-only implementation phase per the file maps and sequence. Recommended: approve.
- **M-2 (blocking):** ratify four M1 policy defaults as a block. Recommended: ratify.
- **M-3 (non-blocking):** branch preference; defaults to `feature/qa-research-mock-only`.

O1 (E14C corpus review) from F5-01 remains the program's critical path and is independent of everything in this package.

## 5. Verification of this package

The F5-03 validator checks: all 45 package files present and parseable; metadata-only and no-body-text flags set; secret patterns absent; no prohibited action claims; modify map fully deferred; forbidden map covers the required categories. Results of the full validation battery (this validator, the two prior phase validators, the three metadata QA validators, guardrail grep, em-dash and body-text scans) are recorded in the final session response. The static chunk validator is expected to fail in cloud clones because its inputs live only on the Mac Studio; that failure is environmental, not a package defect.

## 6. Read order

Owner: this report, then doc 16, then `dashboards/owner_mock_implementation_dashboard.md`. Implementer: docs 04, 05, 15, 17, then the file maps and design contracts. QA: doc 11 and `dashboards/qa_mock_harness_dashboard.md`. Next session: doc 19.
