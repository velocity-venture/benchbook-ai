# 14 - Phased Launch Runway to Internal QA

Date: 2026-07-01
Pass: Claude Fable 5 launch acceleration
Horizon: the Fable 5 window closes 2026-07-07. This runway front-loads high-context design work into that window and sequences execution work (Codex plus corpus admin) behind owner decisions.

## 1. Dependency spine

```
O1 approve E14C
  -> E14C corpus-admin review (identity 38, effectivity 54, signoff 439, sampled extraction QA)
  -> Codex: patch-application tooling (P3) + local rehearsal (P4-P6)
  -> O6 approve preview reload -> E15 reload + post-load QA
  -> O2 approve internal-QA display tier -> promotion + re-QA
  -> O7 approve app integration build -> QA route under contract C1-C14
  -> guardrail + golden harness green (docs 10, 11)
  -> O8 approve internal QA launch -> internal QA sessions begin
```

Parallel tracks that never block the spine: owner decisions O3 (TRE filter design), O4 (black-letter Lexis ruling), O5 (migrations fence); license review workstream; DCS mapping (optional, post-launch).

## 2. Fable 5 window plan (through 2026-07-07)

Daily objectives, expected outputs, stop conditions. All Fable work is local-only documentation and QA design; the standing prohibitions apply every day.

| Day | Objective | Expected output | Stop conditions |
|---|---|---|---|
| Jul 1 (done) | This launch acceleration package | 19 docs, 5 manifests, 5 dashboards, validator script, all validated | Any prohibited action appearing necessary |
| Jul 2 | Owner reviews decision packet (doc 15); Fable produces the app-integration readiness design and QA harness plan (per doc 17): QA route architecture, RPC usage design resolving G1/G3 at the app layer, harness module layout, fixture corpus design | `docs/fable5-app-integration-design/` package (design only, no app code) | Owner rejects E14C; any design requiring schema change beyond approved scope |
| Jul 3 | Fable: corpus-admin review-session tooling spec plus E14C work instructions upgrade (walkthrough order, decision recording rules, escalation forms); golden-query authoring templates for the corpus admin | E14C execution kit (docs plus CSV templates) | Same |
| Jul 4 | Fable: E15 reload execution runbook draft (commands as a plan, not run), object-verification script spec (S2), post-reload QA checklist consolidation | E15 runbook package (no execution) | Any step requiring remote contact to draft |
| Jul 5 | Fable: internal QA session protocol (session scripts, finding-capture forms, regression rules), plus prompt-contract draft implementing doc 09 L3 | Internal QA operations kit | - |
| Jul 6 | Fable: cross-package consistency pass; reconcile all manifests; final owner briefing digest; handoff prompts refreshed | Consolidated handoff set | - |
| Jul 7 | Buffer for owner questions and final revisions; freeze the Fable-era artifact set | Frozen, validated package | Window ends |

Codex and corpus-admin execution (E14C review, patch tooling, reload) proceed on their own clock after O1/O6; nothing in the Fable window blocks them.

## 3. Post-window execution phases (Codex-led, sequenced)

| Phase | Content | Gate to start | Est. effort |
|---|---|---|---|
| X1 | Commit this package (verification steps in doc 16); optional: migrations fence per O5 | Owner review of doc 15 | Small |
| E14C | Corpus-admin review execution using the E14C kit | O1 | Admin days, spread |
| X2 | Patch-application tooling + Mac Studio rehearsal (static validation, disposable dry run, SQL regeneration to /tmp) | E14C substantially complete | 1 focused session |
| E15 | Preview reload per runbook + full read-only re-QA | O6 | 1 session + QA |
| X3 | Internal-QA display tier promotion + re-QA | O2 | Small |
| X4 | QA route implementation under contract C1-C14, harness mock+fixture tiers green | O7 | The largest build; several sessions |
| X5 | Preview-tier harness green twice; guardrail acceptance (doc 09 section 5) signed | X4 | QA-driven |
| Internal QA launch | Sessions begin under the doc 08 definition | O8 | - |

## 4. What could compress the runway

- Sampled extraction QA batched by family (already designed) is the single biggest time saver against the 4,198-row queue.
- Golden-query authoring by the corpus admin can start immediately (needs only doc 11 templates), fully parallel.
- The fixture-tier harness needs no corpus decisions at all; Codex can build it any time after X1.

## 5. What must not be compressed

- Human review of identity/effectivity/signoff queues (no bulk approvals).
- The separation between reload execution and display promotion.
- Two consecutive green harness runs before the first internal QA session.
