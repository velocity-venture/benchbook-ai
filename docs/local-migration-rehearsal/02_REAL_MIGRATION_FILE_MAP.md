# Real Migration File Map

All E6 real migration files match the reviewed draft migrations byte-for-byte. At the current pre-check, these files were already present as untracked workspace files and were verified rather than overwritten.

| Draft migration | E6 real migration | SQL changed |
|---|---|---|
| `supabase/migrations_draft/20260615090000_legal_authority_local_001_extensions_schemas.sql` | `supabase/migrations/20260619090000_e6_local_rehearsal_legal_authority_001_extensions_schemas.sql` | no |
| `supabase/migrations_draft/20260615090100_legal_authority_local_002_enums_reference.sql` | `supabase/migrations/20260619090100_e6_local_rehearsal_legal_authority_002_enums_reference.sql` | no |
| `supabase/migrations_draft/20260615090200_legal_authority_local_003_builds_sources_staging.sql` | `supabase/migrations/20260619090200_e6_local_rehearsal_legal_authority_003_builds_sources_staging.sql` | no |
| `supabase/migrations_draft/20260615090300_legal_authority_local_004_units_versions_chunks.sql` | `supabase/migrations/20260619090300_e6_local_rehearsal_legal_authority_004_units_versions_chunks.sql` | no |
| `supabase/migrations_draft/20260615090400_legal_authority_local_005_citations_warnings_relationships.sql` | `supabase/migrations/20260619090400_e6_local_rehearsal_legal_authority_005_citations_warnings_relationships.sql` | no |
| `supabase/migrations_draft/20260615090500_legal_authority_local_006_audit_tables.sql` | `supabase/migrations/20260619090500_e6_local_rehearsal_legal_authority_006_audit_tables.sql` | no |
| `supabase/migrations_draft/20260615090600_legal_authority_local_007_core_integrity_indexes.sql` | `supabase/migrations/20260619090600_e6_local_rehearsal_legal_authority_007_core_integrity_indexes.sql` | no |
| `supabase/migrations_draft/20260615090700_legal_authority_local_008_views_rpcs.sql` | `supabase/migrations/20260619090700_e6_local_rehearsal_legal_authority_008_views_rpcs.sql` | no |
| `supabase/migrations_draft/20260615090800_legal_authority_local_009_rls_grants.sql` | `supabase/migrations/20260619090800_e6_local_rehearsal_legal_authority_009_rls_grants.sql` | no |
| `supabase/migrations_draft/20260615090900_legal_authority_local_010_post_load_search_and_vector.sql` | `supabase/migrations/20260619090900_e6_local_rehearsal_legal_authority_010_post_load_search_and_vector.sql` | no |

## Preservation status

| Item | Result |
|---|---|
| Draft migrations preserved | yes |
| Draft migrations modified | no |
| E6 real migrations created | yes |
| E6 real migration count | 10 |
| Byte-for-byte comparison passed | yes |
