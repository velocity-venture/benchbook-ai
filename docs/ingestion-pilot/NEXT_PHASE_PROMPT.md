# Next-Phase Prompt (Phase C expansion — full-corpus ingestion)

**Gate: do NOT run this phase until Judge Eckel has issued, in writing:**
1. approval stamps in the source manifest (which authorities move to `approved`),
2. the TRE designation (answer corpus / guardrail corpus / both),
3. the DCS approved-policy list (all 661 / 631 unique, or a subset),
4. the LexisNexis annotation-display license answer,
5. explicit authorization to run full-corpus ingestion.

## Proposed prompt (copy-paste once the gate clears)

```
You are Claude Code working in /Users/m3_ai_factory/Projects/benchbook-ai.

Phase C pilot is complete (docs/ingestion-pilot/, 2026-06-12): 17/17 pilot
sources extracted, 1,047 structurally-chunked authority chunks, QA verdict
EXPAND. The Judge has now recorded the following decisions: [PASTE THE
JUDGE'S WRITTEN DECISIONS: approvals / TRE designation / DCS list / Lexis
annotation answer].

This run is Phase C expansion: full-corpus extraction and chunking for every
manifest file with approval_status == approved. STILL NOT AUTHORIZED:
PostgreSQL load, embeddings, app-code changes, touching the production
corpus, staging/committing, modifying source PDFs.

TASKS:
1. Apply the Judge's approval decisions to data/source-manifest/ via a
   versioned decision record (do not hand-edit manifest lines; merge
   decisions at build time).
2. Implement the seven hardening items from
   docs/ingestion-pilot/FULL_CORPUS_INGESTION_RECOMMENDATION.md:
   case-note sub-splitting; text_sha256 dedup with multi-parent references;
   header-stub suppression; pre-run marker-dictionary sweep across all 14
   statute/rule PDFs; statute subsection capture; DCS parser variants for
   protocol/guide/work-aid/manual/FAQ layouts (sample-QA each type before
   bulk); pinned extractor requirements file for the ingestion tooling.
3. Generalize scripts/ingestion_pilot/run_pilot_ingestion.py into
   scripts/ingestion/run_full_ingestion.py driven by the manifest +
   decision record (selection by approval_status, never a hardcoded list).
4. Run full-corpus extraction into data/ingestion/ (same output shapes as
   the pilot: chunks JSONL, summary, warnings, extracted-text, markdown).
5. Produce a full-corpus QA report with the pilot's detectors plus
   per-authority coverage checks (every approved manifest file accounted
   for: extracted or documented failure).
6. Propose (do not execute) the Phase D PostgreSQL schema: documents/units/
   chunks tables keyed by manifest sha256 + chunk_id, FTS strategy, and the
   approval/designation gates enforced at load time.

STOP AND ASK IF: any approved file's hash mismatches the manifest; any
authority's parse coverage is incomplete; extraction quality degrades on
DCS document types not covered by the pilot; or any task would require app
source changes or database access.
```

## Deferred beyond Phase C expansion

Phase D (PostgreSQL authority DB), Phase E (pgvector), Phase F (citation
validation integration), Phase G (guardrails), Phase H (QA harness),
Phase I (UI/copy). The two known app-code defects (context overflow; invalid
default model IDs — architecture review doc 05 §C) remain open and untouched
until app-code changes are authorized.
