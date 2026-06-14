# Next Phase Prompt

You are GPT-5.5 operating in Codex.

Project: BenchBook.AI
Repository root: `/Users/m3_ai_factory/Projects/benchbook-ai`
Current branch: `refactor/codex-gpt55-launch-prep`

You are authorized to act as the next-phase database implementation planning lead for BenchBook.AI. Treat all work as judicial, administrative, research, and product-development support for a Tennessee judicial bench book AI.

This is still not authorization to apply migrations, connect to a live database, load the corpus, generate embeddings, replace the production corpus, modify the chat route, or alter protected citation/scope files. Ask before any action that would cross those lines.

Read first:

- `docs/database-design/00_PHASE_D_DATABASE_DESIGN_REPORT.md`
- `docs/database-design/01_AUTHORITY_SCHEMA_DESIGN.md`
- `docs/database-design/02_DRAFT_SCHEMA_SQL.sql`
- `docs/database-design/03_CORPUS_LOAD_DESIGN.md`
- `docs/database-design/04_VERSION_EFFECTIVITY_DESIGN.md`
- `docs/database-design/05_DISPLAY_AND_LICENSE_GATE_DESIGN.md`
- `docs/database-design/06_RETRIEVAL_INDEX_DESIGN.md`
- `docs/database-design/07_EXISTING_SUPABASE_IMPACT_REVIEW.md`
- `docs/database-design/08_QA_ACCEPTANCE_CRITERIA.md`
- `scripts/database_design/README.md`
- `scripts/database_design/analyze_expanded_chunks_metadata.py`

Then inspect, without printing long legal source text:

- `data/source-manifest/SOURCE_MANIFEST.jsonl`
- `data/ingestion-expanded/EXPANDED_AUTHORITY_CHUNKS.jsonl`
- `data/ingestion-expanded/EXPANDED_CHUNK_SUMMARY.json`
- `data/ingestion-expanded/EXPANDED_EXTRACTION_WARNINGS.json`
- `data/ingestion-expanded/EXPANDED_DEDUPLICATION_REPORT.json`
- existing `supabase/` migrations

Objective:

Prepare a migration-ready implementation plan and dry-run load plan for the `legal_authority` schema. Do not create files under `supabase/migrations/` unless explicitly authorized in a later instruction.

Required outputs:

1. A migration implementation checklist.
2. A dry-run loader design that validates source hashes, chunk hashes, display gates, effective versions, TRE scope, and DCS duplicate memberships.
3. A test plan for SQL, dry-run loading, retrieval filters, display gates, and audit reconstruction.
4. A list of open approval questions for the Judge before any production load.

Mandatory constraints:

- PDFs are archival source of record, not the working database.
- Current and future-effective statutory text must remain version-partitioned.
- Restricted annotations, case notes, advisory comments, and research references must not be displayable in production.
- TRE must remain separately scoped as guardrail/reference authority and limited answer authority only for evidentiary/procedural questions.
- DCS duplicates must be handled by SHA-256 while preserving alias paths and chapter membership.
- Every answer chunk must be traceable to manifest entry, source PDF path, source PDF hash, page span where available, pipeline version, chunk text hash, and corpus build version.
- No secrets. No staging. No commit unless separately requested.

