# Next Session Start Here

Date: 2026-06-28
Branch: `refactor/codex-gpt55-launch-prep`
Scope: Phase E10-B handoff

## Current state

Phase E10-B loaded and retained a gated preview corpus batch in Supabase preview:

- target: `benchbook-ai`;
- project ref: `clerihqbjyczarqkiqnb`;
- load batch id: `e84dc405-5ceb-4652-849d-e8467ac55a77`;
- corpus build id: `7191eb09-8c7f-41c3-a0d9-740693c10799`;
- build version: `phase-e10-preview-e84dc405-5ceb-4652-849d-e8467ac55a77`.

Displayable views remain zero. App integration remains absent. Embeddings remain unpopulated.

## Read first

Read these before taking further action:

1. `CODEX-SOURCE-OF-TRUTH.md`
2. `CODEX-BRIEF.md`
3. `docs/preview-corpus-load-execution/00_PHASE_E10B_PREVIEW_CORPUS_LOAD_DRY_RUN_REPORT.md`
4. `docs/preview-corpus-load-execution/01_PHASE_E10B_VERIFICATION_RESULTS.md`
5. `docs/preview-corpus-load-execution/02_PHASE_E10B_RETAINED_BATCH_AND_ROLLBACK_STATUS.md`
6. `docs/preview-corpus-load-planning/18_E10_IMPLEMENTATION_DECISION_PACKET.md`

## Do not do next unless separately approved

Do not connect the app to the preview corpus. Do not generate embeddings. Do not relax display gates. Do not enable production display. Do not replace or touch production corpus data. Do not contact `benchbook-ai-prod` or project ref `suiylfayvjsjtbrsjrwx`.

Do not commit generated SQL under `/tmp/benchbook_e10_preview_load/`. Those artifacts contain corpus text.

## Safe local checks

```bash
cd /Users/m3_ai_factory/Projects/benchbook-ai && git status --short && find docs/preview-corpus-load-execution -type f | sort
```

## Recommended next decision

Choose one:

1. keep the retained preview batch for internal database QA;
2. approve cleanup of the retained preview batch using reviewed rollback SQL;
3. approve a separate Phase E11 for additional preview QA;
4. approve a separate app-integration planning phase, with display gates still closed by default.
