# Phase C Pilot Ingestion Report

**Date:** 2026-06-12 · **Branch:** `refactor/codex-gpt55-launch-prep`
**Pipeline:** `scripts/ingestion_pilot/run_pilot_ingestion.py` (`phase-c-pilot-1.0`)
**Mode:** Pilot extraction/chunking validation only. No database load, no
embeddings, no app-code changes, no production-corpus replacement, nothing
staged or committed, source PDFs strictly read-only. **No output of this pilot
is production-ready.**

## What ran

1. Loaded `data/source-manifest/SOURCE_MANIFEST.jsonl`; selected the 17
   judge-authorized pilot files (3 legal authorities + 14 DCS policies).
2. Re-verified every pilot file's SHA-256 against the manifest at run time —
   **17/17 match** (any mismatch aborts with exit 2).
3. Extracted embedded text per page with pypdf (the only available local
   extractor; pdftotext/pdfplumber/pymupdf absent — pypdf from the existing
   Phase A/B scratch venv, no dependencies installed). OCR was not needed:
   all 17 PDFs carry embedded text.
4. Segmented by legal structure (never token count):
   - Title 37 → 98 T.C.A. section units; black-letter / history / commentary /
     annotations / case notes as separate chunks.
   - TRJPP → 45 rule units, same block separation.
   - TRE → 64 rule units + 2 non-rule sub-documents (compiler's note, article
     divider) conservatively typed with warnings; every TRE chunk carries
     `corpus_designation: pending_judge_designation`.
   - DCS → 14 policies: page-1 header (metadata chunk with effective/
     supersedes dates) + 143 heading-delimited body sections.
5. Emitted raw audit text, structured Markdown for human review, JSONL chunks,
   and QA reports.

## Results

| Metric | Value |
|---|---|
| Sources selected / extracted | 17 / 17 (0 failures, 0 OCR deferrals) |
| Total chunks | 1,047 |
| By family | tca_title_37: 379 · tenn_rules_evidence: 318 · trjpp: 193 · dcs: 157 |
| By type | black_letter 209 · annotation_candidate 252 · history 164 · advisory_comment 143 · policy_text 143 · case_note_candidate 122 · metadata 14 |
| Approval status on every chunk | `pending_judge_approval` (flows from manifest, never upgraded) |
| Corpus designation | 729 `pilot_extraction_only`, 318 `pending_judge_designation` (all TRE) |
| Warnings | 58 (26 duplicate-text groups, 29 oversized flags, 2 citation-undetected, 1 missing heading) — all enumerated in `PILOT_EXTRACTION_WARNINGS.json` |

Full QA analysis: `PILOT_EXTRACTION_QA_REPORT.md`. Every chunk carries source
path, manifest SHA-256, authority family, source type, approval status, page
span, text hash, and chunk type (schema: `PILOT_CHUNK_SCHEMA.md`).

## Notable pilot findings

1. **Lexis structure is highly parseable.** Unit boundaries (`Tenn. Code Ann.
   § …` / `Tenn. R. … Rule N` page headers) and block markers are consistent;
   coverage was complete on the first structural pass.
2. **Marker dialects differ between exports:** T.C.A. uses `NOTES TO
   DECISIONS`, TRE uses `Case Notes`. The oversized-chunk detector caught the
   gap; the marker dictionary now covers both. A pre-run marker sweep is a
   required hardening step for the full corpus.
3. **Annotations are cleanly separable from black-letter law** — verified by
   spot-checks; no oversized chunk is mistyped black-letter text.
4. **Duplicate editorial content is real and recurring** (same compiler's
   notes across many sections) — the full pipeline needs hash-level dedup with
   multi-parent references.
5. **DCS policies parse well** (numbers, titles, effective dates, lettered
   sections), but the pilot covered only the POLICY document type; protocols/
   guides/work aids/manuals need parser variants before bulk processing.

## Outputs

| Path | Contents |
|---|---|
| `data/ingestion-pilot/PILOT_SOURCE_SELECTION.json` | Pilot set + per-file manifest/hash verification |
| `data/ingestion-pilot/PILOT_EXTRACTION_MANIFEST.json` | Per-file extraction record (tool, pages, chars, status, outputs) |
| `data/ingestion-pilot/PILOT_AUTHORITY_CHUNKS.jsonl` | 1,047 chunks |
| `data/ingestion-pilot/PILOT_CHUNK_SUMMARY.json` | Counts + size stats + QA tallies |
| `data/ingestion-pilot/PILOT_EXTRACTION_WARNINGS.json` | All 58 warnings, itemized |
| `data/ingestion-pilot/extracted-text/` (17 files) | Raw per-page text for audit |
| `data/ingestion-pilot/structured-markdown/` (17 files) | Human-review Markdown with per-chunk metadata |
| `docs/ingestion-pilot/` (5 docs) | This report, chunk schema, QA report, full-corpus recommendation, next-phase prompt |

## Recommendation

**Phase C is ready to EXPAND** to the full corpus once the Judge issues the
pending decisions (approvals, TRE designation, Lexis annotation license,
expansion authorization) and the seven hardening items in
`FULL_CORPUS_INGESTION_RECOMMENDATION.md` are implemented. Extraction tooling
is adequate — no better extractor is required and no manual source QA stop is
warranted.
