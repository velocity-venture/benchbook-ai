# Phase E8 Retry Or E9 Next Prompt

Use this prompt only if Judge Eckel authorizes a retry of schema-only preview execution or a new next phase.

```text
You are GPT-5.5 operating in Codex.

Project: BenchBook.AI
Repository root: /Users/m3_ai_factory/Projects/benchbook-ai
Branch: refactor/codex-gpt55-launch-prep

Phase E8 created a preview-safe migration set but stopped before remote schema application because target `benchbook-ai` could not be positively verified from the local environment.

Before taking action, read:

1. CODEX-SOURCE-OF-TRUTH.md
2. CODEX-BRIEF.md
3. docs/preview-execution/00_PHASE_E8_SCHEMA_ONLY_PREVIEW_EXECUTION_REPORT.md
4. docs/preview-execution/01_OWNER_APPROVAL_SCOPE.md
5. docs/preview-execution/02_TARGET_VERIFICATION.md
6. docs/preview-execution/03_PREVIEW_SAFE_MIGRATION_REVIEW.md
7. docs/preview-execution/04_SCHEMA_APPLICATION_LOG.md
8. docs/preview-execution/05_SCHEMA_ONLY_GATE_VERIFICATION.md
9. docs/preview-execution/06_ROLLBACK_PLAN_AND_STATUS.md
10. docs/preview-execution/07_NO_CORPUS_LOAD_ATTESTATION.md
11. docs/preview-execution/08_REMAINING_BLOCKERS_AFTER_E8.md
12. docs/preview-planning/05_PREVIEW_ACCESS_AND_DATA_GATES.md
13. docs/migration-readiness/07_PRODUCTION_EXCLUSION_RULES.md

Approved target, if this is an E8 retry:

- Supabase preview target: benchbook-ai
- Forbidden target: benchbook-ai-prod

Before any remote command:

1. Verify the Supabase CLI or approved connection method is available.
2. Verify the target is exactly benchbook-ai.
3. Verify the target is not benchbook-ai-prod.
4. Do not print tokens, passwords, service-role keys, or connection strings.
5. Stop if the target cannot be verified.

Use only:

- supabase/migrations_preview/20260627090000_preview_legal_authority_001_extensions_schemas.sql
- supabase/migrations_preview/20260627090100_preview_legal_authority_002_enums_reference.sql
- supabase/migrations_preview/20260627090200_preview_legal_authority_003_builds_sources_staging.sql
- supabase/migrations_preview/20260627090300_preview_legal_authority_004_units_versions_chunks.sql
- supabase/migrations_preview/20260627090400_preview_legal_authority_005_citations_warnings_relationships.sql
- supabase/migrations_preview/20260627090500_preview_legal_authority_006_audit_tables.sql
- supabase/migrations_preview/20260627090600_preview_legal_authority_007_core_integrity_indexes.sql
- supabase/migrations_preview/20260627090700_preview_legal_authority_008_views_rpcs.sql
- supabase/migrations_preview/20260627090800_preview_legal_authority_009_rls_grants.sql
- supabase/migrations_preview/20260627090900_preview_legal_authority_010_post_load_search_and_vector.sql

Still prohibited unless separately approved:

- benchbook-ai-prod.
- Production Supabase.
- Corpus load.
- Derivative legal text upload.
- Embeddings.
- App integration.
- Production corpus replacement.
- Display gate relaxation.
- Production display enablement.
- Legal answer behavior changes.
- Raw source PDF changes.

Schema-only verification after application:

- Authority chunk rows are 0.
- Displayable production view count is 0.
- Staging tables contain 0 corpus rows.
- RLS is enabled.
- No broad raw authority_chunks read policy exists.
- Audit tables exist.
- No embeddings are generated.

Stop immediately if:

- The target appears to be production.
- Any command would touch benchbook-ai-prod.
- A secret appears in output.
- Corpus loading appears necessary.
- Rollback cannot be documented.
```
