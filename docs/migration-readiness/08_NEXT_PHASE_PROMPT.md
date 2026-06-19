# Phase E6 Next Prompt

Use this prompt only if Judge Eckel gives written approval to proceed.

```text
You are GPT-5.5 operating in Codex.

Project: BenchBook.AI
Repository root: /Users/m3_ai_factory/Projects/benchbook-ai
Branch: refactor/codex-gpt55-launch-prep

You are authorized to act as the Phase E6 local real-migration rehearsal lead, but only for a disposable local database.

Before making any changes, read completely:

1. CODEX-SOURCE-OF-TRUTH.md
2. CODEX-BRIEF.md
3. docs/migration-readiness/00_PHASE_E5_OWNER_REVIEW_READINESS_REPORT.md
4. docs/migration-readiness/01_LOCAL_PROOFS_COMPLETED.md
5. docs/migration-readiness/02_REMAINING_QA_BLOCKERS.md
6. docs/migration-readiness/03_OWNER_APPROVAL_DECISIONS.md
7. docs/migration-readiness/04_CORPUS_ADMIN_REVIEW_QUEUE.md
8. docs/migration-readiness/05_MIGRATION_PROMOTION_GATE.md
9. docs/migration-readiness/06_PREVIEW_DATABASE_GATE.md
10. docs/migration-readiness/07_PRODUCTION_EXCLUSION_RULES.md

Controlling product rules:

- BenchBook.AI is a Tennessee Juvenile and Family Court judicial research product.
- Preserve the V1 corpus scope lock.
- Do not add Titles 39, 40, or 55.
- Do not add web retrieval.
- Do not couple to BenchMark Standard.
- Preserve optional private local juvenile court rules as a future court-private overlay.
- Do not expose derivative legal body text in committed reports.

Phase E6 objective:

Perform a local-only real migration rehearsal against a disposable local PostgreSQL database using migration files copied from supabase/migrations_draft/ into supabase/migrations/ only because owner approval was granted for this local rehearsal.

Allowed:

- Read repository files.
- Copy the approved draft migration files into supabase/migrations/ for local rehearsal only.
- Create a disposable local PostgreSQL database.
- Apply migrations locally.
- Run the existing local load and validation commands.
- Write documentation under docs/migration-rehearsal/.
- Use /tmp for runtime JSON outputs.

Not allowed:

- Connect to Supabase preview.
- Connect to Supabase production.
- Connect to any remote database.
- Modify app source code.
- Modify ingestion scripts.
- Modify database-load scripts.
- Generate embeddings.
- Replace the production corpus.
- Move, rename, delete, or alter source PDFs.
- Add Titles 39, 40, or 55.
- Add web retrieval.
- Stage or commit files unless separately authorized.

Required checks before work:

- pwd
- git branch --show-current
- git status --short
- git log --oneline -8
- verify data/ingestion-expanded/EXPANDED_AUTHORITY_CHUNKS.jsonl is ignored
- verify no remote database target is configured or used
- verify local PostgreSQL availability

Required E6 verification:

- Apply copied migration files to a disposable local database.
- Load and promote the current expanded corpus locally.
- Verify displayable production view count remains 0.
- Verify restricted chunks in displayable view remains 0.
- Verify pending chunks in displayable view remains 0.
- Verify DCS production-eligible count remains 0.
- Verify TRE non-limited scope count remains 0.
- Verify future-effective versions visible before 2026-07-01 remains 0.
- Verify unknown-effectivity rows remain production-excluded.
- Verify audit reconstruction join works.
- Verify answer audit records do not store answer text.
- Drop the disposable local database after the run.

Required deliverables:

- docs/migration-rehearsal/00_PHASE_E6_LOCAL_REAL_MIGRATION_REHEARSAL_REPORT.md
- docs/migration-rehearsal/01_MIGRATION_APPLICATION_RESULTS.md
- docs/migration-rehearsal/02_LOAD_AND_PROMOTION_RESULTS.md
- docs/migration-rehearsal/03_GATE_VERIFICATION_RESULTS.md
- docs/migration-rehearsal/04_ROLLBACK_AND_DROP_RESULTS.md
- docs/migration-rehearsal/05_REMAINING_PREVIEW_BLOCKERS.md
- docs/migration-rehearsal/06_NEXT_PHASE_PROMPT.md

Stop and ask for direction if you need any remote database, app code changes, ingestion changes, database-load script changes, embeddings, production corpus replacement, source PDF changes, dependency installs, or substantial legal text in committed files.
```
