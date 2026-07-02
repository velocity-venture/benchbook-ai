# Next Session Start Here

Date: 2026-06-29
Branch: `refactor/codex-gpt55-launch-prep`

## Current state

Phase E12-B completed read-only preview retrieval and citation QA against `benchbook-ai`, project ref `clerihqbjyczarqkiqnb`.

The retained preview batch remains present and gated:

- load batch id: `e84dc405-5ceb-4652-849d-e8467ac55a77`;
- corpus build id: `7191eb09-8c7f-41c3-a0d9-740693c10799`;
- displayable rows: 0;
- search displayable probes: 0 rows;
- citation lookup probes: 0 rows;
- populated embeddings: 0;
- app integration: none.

## Read first

1. `CODEX-SOURCE-OF-TRUTH.md`
2. `CODEX-BRIEF.md`
3. `docs/preview-retrieval-citation-qa/00_PHASE_E12B_RETRIEVAL_CITATION_QA_REPORT.md`
4. `docs/preview-retrieval-citation-qa/03_QUERY_INVENTORY_AND_SAFETY_REVIEW.md`
5. `docs/preview-retrieval-citation-qa/10_REMAINING_BLOCKERS_FOR_APP_INTEGRATION.md`
6. `docs/preview-retrieval-citation-qa/11_RETAINED_BATCH_DECISION_AFTER_RETRIEVAL_QA.md`
7. `docs/preview-retrieval-citation-qa/12_NEXT_PHASE_PROMPT.md`

## Do not do without separate approval

- Do not contact production Supabase.
- Do not run remote writes.
- Do not load corpus rows.
- Do not generate embeddings.
- Do not modify app code.
- Do not connect the app to the preview corpus.
- Do not relax display gates.
- Do not enable production display.
- Do not modify migrations, loader scripts, source PDFs, or corpus source files.
- Do not stage or commit files.

## Recommended next owner decision

Approve E13-A local metadata remediation planning and implementation, or E13-B continued read-only preview retrieval and citation QA with specific query expansions. Do not make app integration, embeddings, production display, or display-gate relaxation the immediate next default.
