# Database Load Design Scripts

This directory contains Phase E1 planning helpers for future legal authority database load design.

Scripts here may inspect ignored derivative ingestion outputs for metadata validation only. They must not:

- connect to a database
- apply migrations
- create migration files
- load corpus data
- generate embeddings
- alter app source
- print long legal source text
- write derivative legal-text outputs
- expose secrets

## `inspect_load_readiness.py`

Reads metadata from:

- `data/source-manifest/SOURCE_MANIFEST.jsonl`
- `data/ingestion-expanded/EXPANDED_AUTHORITY_CHUNKS.jsonl`
- `data/ingestion-expanded/EXPANDED_CHUNK_SUMMARY.json`
- `data/ingestion-expanded/EXPANDED_EXTRACTION_WARNINGS.json`
- `data/ingestion-expanded/EXPANDED_DEDUPLICATION_REPORT.json`

It reports:

- manifest counts
- chunk counts
- missing field counts
- approval and display status counts
- authority family counts
- chunk type counts
- effective-version warning counts
- TRE scope indicators
- DCS duplicate membership indicators
- candidate load blockers

It intentionally excludes body text fields such as `text`, `content`, `body`, `markdown`, `html`, `snippet`, and `source_text`.

Usage:

```bash
python3 scripts/database_load_design/inspect_load_readiness.py
```

Optional JSON output:

```bash
python3 scripts/database_load_design/inspect_load_readiness.py --json
```

The script prints metadata only. It does not write files.
