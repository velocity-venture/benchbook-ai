# Rollback Plan And Status

## Rollback Status

No remote rollback was needed because no remote schema migration was applied.

## Rollback Scope If A Later Remote Run Applies The Schema

Schema-only E8 would create or modify only:

- `legal_authority` schema.
- `legal_authority_stage` schema.
- Legal authority types, tables, indexes, views, functions, RLS policies, and comments.
- Optional nullable embedding column only if pgvector exists. No embedding values are allowed.

It must not affect existing app schemas or app tables.

## Safe Rollback SQL For Verified Preview Target Only

Use only after verifying the target is `benchbook-ai` and not `benchbook-ai-prod`.

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
select count(*) from legal_authority.authority_chunks;
select count(*) from legal_authority_stage.raw_expanded_chunks;
```

## Rollback Stop Conditions

Stop before rollback if:

- The target is not verified as `benchbook-ai`.
- The target appears to be `benchbook-ai-prod`.
- Any app schema or app table would be affected.
- Corpus rows were loaded unexpectedly.
- Rollback would remove data outside `legal_authority` or `legal_authority_stage`.
- Secrets appear in logs or output.
