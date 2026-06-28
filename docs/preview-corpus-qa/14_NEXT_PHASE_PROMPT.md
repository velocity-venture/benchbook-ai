# Phase E12 Prompt

Use this prompt for the next owner-approved phase.

## Recommended E12-A

You are GPT-5.5 operating in Codex.

Project: BenchBook.AI
Repository root: `/Users/m3_ai_factory/Projects/benchbook-ai`
Branch: `refactor/codex-gpt55-launch-prep`

Owner approval is granted for Phase E12-A only: blocker triage and metadata QA planning.

Authorized actions are limited to local documentation, local metadata analysis, and read-only review of existing E11 results. Do not run remote database writes. Do not load corpus rows. Do not generate embeddings. Do not modify app code. Do not connect the app to the preview corpus. Do not relax display gates. Do not enable production display. Do not touch production Supabase.

Read first:

1. `CODEX-SOURCE-OF-TRUTH.md`
2. `CODEX-BRIEF.md`
3. `docs/preview-corpus-qa/00_PHASE_E11_PREVIEW_CORPUS_QA_REPORT.md`
4. `docs/preview-corpus-qa/12_BLOCKER_TRIAGE_AND_NEXT_QA_WORK.md`
5. `docs/preview-corpus-qa/13_RETAINED_BATCH_KEEP_OR_ROLLBACK_DECISION.md`
6. `docs/migration-readiness/04_CORPUS_ADMIN_REVIEW_QUEUE.md`

Objectives:

1. Build a metadata-only blocker triage plan for 17 unresolved units and 21 unresolved chunks.
2. Build a metadata-only effectivity QA plan for 15 unknown-effectivity versions and 39 chunks.
3. Reconcile the historical encrypted or OCR-blocked DCS handbook item with current metadata reporting zero failed-or-OCR sources.
4. Keep DCS guardrail/reference-only and production-eligible zero.
5. Keep TRE limited-scope.
6. Preserve the V1 corpus scope lock.

Deliver a new documentation package under `docs/preview-corpus-e12/`. Do not stage or commit unless separately instructed.

## Alternate E12-B

If the owner instead approves E12-B, limit the phase to read-only preview retrieval and citation QA. Keep display gates closed. Do not connect the app. Do not generate embeddings.
