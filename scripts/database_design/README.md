# Database Design Scripts

This directory contains design-phase helpers for Phase D. Scripts here may inspect ignored ingestion outputs for metadata analysis only. They must not load a database, apply migrations, generate embeddings, alter app code, or write legal source text into committed artifacts.

## `analyze_expanded_chunks_metadata.py`

Reads `data/ingestion-expanded/EXPANDED_AUTHORITY_CHUNKS.jsonl` and prints a metadata-only JSON report.

It reports:

- total chunk count
- field names
- missing or empty metadata counts
- source type counts
- authority family counts
- corpus designation counts
- approval status counts
- display status counts
- chunk type counts
- DCS document type counts
- extraction warning counts from chunks
- effective-date warning metadata samples with no body text
- restricted chunk counts
- fields needed for schema design

It intentionally does not print `text`, `content`, `body`, `markdown`, `html`, or source-body fields.

Usage:

```bash
python3 scripts/database_design/analyze_expanded_chunks_metadata.py
```

Optional:

```bash
python3 scripts/database_design/analyze_expanded_chunks_metadata.py \
  --chunks data/ingestion-expanded/EXPANDED_AUTHORITY_CHUNKS.jsonl \
  --summary data/ingestion-expanded/EXPANDED_CHUNK_SUMMARY.json \
  --warnings data/ingestion-expanded/EXPANDED_EXTRACTION_WARNINGS.json \
  --dedupe data/ingestion-expanded/EXPANDED_DEDUPLICATION_REPORT.json
```

