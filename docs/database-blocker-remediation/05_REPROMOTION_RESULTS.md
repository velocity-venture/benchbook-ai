# Repromotion Results

## Local run

Command:

```bash
python3 scripts/database_load/dry_run_load_legal_authority.py --create-local-db --drop-after --json > /tmp/benchbook_phase_e4_target_promotion.json
```

The disposable local database was created and dropped successfully.

## Staged counts

- Raw source manifest rows: 677
- Raw expanded chunks: 6,590
- Raw extraction warnings: 864
- Raw deduplication groups: 12

## Promoted counts

- Source files: 647
- Source file memberships: 677
- Authority units: 1,321
- Authority versions: 1,343
- Authority chunks: 6,590
- Citation aliases: 3,598
- Chunk warnings: 359
- Extraction warnings: 864
- Retrieval logs: 1
- Answer audit records: 1
- Citation verification records: 1

## Counts by family

- DCS policies and procedures: 2,014 chunks
- TCA Title 36: 2,197 chunks
- TCA Title 37: 1,644 chunks
- Tennessee Rules of Evidence: 533 chunks
- Tennessee Rules of Juvenile Practice and Procedure: 202 chunks

## Counts by answer scope

- General answer authority: 1,059 chunks
- Guardrail reference only: 3,054 chunks
- Limited evidentiary procedural: 533 chunks
- Not answer authority: 1,944 chunks

## Reconciliation

- Missing source file for chunk: 0
- Duplicate source chunk ID groups: 0
- Duplicate source chunk rows: 0
- Manifest unique SHA-256 files: 647
- Manifest membership paths: 677

## Result

The E4 repromotion completed locally with all production gates closed and audit reconstruction intact.
