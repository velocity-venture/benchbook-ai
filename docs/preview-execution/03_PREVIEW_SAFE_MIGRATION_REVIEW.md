# Preview-safe Migration Review

## Migration Set Created

Preview-specific files were created under `supabase/migrations_preview/`.

| Preview file | Source E6 file | Difference |
|---|---|---|
| `20260627090000_preview_legal_authority_001_extensions_schemas.sql` | `20260619090000_e6_local_rehearsal_legal_authority_001_extensions_schemas.sql` | Removed local `auth` schema and `auth.uid()` stub creation. Updated comments and schema comments for preview. |
| `20260627090100_preview_legal_authority_002_enums_reference.sql` | `20260619090100_e6_local_rehearsal_legal_authority_002_enums_reference.sql` | Comment-only preview scope update. |
| `20260627090200_preview_legal_authority_003_builds_sources_staging.sql` | `20260619090200_e6_local_rehearsal_legal_authority_003_builds_sources_staging.sql` | Comment-only preview scope update. |
| `20260627090300_preview_legal_authority_004_units_versions_chunks.sql` | `20260619090300_e6_local_rehearsal_legal_authority_004_units_versions_chunks.sql` | Comment-only preview scope update. |
| `20260627090400_preview_legal_authority_005_citations_warnings_relationships.sql` | `20260619090400_e6_local_rehearsal_legal_authority_005_citations_warnings_relationships.sql` | Comment-only preview scope update. |
| `20260627090500_preview_legal_authority_006_audit_tables.sql` | `20260619090500_e6_local_rehearsal_legal_authority_006_audit_tables.sql` | Comment-only preview scope update. |
| `20260627090600_preview_legal_authority_007_core_integrity_indexes.sql` | `20260619090600_e6_local_rehearsal_legal_authority_007_core_integrity_indexes.sql` | Comment-only preview scope update. |
| `20260627090700_preview_legal_authority_008_views_rpcs.sql` | `20260619090700_e6_local_rehearsal_legal_authority_008_views_rpcs.sql` | Comment-only preview scope update. |
| `20260627090800_preview_legal_authority_009_rls_grants.sql` | `20260619090800_e6_local_rehearsal_legal_authority_009_rls_grants.sql` | Comment-only preview scope update. |
| `20260627090900_preview_legal_authority_010_post_load_search_and_vector.sql` | `20260619090900_e6_local_rehearsal_legal_authority_010_post_load_search_and_vector.sql` | Comment-only preview scope update. |

## Auth Stub Resolution

E7 identified the local `auth.uid()` stub in E6 migration 001 as a preview blocker.

E8 resolved this in the preview-specific migration set by removing:

- `create schema if not exists auth;`
- `create or replace function auth.uid() ...`

The RLS policies in migration 009 still reference `auth.uid()`, as they should in a Supabase-hosted project.

## Guardrails Preserved

- No app grants were added.
- No broad `authority_chunks` read policy was added.
- No production display enablement was added.
- No corpus rows were inserted.
- No embeddings were generated or populated.
- Vector index creation remains deferred.

## Local Smoke Result

The preview-safe set applied cleanly to a disposable local PostgreSQL database when a temporary auth shim was supplied by the smoke-test harness outside the migration files. That proves the preview-safe files remain structurally coherent while avoiding local auth stub creation inside the actual migration set.
