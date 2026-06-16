# Migration Draft Review

Draft migrations were created under `supabase/migrations_draft/`. They are not real Supabase migrations and must not be copied into `supabase/migrations/` without owner approval.

## Draft Files

1. `20260615090000_legal_authority_local_001_extensions_schemas.sql`
2. `20260615090100_legal_authority_local_002_enums_reference.sql`
3. `20260615090200_legal_authority_local_003_builds_sources_staging.sql`
4. `20260615090300_legal_authority_local_004_units_versions_chunks.sql`
5. `20260615090400_legal_authority_local_005_citations_warnings_relationships.sql`
6. `20260615090500_legal_authority_local_006_audit_tables.sql`
7. `20260615090600_legal_authority_local_007_core_integrity_indexes.sql`
8. `20260615090700_legal_authority_local_008_views_rpcs.sql`
9. `20260615090800_legal_authority_local_009_rls_grants.sql`
10. `20260615090900_legal_authority_local_010_post_load_search_and_vector.sql`

## Revisions From Phase D Draft

- Split the monolithic Phase D draft into ordered migration drafts.
- Added `legal_authority_stage` staging schema.
- Added local `auth.uid()` stub so RLS drafts parse in a disposable non-Supabase database.
- Removed hard foreign keys to `public.profiles`, `public.chat_sessions`, and `public.chat_messages` for local validity.
- Kept nullable user and chat IDs in audit tables for future Supabase integration.
- Added retention columns:
  - retrieval logs: 90 days
  - answer audits: 1 year
  - refusal records: 1 year
- Deferred `embedding vector(1536)` when pgvector is unavailable.
- Deferred vector indexes until embeddings are authorized and populated.
- Added staging tables for manifest, expanded chunks, warnings, dedupe groups, and load errors.
- Added production-safe RPC contracts for exact citation lookup, filtered full-text search, and refusal logging.
- Preserved no broad raw `authority_chunks` policy for ordinary app clients.

## Local Validity Result

All 10 draft migration files applied successfully to a disposable local PostgreSQL database.

## Production Caveats

Before promoting these drafts into real migrations:

- Remove or revise the local `auth.uid()` stub for Supabase.
- Restore appropriate Supabase foreign keys where safe.
- Confirm pgvector extension availability in the target project.
- Confirm role names for Judge, admin, internal QA, service role, and ordinary beta users.
- Confirm SECURITY DEFINER RPC ownership.
- Confirm retention policy language with privacy policy review.
- Confirm whether staging tables belong in permanent migrations or local-only dry-run tooling.
