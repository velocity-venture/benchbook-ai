# Next Session Start Here

Date: 2026-06-28
Branch: `refactor/codex-gpt55-launch-prep`

## Current state

Phase E11 completed read-only preview corpus QA against `benchbook-ai`, project ref `clerihqbjyczarqkiqnb`.

The retained E10-B preview corpus batch remains present and gated:

- load batch id: `e84dc405-5ceb-4652-849d-e8467ac55a77`;
- corpus build id: `7191eb09-8c7f-41c3-a0d9-740693c10799`;
- authority chunks: 6,590;
- displayable chunks: 0;
- populated embeddings: 0;
- app integration: none.

## Read first

1. `CODEX-SOURCE-OF-TRUTH.md`
2. `CODEX-BRIEF.md`
3. `docs/preview-corpus-qa/00_PHASE_E11_PREVIEW_CORPUS_QA_REPORT.md`
4. `docs/preview-corpus-qa/03_READ_ONLY_QUERY_INVENTORY.md`
5. `docs/preview-corpus-qa/12_BLOCKER_TRIAGE_AND_NEXT_QA_WORK.md`
6. `docs/preview-corpus-qa/13_RETAINED_BATCH_KEEP_OR_ROLLBACK_DECISION.md`
7. `docs/preview-corpus-qa/14_NEXT_PHASE_PROMPT.md`

## Do not do without separate approval

- Do not contact production Supabase.
- Do not run remote writes.
- Do not load corpus rows.
- Do not generate embeddings.
- Do not modify app code.
- Do not connect the app to the preview corpus.
- Do not relax display gates.
- Do not enable production display.
- Do not modify migrations, scripts, or source PDFs.
- Do not stage or commit files unless the owner asks.

## Recommended next owner decision

Approve E12-A blocker triage and metadata QA planning, or E12-B read-only preview retrieval/citation QA. Do not move to app integration or production display yet.
