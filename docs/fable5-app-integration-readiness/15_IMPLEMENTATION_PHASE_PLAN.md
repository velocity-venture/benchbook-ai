# 15 - Implementation Phase Plan

Date: 2026-07-02
Phase: F5-02. Machine mirror: `manifests/implementation_phase_manifest.json`.

## 1. Phase sequence

| Phase | Content | Executor | Gate | Explicitly NOT in phase |
|---|---|---|---|---|
| **F5-03 (recommended next)** | Local-only app integration design review and file-level implementation plan: exact new/changed file list for the QA route, adapter interface finalization (G3 text-delivery choice, G2 DCS reference mechanism), prompt contract final text, harness module skeletons as design docs, boot-check list, review of this package's contracts against the file plan | Fable 5 (window permitting) or Codex | None (design only) | No app code changes unless separately approved |
| **F5-04** | App code integration on a feature branch with MOCK BACKEND ONLY: QA route implementing docs 03-11, T1 harness built and green, mock model client, boot checks, banner and envelope UI; merges only into the feature branch | Codex | Owner approval O7-design (approve F5-03 output) | No Supabase connection for legal retrieval; no preview contact; T2 may run only against local disposable fixtures |
| **E15-B** | Owner-approved preview reload target verification and dry-run planning: object-verification script (S2) built and rehearsed locally, reload runbook finalized from F5-01 doc 06, patch tooling output validated | Codex plus corpus admin | E14C substantially complete | No reload execution unless separately approved (O6) |
| E15 | Preview reload execution per runbook | Codex with owner approval document | O6 signed | Nothing beyond the named reload action |
| X3 | Internal-QA display tier promotion plus re-QA | Codex with owner approval | O2 and O4 signed | No production display |
| F5-05 | Point the F5-04 feature branch at the reloaded preview (first real connection), T2/T3 harness green, golden suite first run | Codex | O7 signed; E15 and X3 complete | No production; no embeddings |
| Internal QA launch | Sessions begin | Owner plus named participants | O8 (harness green twice, guardrail acceptance signed) | - |

Immediate next phase is F5-03. Production, embeddings, display-gate opening, and live app database connection are all explicitly NOT next.

## 2. Parallel tracks (unchanged from F5-01, restated for continuity)

E14C corpus-admin review (gated on O1) and golden-query authoring proceed independently of F5-03/F5-04 and do not block them; the reload chain (E15-B, E15, X3) is the corpus-side dependency for F5-05 only.

## 3. Feature-branch discipline for F5-04

Branch from `refactor/codex-gpt55-launch-prep` (suggested name `feature/qa-route-mock-backend`); no changes to the legacy `/api/chat` route; every commit passes T1 plus the existing 14-file Vitest suite; secrets scan per commit; merge back only after owner review of the F5-04 completion report.

## 4. Effort estimates

F5-03: one focused high-context session. F5-04: the largest build, several sessions (route, adapter, harness, UI envelope, boot checks). E15-B: one session plus corpus-admin time. F5-05: one to two sessions plus QA runs.
