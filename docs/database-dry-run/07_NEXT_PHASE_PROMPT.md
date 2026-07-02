# Next Phase Prompt

You are GPT-5.5 operating in Codex.

Project: BenchBook.AI
Repository root: `/Users/m3_ai_factory/Projects/benchbook-ai`
Branch: `refactor/codex-gpt55-launch-prep`

You are authorized to act as the Phase E3 local target-table promotion dry-run lead for BenchBook.AI only if the owner explicitly approves Phase E3. This remains local disposable database work only.

Do not connect to Supabase production, Supabase preview, or any remote database. Do not modify app source code. Do not generate embeddings. Do not replace production corpus output. Do not alter raw source PDFs. Do not stage or commit files unless separately instructed.

Read first:

- `docs/database-dry-run/00_PHASE_E2_DRY_RUN_REPORT.md`
- `docs/database-dry-run/01_LOCAL_DATABASE_SETUP.md`
- `docs/database-dry-run/02_MIGRATION_DRAFT_REVIEW.md`
- `docs/database-dry-run/03_DRY_RUN_LOAD_RESULTS.md`
- `docs/database-dry-run/04_SCHEMA_VALIDATION_RESULTS.md`
- `docs/database-dry-run/05_LOAD_RECONCILIATION_RESULTS.md`
- `docs/database-dry-run/06_REMAINING_BLOCKERS.md`
- `scripts/database_load/README.md`
- `scripts/database_load/validate_expanded_chunks_for_load.py`
- `scripts/database_load/dry_run_load_legal_authority.py`
- draft migrations under `supabase/migrations_draft/`
- Phase D design docs
- Phase E1 implementation plan docs

Phase E3 objective:

Extend the local dry-run loader so it promotes staged rows into target legal authority tables in a disposable local database only.

Required E3 work:

1. Promote source manifest rows into `source_files`.
2. Promote DCS primary and alias paths into `source_file_memberships`.
3. Construct authority units from normalized citation, rule, section, or policy identity.
4. Construct authority versions with effectivity partitioning.
5. Promote chunks into `authority_chunks` behind display gates.
6. Promote citation aliases and report collisions.
7. Promote extraction and chunk warnings.
8. Run display-gate tests against promoted target rows.
9. Run black-letter-only tests.
10. Run TRE limited-scope tests.
11. Run DCS duplicate membership tests.
12. Run answer audit reconstruction tests.

Required constraints:

- Local disposable database only.
- No remote database connection.
- No embeddings.
- No app code modification.
- No files under `supabase/migrations/`.
- No long legal source text in committed reports.
- Raw runtime outputs containing derivative legal text must remain untracked or outside the repo.

Stop and ask if:

- a remote database connection would be needed
- app code would need to change
- dependencies would need to be installed
- production credentials appear
- substantial legal text would need to be written into committed files
