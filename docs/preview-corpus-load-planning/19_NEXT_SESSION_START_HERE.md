# Next Session Start Here

Date: 2026-06-27
Branch: `refactor/codex-gpt55-launch-prep`
Scope: Phase E9 planning handoff

## Current state

Phase E9 is a docs-only preview corpus-load planning phase.

Last known current HEAD during E9: `b8dd611 Update Phase E8 preview execution record`.

Working tree state during this handoff: untracked docs under `docs/preview-corpus-load-planning/`.

No files were staged or committed as part of this handoff. No remote database command was run. No Supabase project was contacted. No corpus rows were loaded. No embeddings were generated. No app code, migrations, loader scripts, source PDFs, or corpus source data were changed.

## E9 document set

Base planning package:

1. `docs/preview-corpus-load-planning/00_PHASE_E9_PREVIEW_CORPUS_LOAD_PLANNING_REPORT.md`
2. `docs/preview-corpus-load-planning/01_OWNER_APPROVAL_SCOPE.md`
3. `docs/preview-corpus-load-planning/02_E8_SCHEMA_BASELINE.md`
4. `docs/preview-corpus-load-planning/03_MIGRATION_HISTORY_CAVEAT_PLAN.md`
5. `docs/preview-corpus-load-planning/04_PREVIEW_CORPUS_LOAD_SCOPE.md`
6. `docs/preview-corpus-load-planning/05_LOAD_SEQUENCE_AND_COMMAND_PLAN_NO_ACTION.md`
7. `docs/preview-corpus-load-planning/06_ROW_COUNT_EXPECTATIONS.md`
8. `docs/preview-corpus-load-planning/07_DISPLAY_AND_RETRIEVAL_GATE_PLAN.md`
9. `docs/preview-corpus-load-planning/08_RESTRICTED_AND_PENDING_QA_EXCLUSION_PLAN.md`
10. `docs/preview-corpus-load-planning/09_ROLLBACK_AND_CLEANUP_PLAN.md`
11. `docs/preview-corpus-load-planning/10_REMAINING_BLOCKERS_BEFORE_LOAD.md`
12. `docs/preview-corpus-load-planning/11_OWNER_APPROVALS_REQUIRED_FOR_E10.md`
13. `docs/preview-corpus-load-planning/12_NEXT_PHASE_PROMPT.md`

Deep planning addendum:

14. `docs/preview-corpus-load-planning/13_LOAD_PATH_ENGINEERING_REVIEW.md`
15. `docs/preview-corpus-load-planning/14_PREVIEW_LOAD_TABLE_DEPENDENCY_MAP.md`
16. `docs/preview-corpus-load-planning/15_PREVIEW_LOAD_VALIDATION_QUERY_CATALOG.md`
17. `docs/preview-corpus-load-planning/16_CORPUS_GATE_TEST_MATRIX.md`
18. `docs/preview-corpus-load-planning/17_MIGRATION_HISTORY_RECONCILIATION_OPTIONS.md`
19. `docs/preview-corpus-load-planning/18_E10_IMPLEMENTATION_DECISION_PACKET.md`
20. `docs/preview-corpus-load-planning/19_NEXT_SESSION_START_HERE.md`

## Do not do next unless separately approved

Do not run any remote Supabase command. Do not run any Supabase CLI command. Do not run remote `psql`. Do not use a database URL, password, token, service-role key, or connection string. Do not contact `benchbook-ai-prod`. Do not load preview corpus rows. Do not upload source manifest rows, expanded chunks, extraction warnings, or deduplication groups. Do not generate embeddings. Do not modify app code, migrations, loader scripts, source PDFs, or corpus source data.

## Safe next commands

Use local-only inspection first:

```bash
cd /Users/m3_ai_factory/Projects/benchbook-ai && git status --short && find docs/preview-corpus-load-planning -type f | sort | sed -n '1,260p'
```

## Recommended next decision

The next owner decision should be one of:

1. commit the E9 docs-only planning package;
2. continue E10-A planning-only work with no remote commands;
3. approve E10-B remote-write preview corpus-load dry run with exact target, zero-display gates, no embeddings, no app integration, and rollback requirements;
4. defer all remote loading until corpus QA blockers are reduced.

The safest default is E10-A planning-only. If the owner wants live preview progress, E10-B is the correct next executable phase, but only with explicit written approval.
