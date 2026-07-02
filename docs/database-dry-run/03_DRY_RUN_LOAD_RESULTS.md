# Dry-Run Load Results

Phase E2 ran both static validation and local disposable database staging.

## Static Validation Command

```bash
python3 scripts/database_load/validate_expanded_chunks_for_load.py
```

Result: passed core static validation with known load blockers.

## Local Dry-Run Command

```bash
python3 scripts/database_load/dry_run_load_legal_authority.py --create-local-db --drop-after
```

Result: passed.

## Local Database Actions

| Action | Result |
|---|---|
| Disposable local database created | yes |
| Draft migrations applied | 10 |
| Local corpus build row inserted | 1 |
| Source manifest rows staged | 677 |
| Expanded chunks staged | 6,587 |
| Extraction warning rows staged | 862 |
| DCS dedupe groups staged | 12 |
| Authority family seed rows | 5 |
| Disposable database dropped | yes |

## Not Performed

- No production database load.
- No Supabase connection.
- No embeddings.
- No app source modification.
- No production corpus replacement.
- No target-table promotion from staging to `authority_chunks`.

## Loader Behavior

The loader validates before staging:

- source manifest hash links
- chunk text hashes
- authority families
- unit identity inputs
- effectivity warning presence
- TRE limited-scope signal
- DCS duplicate alias counts
- restricted display gates
- black-letter-only inputs
- citation alias collision indicators
- page spans
- warning import counts
- audit table draft readiness

It then stages raw JSON rows in the local disposable database only.

Runtime staging necessarily places derivative legal text inside the local disposable database. The database was dropped after the run, and no derivative legal text was printed or committed.
