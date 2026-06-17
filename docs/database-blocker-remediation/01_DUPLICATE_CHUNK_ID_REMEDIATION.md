# Duplicate Chunk ID Remediation

## E3 issue

Phase E3 found 117 duplicate source chunk IDs affecting 234 rows.

The upstream issue was deterministic but under-specified ID generation. Chunk IDs were based mainly on source SHA-256 plus sequence key. Paired effective-date units and repeated note structures could reuse a sequence key.

## Fix implemented

`scripts/ingestion/run_expanded_ingestion.py` now builds chunk IDs from stable inputs:

- Pipeline version
- Source SHA-256
- Source path
- Authority family
- Canonical citation, policy number, rule number, section, title, or sequence key
- Document type
- Chunk type
- Page span
- Subsection label
- Sequence key
- Text hash prefix

If the same deterministic base still appears more than once, the script adds a deterministic occurrence component. It does not use random UUIDs.

## Verification

- E3 duplicate source chunk ID groups: 117
- E3 duplicate source chunk rows: 234
- E4 duplicate source chunk ID groups: 0
- E4 duplicate source chunk rows: 0
- Duplicate chunk conflict count: 0

## Result

The duplicate source chunk ID blocker is remediated locally.
