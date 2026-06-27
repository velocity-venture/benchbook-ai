# E6 Migration File Disposition Review

## Files Reviewed

The reviewed E6 legal authority migration files are:

- `supabase/migrations/20260619090000_e6_local_rehearsal_legal_authority_001_extensions_schemas.sql`
- `supabase/migrations/20260619090100_e6_local_rehearsal_legal_authority_002_enums_reference.sql`
- `supabase/migrations/20260619090200_e6_local_rehearsal_legal_authority_003_builds_sources_staging.sql`
- `supabase/migrations/20260619090300_e6_local_rehearsal_legal_authority_004_units_versions_chunks.sql`
- `supabase/migrations/20260619090400_e6_local_rehearsal_legal_authority_005_citations_warnings_relationships.sql`
- `supabase/migrations/20260619090500_e6_local_rehearsal_legal_authority_006_audit_tables.sql`
- `supabase/migrations/20260619090600_e6_local_rehearsal_legal_authority_007_core_integrity_indexes.sql`
- `supabase/migrations/20260619090700_e6_local_rehearsal_legal_authority_008_views_rpcs.sql`
- `supabase/migrations/20260619090800_e6_local_rehearsal_legal_authority_009_rls_grants.sql`
- `supabase/migrations/20260619090900_e6_local_rehearsal_legal_authority_010_post_load_search_and_vector.sql`

Each file matches the corresponding `supabase/migrations_draft/` file byte-for-byte.

## Disposition Questions

| Question | E7 Answer |
|---|---|
| Should the 10 E6 files remain under `supabase/migrations/` as-is for future preview planning? | Yes. Keep them as the committed local-rehearsal baseline and planning reference. |
| Should they be renamed before preview execution? | Not during E7. A later preview-execution prompt may approve renaming or replacement if the owner wants preview-specific filenames. |
| Should they be revised before preview execution? | Likely yes, or at least expressly reviewed. Migration 001 contains a local-only `auth.uid()` stub and local-rehearsal comments that are not appropriate to apply blindly to Supabase preview. |
| Should they be removed and regenerated later? | No removal during E7. Regeneration should be considered only if the owner wants a cleaner preview-specific migration set. |

## Recommended Disposition

Keep the E6 files as-is in `supabase/migrations/` for now.

Reasons:

- They preserve the exact SQL proven in Phase E6.
- They give the owner a stable artifact to review before preview planning.
- They preserve filename order and map cleanly to the reviewed draft migration set.
- Removing or renaming them now would create churn without improving preview readiness.
- E7 approval expressly prohibits migration modification.

Preview execution should not treat these files as automatically approved for remote application. A later Phase E8 prompt must decide whether to apply them as-is, revise them, or create a preview-specific replacement set.

## Preview-specific Review Items

Before any Supabase preview action, review these items:

- Migration 001 creates an `auth` schema and `auth.uid()` function for local databases. Supabase already has auth helpers, so this must not overwrite or conflict with preview auth behavior.
- File comments still say local disposable draft only. The owner should decide whether preview migration comments should be revised for a remote preview target.
- Migration 010 has a nullable embedding placeholder only if `vector` exists. Embeddings remain prohibited and must not be populated.
- RLS policies are drafted but no broad `authority_chunks` read policy exists. Preview app access should remain blocked unless separately approved.

## Decision Record

E7 decision: keep as-is for planning, do not execute, and require a separate preview-safe owner approval before remote use.
