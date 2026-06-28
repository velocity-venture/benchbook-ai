# Migration History Caveat Plan

## Caveat

E8 applied preview-safe schema files with:

```bash
supabase db query --linked --file <file>
```

E8 did not use:

```bash
supabase db push
```

The reason was operationally sound: `supabase db push` dry run showed it would apply the default `supabase/migrations/` list, including older pending app migrations and E6 local-rehearsal migrations. That was outside the schema-only preview approval scope.

## Operational consequence

Because `supabase db query --linked --file` was used, Supabase migration history may not record the preview-safe files as formal migrations.

Future migration commands, migration-history checks, preview resets, or production migration planning could therefore see a mismatch between:

- the actual remote schema state, and
- the formal Supabase migration history table.

## Required decision before any future remote migration or load phase

Before E10 runs any remote write or load, Judge Eckel or the delegated technical lead must decide how to handle the history caveat:

1. Treat preview as a manually applied schema and verify actual schema state with read-only introspection before any load.
2. Create an owner-approved migration-history repair plan for preview only.
3. Rebuild preview from a clean baseline with a formally tracked migration plan.
4. Keep E10 planning-only and defer all remote writes.

## Recommended E9 position

For E10 planning, do not rely only on Supabase migration history. Require actual schema verification before load:

- schemas exist;
- tables exist;
- views exist;
- functions exist;
- expected policies exist;
- no broad raw `authority_chunks` policy exists;
- corpus tables are still at expected row counts before load.

No migration repair should occur unless a future written owner approval expressly authorizes it.
