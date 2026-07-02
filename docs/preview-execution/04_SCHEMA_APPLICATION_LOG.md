# Schema Application Log

## Remote Application Status

Schema-only preview application completed successfully after the initial safe stop and manual owner-approved resume through Mac Terminal.

Target:

- Linked Supabase target: `benchbook-ai`.
- Project ref: `clerihqbjyczarqkiqnb`.
- Forbidden production target: `benchbook-ai-prod`.
- Forbidden production project ref: `suiylfayvjsjtbrsjrwx`.
- Production target touched: no.

## Application Method

Preview-safe schema files were applied one at a time with:

```bash
supabase db query --linked --file <file>
```

`supabase db push` was not used.

Reason: `supabase db push` dry run showed it would apply the default `supabase/migrations/` list, including older pending app migrations and E6 local-rehearsal migrations. That was outside the schema-only preview approval scope.

Operational caveat: because `supabase db query --linked --file` was used, Supabase migration history may not record these preview-safe files as formal migrations.

## Applied Files

| Order | File | Status |
|---:|---|---|
| 1 | `supabase/migrations_preview/20260627090000_preview_legal_authority_001_extensions_schemas.sql` | applied |
| 2 | `supabase/migrations_preview/20260627090100_preview_legal_authority_002_enums_reference.sql` | applied |
| 3 | `supabase/migrations_preview/20260627090200_preview_legal_authority_003_builds_sources_staging.sql` | applied |
| 4 | `supabase/migrations_preview/20260627090300_preview_legal_authority_004_units_versions_chunks.sql` | applied |
| 5 | `supabase/migrations_preview/20260627090400_preview_legal_authority_005_citations_warnings_relationships.sql` | applied |
| 6 | `supabase/migrations_preview/20260627090500_preview_legal_authority_006_audit_tables.sql` | applied |
| 7 | `supabase/migrations_preview/20260627090600_preview_legal_authority_007_core_integrity_indexes.sql` | applied |
| 8 | `supabase/migrations_preview/20260627090700_preview_legal_authority_008_views_rpcs.sql` | applied |
| 9 | `supabase/migrations_preview/20260627090800_preview_legal_authority_009_rls_grants.sql` | applied |
| 10 | `supabase/migrations_preview/20260627090900_preview_legal_authority_010_post_load_search_and_vector.sql` | applied |

## Commands Not Used

- No `supabase db push`.
- No production Supabase command.
- No command against `benchbook-ai-prod`.
- No corpus load command.
- No embedding command.
- No app integration command.

## Application Boundary

The schema application created only the schema shell. It did not load source manifest rows, expanded authority chunks, extraction warnings, corpus data, embeddings, or app-facing production corpus data.
