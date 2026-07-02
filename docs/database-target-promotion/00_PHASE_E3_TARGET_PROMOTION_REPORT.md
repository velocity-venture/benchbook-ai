# Phase E3 Target Promotion Report

## Scope

Phase E3 performed a local-only target-table promotion dry run for the BenchBook.AI legal authority schema.

The run used a disposable local PostgreSQL database. It did not connect to Supabase, did not touch a remote database, did not generate embeddings, did not replace the production corpus, and did not write extracted legal body text into committed reports.

## Local run

- Command: `python3 scripts/database_load/dry_run_load_legal_authority.py --create-local-db --drop-after --json > /tmp/benchbook_phase_e3_target_promotion.json`
- Disposable database: created by the loader with a `benchbook_e3_dry_run_*` name
- Drop result: dropped successfully
- Remote database connection: false
- Embeddings generated: false
- App files changed: false
- Real Supabase migrations changed: false
- Production corpus replaced: false
- Legal body text printed in report: false

## Staging counts

- Raw source manifest rows: 677
- Raw expanded chunks: 6,587
- Raw extraction warnings: 862
- Raw deduplication groups: 12

## Promoted target counts

- Source files: 647
- Source file memberships: 677
- Authority units: 1,447
- Authority versions: 1,469
- Authority chunks: 6,587
- Citation aliases: 3,683
- Chunk warnings: 358
- Extraction warnings: 862
- Retrieval logs: 1
- Answer audit records: 1
- Citation verification records: 1

## Key verification results

- Displayable production view count: 0
- Restricted chunks in displayable view: 0
- Pending chunks in displayable view: 0
- Internal QA restricted view count: 6,587
- Black-letter eligible chunks: 1,059
- Production-visible black-letter chunks: 0
- TRE chunks: 533
- TRE limited-scope chunks: 533
- DCS chunks: 2,011
- DCS guardrail-reference chunks: 2,011
- DCS production-eligible chunks: 0
- Future-effective versions: 13
- Future versions visible before July 1, 2026: 0
- Audit reconstruction join count: 1
- Answer text columns in audit table: 0

## Launch blockers found

- 117 duplicate source chunk identifiers affect 234 rows. The target dry run preserved all rows using occurrence-stable local identifiers, but upstream chunk ID generation must be fixed before production load.
- 273 authority units and 1,164 chunks have unresolved identity. These are controlled unresolved rows, not invented citations.
- 12 normalized citation alias collisions were detected. The loader suppressed 24 colliding alias candidates.
- 18 authority versions remain `unknown_effectivity`. They require human review before production use.
- All promoted chunks remain pending or restricted. This is correct for a dry run, but it means no promoted target rows are production-answer eligible yet.

## Result

Phase E3 proves that the current derivative corpus can be staged and promoted into the local target schema with closed gates and reconstructable audit paths. It also identifies concrete upstream QA blockers that must be resolved before any production corpus migration.
