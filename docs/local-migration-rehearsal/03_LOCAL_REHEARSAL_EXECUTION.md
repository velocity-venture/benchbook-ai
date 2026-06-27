# Local Rehearsal Execution

## Real migration application

Disposable database:

`benchbook_e6_real_migration_rehearsal_20260626_201716`

Command pattern:

```bash
createdb benchbook_e6_real_migration_rehearsal_20260626_201716
for migration in supabase/migrations/2026061909*_e6_local_rehearsal_legal_authority_*.sql; do
  psql -v ON_ERROR_STOP=1 -d benchbook_e6_real_migration_rehearsal_20260626_201716 -f "$migration"
done
dropdb --if-exists benchbook_e6_real_migration_rehearsal_20260626_201716
```

Result:

| Item | Result |
|---|---:|
| Database created | yes |
| E6 legal authority migrations applied | 10 |
| Legal authority and staging base tables | 20 |
| Legal authority views | 3 |
| Legal authority functions | 3 |
| Displayable count before load | 0 |
| Database dropped | yes |

Runtime logs were written under `/tmp`.

## Static validation

Command:

```bash
python3 scripts/database_load/validate_expanded_chunks_for_load.py --json > /tmp/benchbook_phase_e6_static_validation.json
```

Result:

| Item | Result |
|---|---|
| Command completed | yes |
| Metadata only | true |
| Body text printed | false |
| Expanded chunks | 6,590 |
| Duplicate chunk IDs | 0 |
| Citation alias collisions | 0 |

## Local target promotion

Command:

```bash
python3 scripts/database_load/dry_run_load_legal_authority.py --create-local-db --drop-after --json > /tmp/benchbook_phase_e6_target_promotion.json
```

Result:

| Item | Result |
|---|---|
| Command completed | yes |
| Local database target | `benchbook_e4_dry_run_8ad59af777` |
| Local database created | true |
| Existing loader draft migrations applied | 10 |
| Target promotion executed | true |
| Local database dropped | true |
| Remote database connection | false |
| Body text printed | false |
| Embeddings generated | false |

## Loader note

The existing loader still imports `MIGRATIONS_DRAFT`, applies `supabase/migrations_draft/*.sql` internally, and uses a `benchbook_e4_dry_run_*` disposable database name when `--local-db-name` is not provided. E6 did not change that script. For that reason, the real-migration application proof and the corpus load proof were run as separate local-only checks.

Because the E6 real migration files are byte-for-byte copies of the reviewed drafts, the two local checks jointly prove:

- the reviewed SQL can exist as real migration files under `supabase/migrations/`;
- the real E6 migration files apply cleanly in order;
- the current corpus can still be staged and promoted locally by the existing loader pathway.
