# Rollback Plan And Status

## Rollback Status

No rollback was executed because schema-only preview application succeeded.

Rollback remains documented for the verified preview target only, but it must not be used without separate owner approval.

## Current Scope On Preview

Schema-only E8 created or modified only:

- `legal_authority` schema.
- `legal_authority_stage` schema.
- Legal authority types, tables, indexes, views, functions, RLS policies, and comments.
- Optional nullable embedding column only if pgvector exists. No embedding values were approved or generated.

It did not load corpus data and did not affect production Supabase.

## Safe Rollback SQL For Verified Preview Target Only

Use only after verifying the target is `benchbook-ai`, project ref `clerihqbjyczarqkiqnb`, and not `benchbook-ai-prod`.

```sql
drop schema if exists legal_authority_stage cascade;
drop schema if exists legal_authority cascade;
```

This rollback is appropriate only if the schemas are used solely for the preview legal authority rehearsal and no later approved work depends on them.

## Non-destructive Verification Before Rollback

Before rollback, verify:

```sql
select schema_name
from information_schema.schemata
where schema_name in ('legal_authority', 'legal_authority_stage')
order by schema_name;
```

Verify no corpus rows exist:

```sql
select count(*) from legal_authority.source_files;
select count(*) from legal_authority.authority_units;
select count(*) from legal_authority.authority_versions;
select count(*) from legal_authority.authority_chunks;
```

## Rollback Stop Conditions

Stop before rollback if:

- The target is not verified as `benchbook-ai`.
- The project ref is not verified as `clerihqbjyczarqkiqnb`.
- The target appears to be `benchbook-ai-prod`.
- The project ref appears to be `suiylfayvjsjtbrsjrwx`.
- Any app schema or app table would be affected.
- Corpus rows were loaded unexpectedly.
- Rollback would remove data outside `legal_authority` or `legal_authority_stage`.
- Secrets appear in logs or output.
