# Phase E4 Database Load Scripts

These scripts support local disposable database dry-run and target-promotion work for BenchBook.AI.

They must not:

- connect to Supabase production or any remote database
- modify app source code
- generate embeddings
- replace production corpus output
- stage or commit ignored derivative legal text
- print long legal source text

## `validate_expanded_chunks_for_load.py`

Runs static validation against the Phase C expanded ingestion outputs:

- source manifest hash reconciliation
- chunk text hash reconciliation
- authority family mapping
- unit and version input checks
- effective-date warning counts
- TRE limited-scope indicators
- DCS duplicate membership reconciliation
- display and license gate counts
- citation alias counts and collision indicators
- page span checks
- warning import counts
- audit support readiness checks

Usage:

```bash
python3 scripts/database_load/validate_expanded_chunks_for_load.py
python3 scripts/database_load/validate_expanded_chunks_for_load.py --json
```

## `dry_run_load_legal_authority.py`

Runs static validation first. If a local disposable PostgreSQL database is explicitly provided or created, it applies the draft migrations, stages raw manifest, chunk, warning, and dedupe JSON into `legal_authority_stage`, and promotes the corpus into local target tables for verification.

Local database examples:

```bash
python3 scripts/database_load/dry_run_load_legal_authority.py --static-only
python3 scripts/database_load/dry_run_load_legal_authority.py --create-local-db --drop-after
python3 scripts/database_load/dry_run_load_legal_authority.py --database-url benchbook_e4_dry_run --apply-migrations
python3 scripts/database_load/dry_run_load_legal_authority.py --create-local-db --drop-after --skip-target-promotion
```

The loader rejects remote database URLs. Allowed database targets are local database names, Unix socket connections, `localhost`, or `127.0.0.1`.

Runtime local dry-run staging and promoted target chunks can contain derivative legal text inside the disposable database. Do not export it into committed files.
