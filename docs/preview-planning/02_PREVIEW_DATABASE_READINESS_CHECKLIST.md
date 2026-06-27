# Preview Database Readiness Checklist

## Required Before Touching Preview

No preview database may be touched until all of the following are true:

- The owner gives a separate written Phase E8 approval.
- The exact Supabase preview project or database target is named.
- The approved action is named: schema-only, schema plus gated load, verification only, rollback, or other specific action.
- The authorized migration file list is stated.
- The owner decides whether the E6 local-rehearsal files are used as-is, revised, renamed, or replaced.
- The preview load scope is stated.
- A rollback plan is approved.
- Preview access is restricted to named owner-approved accounts.
- Production Supabase remains out of scope.
- App integration remains out of scope unless separately approved.
- Embeddings remain out of scope unless separately approved.
- Production display gates remain closed unless separately approved.

## Exact Target Information Required

A future preview prompt must provide:

- Supabase project reference or preview database identifier.
- Confirmation that the target is preview only.
- Connection method approved for the phase.
- Whether Supabase CLI is allowed.
- Whether direct `psql` connection is allowed.
- Whether `supabase link` remains prohibited or is expressly approved for that phase.
- Whether `supabase db push` remains prohibited or is expressly approved for that phase.
- Authorized migration files.
- Authorized load scope.
- Authorized preview users.
- Rollback and cleanup expectations.

## Secrets And Credentials

Required secrets may include:

- Supabase access token if CLI actions are approved later.
- Preview database connection string or database password if direct PostgreSQL access is approved later.
- Supabase service role key only if a later approved loader path requires it.

Handling rules:

- Do not print secrets.
- Do not commit secrets.
- Do not paste secrets into docs.
- Use Doppler for API keys, tokens, service keys, and programmatic secrets.
- Bitwarden is for usernames and passwords only.
- If a secret appears in output, stop and ask for direction.

## Migration List For Preview Consideration

Candidate legal authority migration list:

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

The final preview list must be approved in the Phase E8 prompt.

## Load Scope For Preview Consideration

Recommended preview sequence:

1. Schema-only preview migration.
2. Gate verification with empty target tables.
3. Optional gated corpus load only if separately approved.
4. No production display enablement.
5. No embeddings.
6. No app integration.

If derivative corpus rows are loaded into preview, all pending, restricted, DCS, unknown-effectivity, and future-effective gates must remain enforced.
