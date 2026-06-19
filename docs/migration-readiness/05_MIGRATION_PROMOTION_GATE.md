# Migration Promotion Gate

This gate controls whether draft files may move from `supabase/migrations_draft/` to `supabase/migrations/` for a local-only E6 real migration rehearsal.

Current gate status: closed.

## Promotion criteria

| Criterion | E5 status | Required before promotion |
|---|---|---|
| Current local validation passes | Passed with warnings | Keep the E5 validation JSON or rerun immediately before E6. |
| Real migrations remain local-only | Pending owner approval | E6 must target a disposable local database only. |
| Rollback/drop plan exists | Partially proven | E6 must name the disposable database and drop it after rehearsal. |
| No app code integration | Satisfied in E5 | Continue to prohibit app integration in E6. |
| No embeddings | Satisfied in E5 | Continue to prohibit embedding generation in E6. |
| No production corpus replacement | Satisfied in E5 | Continue to prohibit production corpus replacement in E6. |
| No remote database | Satisfied in E5 | Continue to prohibit Supabase preview and production in E6. |
| Owner written approval | Missing | Required before copying draft migrations into `supabase/migrations/`. |

## Files that may not move without approval

The draft set currently remains under `supabase/migrations_draft/`:

- `20260615090000_legal_authority_local_001_extensions_schemas.sql`
- `20260615090100_legal_authority_local_002_enums_reference.sql`
- `20260615090200_legal_authority_local_003_builds_sources_staging.sql`
- `20260615090300_legal_authority_local_004_units_versions_chunks.sql`
- `20260615090400_legal_authority_local_005_citations_warnings_relationships.sql`
- `20260615090500_legal_authority_local_006_audit_tables.sql`
- `20260615090600_legal_authority_local_007_core_integrity_indexes.sql`
- `20260615090700_legal_authority_local_008_views_rpcs.sql`
- `20260615090800_legal_authority_local_009_rls_grants.sql`
- `20260615090900_legal_authority_local_010_post_load_search_and_vector.sql`

No E5 action copied these files into `supabase/migrations/`.

## E6 local rehearsal requirements

If owner approval is granted, E6 should:

1. Copy draft migrations into `supabase/migrations/` only inside the local branch for rehearsal.
2. Apply them to a new disposable local PostgreSQL database.
3. Load and promote the corpus using local commands only.
4. Verify display gates, RLS drafts, RPC behavior, effectivity filtering, and audit reconstruction.
5. Drop the disposable local database.
6. Document whether the copied migration files should remain, be revised, or be removed before any later preview phase.

## Hard stop conditions

Stop and ask for direction if E6 would require:

- Supabase preview.
- Supabase production.
- Any remote database.
- App source changes.
- Ingestion script changes.
- Database-load script changes.
- Embeddings.
- Production corpus replacement.
- Source PDF changes.
- Substantial legal text in committed files.
