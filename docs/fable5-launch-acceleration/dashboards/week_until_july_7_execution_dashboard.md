# Week Until July 7 Execution Dashboard

Date: 2026-07-01. Fable 5 availability ends 2026-07-07. This dashboard tracks the high-context work that should be extracted from the window, alongside the parallel human/Codex tracks it must not block.

## Fable 5 track (high-context design, local-only, no prohibitions relaxed)

| Day | Deliverable | Status | Stop condition |
|---|---|---|---|
| Jul 1 | Launch acceleration package (this) | DONE | - |
| Jul 2 | App-integration readiness design + QA harness plan (`docs/fable5-app-integration-design/`) | QUEUED (prompt ready: `../17_NEXT_CLAUDE_FABLE5_PROMPT.md`) | Any deliverable requiring app code or DB contact |
| Jul 3 | E14C execution kit (review-session walkthroughs, decision recording rules, golden-query authoring templates) | QUEUED | Owner rejects O1 |
| Jul 4 | E15 reload runbook draft + object-verification script spec (no execution) | QUEUED | Any step requiring remote contact to draft |
| Jul 5 | Internal QA operations kit (session protocol, finding forms) + prompt-contract draft | QUEUED | - |
| Jul 6 | Consistency pass, manifest reconciliation, owner briefing digest | QUEUED | - |
| Jul 7 | Buffer, freeze | QUEUED | Window ends |

## Parallel tracks (not Fable, not blocked by the window)

| Track | Actor | Gate | Can start |
|---|---|---|---|
| Verify + commit this package (X1) | Codex on Mac Studio | Owner glance at doc 15 | Immediately |
| E14C review sessions | Corpus admin | O1 | The day O1 is signed |
| Golden-query authoring | Corpus admin | None | Immediately |
| Patch tooling (X2) | Codex | E14C progress | After first review sessions |
| License review workstream (restricted Lexis) | Owner/counsel | None | Any time |

## What the window is NOT for

- No reload execution, no app code, no embeddings, no database contact of any kind from Fable sessions.
- No attempt to compress human review into the window; the window produces the kits that make review fast, not the review itself.

## Definition of window success

By end of 2026-07-07: this package committed (via Codex X1); integration design package done; E14C kit done; E15 runbook draft done; internal QA ops kit done; every artifact validated and secret/body-text clean; owner holding a one-page decision list with O1 already actionable.
