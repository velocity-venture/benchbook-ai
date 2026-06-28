# Phase E10 Next Prompt

Use this prompt only if Judge Eckel separately approves Phase E10.

```text
You are GPT-5.5 operating in Codex.

Project: BenchBook.AI
Repository root: /Users/m3_ai_factory/Projects/benchbook-ai
Branch: refactor/codex-gpt55-launch-prep

Phase E9 produced a docs-only preview corpus-load planning package. E9 did not run remote commands, did not load corpus data, did not generate embeddings, did not modify app code, and did not change migrations or scripts.

Before taking action, read:

1. CODEX-SOURCE-OF-TRUTH.md
2. CODEX-BRIEF.md
3. docs/preview-execution/00_PHASE_E8_SCHEMA_ONLY_PREVIEW_EXECUTION_REPORT.md
4. docs/preview-execution/02_TARGET_VERIFICATION.md
5. docs/preview-execution/04_SCHEMA_APPLICATION_LOG.md
6. docs/preview-execution/05_SCHEMA_ONLY_GATE_VERIFICATION.md
7. docs/preview-execution/08_REMAINING_BLOCKERS_AFTER_E8.md
8. docs/preview-corpus-load-planning/00_PHASE_E9_PREVIEW_CORPUS_LOAD_PLANNING_REPORT.md
9. docs/preview-corpus-load-planning/03_MIGRATION_HISTORY_CAVEAT_PLAN.md
10. docs/preview-corpus-load-planning/04_PREVIEW_CORPUS_LOAD_SCOPE.md
11. docs/preview-corpus-load-planning/05_LOAD_SEQUENCE_AND_COMMAND_PLAN_NO_ACTION.md
12. docs/preview-corpus-load-planning/06_ROW_COUNT_EXPECTATIONS.md
13. docs/preview-corpus-load-planning/07_DISPLAY_AND_RETRIEVAL_GATE_PLAN.md
14. docs/preview-corpus-load-planning/08_RESTRICTED_AND_PENDING_QA_EXCLUSION_PLAN.md
15. docs/preview-corpus-load-planning/09_ROLLBACK_AND_CLEANUP_PLAN.md
16. docs/preview-corpus-load-planning/10_REMAINING_BLOCKERS_BEFORE_LOAD.md
17. docs/preview-corpus-load-planning/11_OWNER_APPROVALS_REQUIRED_FOR_E10.md

E10 must be one of:

1. preview corpus-load dry-run planning only; or
2. owner-approved preview corpus-load dry run with remote writes.

Do not run any remote write command unless the E10 approval expressly authorizes remote writes.

Approved preview context, if remote writes are authorized:

- target: benchbook-ai
- project ref: clerihqbjyczarqkiqnb
- forbidden target: benchbook-ai-prod
- forbidden project ref: suiylfayvjsjtbrsjrwx

Controlling rules:

- BenchBook.AI is a Tennessee Juvenile and Family Court judicial research product.
- Preserve the V1 corpus scope lock.
- Do not add Titles 39, 40, or 55.
- Do not add web retrieval.
- Do not couple to BenchMark Standard.
- Do not print or commit secrets, tokens, passwords, database URLs, service-role keys, or connection strings.
- Do not include substantial legal source text in committed docs.

Still prohibited unless separately approved:

- Production Supabase.
- benchbook-ai-prod.
- Embeddings.
- App integration.
- Production corpus replacement.
- Display gate relaxation.
- Production display enablement.
- Legal answer behavior changes.
- Raw source PDF changes.

If E10 is planning-only:

- Do not run remote commands.
- Do not load corpus rows.
- Produce planning docs only.

If E10 is approved for preview corpus-load dry run with remote writes:

1. Verify target before every remote command.
2. Verify target is benchbook-ai and project ref is clerihqbjyczarqkiqnb.
3. Verify target is not benchbook-ai-prod and project ref is not suiylfayvjsjtbrsjrwx.
4. Run local static validation.
5. Confirm the E8 schema baseline.
6. Address the migration-history caveat before relying on migration history.
7. Use only a preview-safe load method reviewed in the E10 plan.
8. Load only the owner-approved row categories.
9. Keep displayable view count at 0.
10. Verify restricted chunks do not appear in displayable views.
11. Verify pending QA chunks do not appear in displayable views.
12. Verify DCS production-eligible count remains 0.
13. Verify TRE remains limited-scope.
14. Verify future-effective and unknown-effectivity gates.
15. Verify RLS and policies.
16. Verify no embeddings.
17. Verify no app integration.
18. Document rollback or cleanup.
19. Record commands without secrets.

Stop immediately if:

- the target appears to be production;
- any command would touch benchbook-ai-prod;
- a secret appears in output;
- app integration appears necessary;
- embedding generation appears necessary;
- display gate relaxation appears necessary;
- production corpus replacement appears necessary;
- owner approval does not clearly authorize the intended action.
```
