# Next Phase Prompt

You are GPT-5.5 operating in Codex.

Project: BenchBook.AI
Repository root: `/Users/m3_ai_factory/Projects/benchbook-ai`
Branch: `refactor/codex-gpt55-launch-prep`

You are authorized to act as the Phase E2 migration-draft preparation lead for BenchBook.AI only if the owner has explicitly approved creating migration draft files. Treat all work as judicial, administrative, research, and product-development support for a Tennessee judicial bench book AI.

Do not conflate BenchBook.AI with The BenchMark Standard.

Before any action, read:

- `CODEX-SOURCE-OF-TRUTH.md`
- `docs/database-design/00_PHASE_D_DATABASE_DESIGN_REPORT.md`
- `docs/database-design/01_AUTHORITY_SCHEMA_DESIGN.md`
- `docs/database-design/02_DRAFT_SCHEMA_SQL.sql`
- `docs/database-design/03_CORPUS_LOAD_DESIGN.md`
- `docs/database-design/04_VERSION_EFFECTIVITY_DESIGN.md`
- `docs/database-design/05_DISPLAY_AND_LICENSE_GATE_DESIGN.md`
- `docs/database-design/06_RETRIEVAL_INDEX_DESIGN.md`
- `docs/database-design/07_EXISTING_SUPABASE_IMPACT_REVIEW.md`
- `docs/database-design/08_QA_ACCEPTANCE_CRITERIA.md`
- `docs/database-implementation-plan/00_PHASE_E1_IMPLEMENTATION_PLAN.md`
- `docs/database-implementation-plan/01_MIGRATION_CHECKLIST.md`
- `docs/database-implementation-plan/02_DRY_RUN_LOAD_PLAN.md`
- `docs/database-implementation-plan/03_DRY_RUN_VALIDATION_RULES.md`
- `docs/database-implementation-plan/04_SQL_TEST_PLAN.md`
- `docs/database-implementation-plan/05_RETRIEVAL_FILTER_TEST_PLAN.md`
- `docs/database-implementation-plan/06_DISPLAY_GATE_TEST_PLAN.md`
- `docs/database-implementation-plan/07_OPEN_APPROVAL_QUESTIONS.md`
- `scripts/database_load_design/README.md`
- `scripts/database_load_design/inspect_load_readiness.py`

Then run and report:

- `pwd`
- `git branch --show-current`
- `git status --short`
- `git log --oneline -5`
- `git check-ignore -v data/ingestion-expanded/EXPANDED_AUTHORITY_CHUNKS.jsonl`
- `find docs/database-implementation-plan scripts/database_load_design -type f | sort`

Phase E2 objective:

Prepare migration draft artifacts only if explicitly authorized. If authorization is not explicit, stop and ask.

Mandatory constraints:

- Do not connect to any database unless separately approved.
- Do not apply migrations.
- Do not load corpus data.
- Do not generate embeddings.
- Do not modify app source.
- Do not replace production corpus outputs.
- Do not include long legal source text in committed files.
- Do not stage ignored derivative legal-text outputs.
- Do not commit unless separately requested.

If authorized to draft migrations, use this order:

1. extensions and schemas
2. enums and reference data
3. builds, sources, and staging
4. units, versions, and chunks
5. citations, relationships, and warnings
6. audit tables
7. core integrity indexes
8. views and RPC contracts
9. RLS and grants
10. post-load search indexes, deferred until after dry-run load timing if appropriate

Before writing migration drafts, resolve these approval questions:

- production Supabase, preview Supabase, or local disposable database first
- approved schema names
- restricted material storage versus exclusion
- pgvector now or later
- DCS OCR-blocked handbook handling
- current and future-effective load policy
- TRE first-load policy
- DCS production approval policy

Expected outputs for Phase E2, if authorized:

- migration draft files or draft SQL outside `supabase/migrations/` unless explicitly authorized to create real migrations
- migration test checklist
- rollback and non-retroactive migration policy
- updated approval question log

Stop immediately if:

- a database connection would be needed
- production credentials appear
- app source changes would be needed
- legal source text would need to be printed
- a Supabase migration would be created without explicit authorization
