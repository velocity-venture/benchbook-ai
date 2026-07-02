# Phase E7 Next Prompt

Use this prompt only if Judge Eckel gives written approval for a next phase.

```text
You are GPT-5.5 operating in Codex.

Project: BenchBook.AI
Repository root: /Users/m3_ai_factory/Projects/benchbook-ai
Branch: refactor/codex-gpt55-launch-prep

Phase E6 local real-migration rehearsal is complete.

Before taking action, read:

1. CODEX-SOURCE-OF-TRUTH.md
2. CODEX-BRIEF.md
3. docs/local-migration-rehearsal/00_PHASE_E6_LOCAL_MIGRATION_REHEARSAL_REPORT.md
4. docs/local-migration-rehearsal/01_OWNER_APPROVAL_SCOPE.md
5. docs/local-migration-rehearsal/02_REAL_MIGRATION_FILE_MAP.md
6. docs/local-migration-rehearsal/03_LOCAL_REHEARSAL_EXECUTION.md
7. docs/local-migration-rehearsal/04_GATE_VERIFICATION.md
8. docs/local-migration-rehearsal/05_ROLLBACK_AND_DROP_PROOF.md
9. docs/local-migration-rehearsal/06_REMAINING_BLOCKERS_AFTER_E6.md
10. docs/migration-readiness/03_OWNER_APPROVAL_DECISIONS.md
11. docs/migration-readiness/06_PREVIEW_DATABASE_GATE.md
12. docs/migration-readiness/07_PRODUCTION_EXCLUSION_RULES.md

Current E6 result:

- E6 real migration files were created under supabase/migrations/.
- The E6 legal authority real migration set applied cleanly to a disposable local PostgreSQL database.
- The disposable database was dropped.
- Existing local static validation passed with known blockers.
- Existing local target promotion succeeded with all production display and retrieval gates closed.
- No remote database was touched.
- No embeddings were generated.
- No app source files, ingestion scripts, database-load scripts, source PDFs, or draft migrations were changed.
- Nothing was staged or committed during E6.

Do not proceed unless this prompt expressly authorizes the next target.

Possible next phase options:

1. Owner review only: review E6 docs and decide whether the E6 migration files should remain, be revised, or be removed before preview.
2. Local-only refinement: revise only local migration rehearsal documentation or file naming, with no remote database and no app integration.
3. Preview planning only: write a preview plan without connecting to Supabase.
4. Preview execution: only if the prompt names the exact Supabase preview target and explicitly authorizes the allowed action.

Still prohibited unless separately approved:

- Supabase preview connection.
- Supabase production connection.
- Any remote database connection.
- supabase db push.
- supabase link.
- Commands requiring a Supabase access token.
- App integration.
- Embeddings.
- Production corpus replacement.
- Production display enablement.
- Display gate relaxation.
- Source PDF changes.
- Substantial legal source text in committed docs.

If a preview phase is approved, verify and report the exact target, migration list, load scope, rollback plan, data-access rules, and display gate posture before running any command.
```

