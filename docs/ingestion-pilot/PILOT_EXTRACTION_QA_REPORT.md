# Pilot Extraction & Chunk QA Report

**Date:** 2026-06-12 · **Pipeline:** `phase-c-pilot-1.0`
(`scripts/ingestion_pilot/run_pilot_ingestion.py`, pypdf extractor)
**Scope:** 17 judge-authorized pilot sources. Machine-readable detail:
`data/ingestion-pilot/PILOT_EXTRACTION_WARNINGS.json`, `PILOT_CHUNK_SUMMARY.json`.

## 1. Extraction results

| Check | Result |
|---|---|
| Sources selected / hash-verified vs manifest | 17 / 17 (verified immediately before extraction) |
| Sources extracted | **17 / 17** — no extraction failures |
| OCR needed | 0 files (all PDFs carry embedded text; ocrmypdf/tesseract present but unused) |
| Suspiciously short pages | 0 |
| Garbled text (replacement/cid characters) | 0 pages flagged |
| Page boundaries preserved | Yes — per-page extraction; every chunk carries `page_start`/`page_end` |

Embedded-text quality from the 2026-06-08 Lexis exports and the DCS PowerDMS
PDFs is high: no image-only pages, no encoding damage detected.

## 2. Structural parse coverage

| Source | Units expected (observed in PDF) | Units parsed | Notes |
|---|---|---|---|
| Title 37 (§§ 37-1-101 → 37-1-201) | 98 section sub-documents | **98 sections** | Range complete, first/last match filename label |
| Tenn. R. Juv. P. | 45 rule sub-documents | **45 rules** (101–404) | |
| Tenn. R. Evid. | 66 sub-documents | **64 rules** + 2 non-rule units (see warnings) | Rules 101–1008 incl. 409.1 |
| DCS policies (14 files) | 14 policies | **14 policies**, all policy numbers + effective dates detected | 143 body sections + 14 header blocks |

## 3. Chunk QA

1,047 chunks. By type: 209 black_letter_text, 164 history, 143 advisory_comment,
252 annotation_candidate, 122 case_note_candidate, 143 policy_text, 14 metadata.
Median chunk 530 chars.

| Detector | Findings | Assessment |
|---|---|---|
| Empty chunks | 0 emitted (empty blocks skipped, logged) | OK |
| Duplicate chunk text | 26 groups | All are genuinely repeated Lexis editorial matter across sections (e.g. the same Compiler's Note about Acts 2018 ch. 1052 appearing under §§ 37-1-105/-110/-146; bare `Case Notes` stubs). Real content duplication in the source, not a parser bug. Full pipeline should dedup by `text_sha256` with multi-parent references. |
| Unusually large chunks (>12k chars) | 29 | All are `case_note_candidate`/`advisory_comment`/`annotation_candidate` compilations (largest: TRE 403 case notes, 114k chars) plus a few long black-letter sections. **No oversized chunk is mistyped black-letter text.** Full pipeline should sub-split case-note compilations at their numbered headings (`1. Application.` …). |
| Tiny chunks (<25 chars) | ~15 | Legitimate one-line `history` entries (`Acts 2024, ch. 866, § 1.`) and a few bare annotation headers. Full pipeline should suppress header-only stubs. |
| Missing section headings | 1 | TRE `ARTICLE III` divider sub-document (p. 26) — an article heading page, not a rule; conservatively typed `unknown`/blank citation with warning. |
| Citation undetected | 2 | The TRE compiler's-note sub-document (`Tenn. R. Evid. Note`, p. 1) and the `ARTICLE III` divider. Correct conservative behavior: fields left blank, warnings recorded, no guessing. |

## 4. Block-separation verification (annotations vs black-letter)

Spot-checked across families: § 37-1-114 black-letter text contains only
statutory subsections (annotations are separate chunks); TRJPP 307 rule text is
clean; TRE rule text chunks exclude commentary/case notes (after adding the
TRE-specific `Case Notes` marker, which the first pilot iteration missed —
caught by the oversized-chunk detector and fixed). DCS 14.14 splits into header
metadata + glossary + lettered procedure sections with correct page spans.

## 5. Warning inventory

58 warnings total: 26 duplicate-text groups, 29 oversized-chunk flags,
2 citation-undetected, 1 missing-heading. **0 extraction failures, 0 OCR
deferrals, 0 garbled-text flags.** Every warning is enumerated with
source path, page, and chunk ID in `PILOT_EXTRACTION_WARNINGS.json`.

## 6. Verdict

Extraction quality is **sufficient to proceed** with the full-corpus pipeline
design (see `FULL_CORPUS_INGESTION_RECOMMENDATION.md`). No manual source QA
stop is required. The pilot surfaced three concrete pipeline improvements
(case-note sub-splitting, text-hash dedup with multi-parent references,
header-stub suppression) — all are chunking refinements, not extraction-tool
problems.
