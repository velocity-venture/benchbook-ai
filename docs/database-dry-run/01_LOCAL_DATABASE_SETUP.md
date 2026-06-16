# Local Database Setup

Phase E2 used a local disposable PostgreSQL database only.

## Tooling Observed

| Tool | Status |
|---|---|
| `psql` | available at `/opt/homebrew/bin/psql`, PostgreSQL 18.3 client |
| Local PostgreSQL server | available on localhost and local socket |
| `createdb` | available |
| `dropdb` | available |
| Docker | not found |
| Supabase CLI | not found |

## Database Safety Rules

The dry-run loader rejects non-local database URLs. Allowed targets are:

- local database names
- Unix socket connections
- `localhost`
- `127.0.0.1`
- `::1`

Remote database URLs are refused.

## Command Used

```bash
python3 scripts/database_load/dry_run_load_legal_authority.py --create-local-db --drop-after
```

The script:

1. Created a disposable local database with a generated `benchbook_e2_dry_run_*` name.
2. Applied draft migrations from `supabase/migrations_draft/`.
3. Staged source manifest, expanded chunks, warnings, and DCS dedupe groups.
4. Inserted one local corpus build row.
5. Counted staged rows.
6. Dropped the disposable database.

## pgvector Finding

The local PostgreSQL server does not have the `vector` extension installed. The draft migration now treats this as a local deferred feature:

- `pgcrypto` enabled.
- `pg_trgm` enabled.
- `vector` attempted.
- missing `vector` extension logged as a notice.
- `embedding` column remains deferred when pgvector is unavailable.
- no embeddings were generated.
- no vector index was created.

This matches the owner decision to enable pgvector if available but not require embeddings for load.

## Reproduction Commands

Static validation only:

```bash
python3 scripts/database_load/validate_expanded_chunks_for_load.py
```

Local disposable dry run:

```bash
python3 scripts/database_load/dry_run_load_legal_authority.py --create-local-db --drop-after
```

JSON report to an untracked runtime path:

```bash
python3 scripts/database_load/dry_run_load_legal_authority.py --create-local-db --drop-after --json > /tmp/benchbook_phase_e2_dry_run.json
```

Do not write JSON reports containing runtime load details into committed files unless they are reviewed to ensure no legal body text is included.
