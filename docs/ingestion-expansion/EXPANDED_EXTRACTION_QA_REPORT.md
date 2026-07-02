# Expanded Extraction & Chunk QA Report

**Date:** 2026-06-12 · **Pipeline:** `phase-c-expansion-1.0`
(`scripts/ingestion/run_expanded_ingestion.py`, pypdf)
Machine-readable detail (gitignored): `data/ingestion-expanded/EXPANDED_EXTRACTION_WARNINGS.json`, `EXPANDED_CHUNK_SUMMARY.json`.

## 1. Extraction results

| Check | Result |
|---|---|
| Sources selected (manifest-driven) | 246 (12 statutes, 2 rules, 232 staged DCS) |
| Hash verification before extraction | 246/246 match — no stop condition |
| Skipped as DCS SHA-256 duplicates | 13 (chunked once via primary path) |
| Extracted | **232** |
| Extraction failures | **1, controlled**: `Ch31_Field_Services/637_Handbook_Clients_Rights_Handbook.pdf` — AES-encrypted; requires optional `cryptography` package (not installed; authorization required). Recorded, not worked around. |
| OCR needed | 0 |
| Garbled text | 0 pages flagged |
| Suspiciously short pages | 10 (blank/near-blank pages in DCS docs; cosmetic) |

## 2. Structural coverage

| Authority | Parsed | Notes |
|---|---|---|
| Title 36 | **500 sections** | All 6 range PDFs; chapters 1–8 (adoption, marriage, divorce, alimony/child support, custody, UIFSA, deployed-parents, miscellaneous) |
| Title 37 | **489 sections** | All 6 range PDFs + standalone §37-11-103 |
| TRJPP | **45 rules** (101–404) | Matches pilot |
| TRE | **64 rules** + 2 non-rule sub-documents (compiler's note, article divider — typed conservatively, warnings recorded) | Matches pilot |
| DCS staged chapters | **218 of 219 unique documents** (the encrypted handbook is the gap) | Ch09 (10 docs), Ch14 (~70), Ch16A (~48), Ch16B (~37), Ch31 (~54 unique) |

## 3. Chunk QA (6,587 chunks)

By type: black_letter_text 1,123 · history 1,061 · annotation_candidate 1,120 ·
case_note_candidate 979 · advisory_comment 295 · policy_text 747 · protocol 303 ·
manual 363 · guide 176 · work_aid 46 · metadata 218 · unknown 158. Median 520 chars.

| Detector | Findings | Assessment |
|---|---|---|
| Empty chunks | 0 emitted | OK |
| Stub suppression | 44 bare-header stubs suppressed (logged) | Pilot hardening item delivered |
| Duplicate chunk text | 201 groups | Repeated Lexis editorial matter across sections + identical short DCS boilerplate sections. Expected; Phase D should store once with multi-parent references. |
| Oversized chunks (>12k chars) | 90 | Case-note sub-splitting (pilot hardening) now splits compilations at numbered note headings (979 case-note chunks, 631+ carrying note sub-headings). Remaining oversized chunks are single huge note topics (e.g., one § 36-1-113 note topic ≈103k chars), large DCS guides with sparse headings, and a handful of long statutes. All flagged; none is mistyped black-letter. |
| Missing section headings | 3 | TRE article divider + 2 statute units with wrapped headings; conservative blanks + warnings. |
| Citation undetected | 2 | TRE non-rule sub-documents (same as pilot). |
| DCS dates undetected | 99 | Overwhelmingly guides/manuals/work aids that genuinely have no effective-date block (numbered policies have dates). Honest warnings, not failures. |
| DCS sections undetected | 65 whole-doc + 18 page-split fallbacks | Short protocols emit as one chunk (fine); 18 large unstructured docs fell back to page-bounded chunks with warnings. |
| DCS unmapped document types | 15 chunks typed `unknown` (tip sheets, FAQs, handbooks, N/A docs) + 9 undetected | Recorded in `document_type`; conservative `unknown` chunk_type rather than guessing. |

## 4. Critical finding: effective-dated statutory versions

The 2026-06-08 Lexis exports include **paired versions of amended sections**
(heading brackets `[Effective until July 1, 2026 …]` vs `[Effective on
July 1, 2026 …]`) and newly enacted sections effective 2026-07-01. This run
detects and flags all of them: **37 version-variant units across 26 citations
(11 confirmed current/future pairs)**, including high-stakes authorities such
as § 36-1-113 (termination of parental rights) and § 37-1-103. Heading echoes
of these brackets on continuation pages are stripped from chunk text (verified
zero leakage); the bracket is preserved verbatim in `title`; every affected
chunk carries an `effective_dated_version_unit` warning.

**Phase D requirement:** version-partition these units (current vs
future-effective), serve only the version in force at query time, and never
blend or double-retrieve the pair. This is a correctness-critical design input
discovered by extraction QA — exactly what this phase exists to surface.

## 5. Verdict

Extraction quality **supports proceeding to Phase D database schema/load
design**. No better extraction tool is required; no manual source QA stop is
warranted. Carry-forward items: the encrypted handbook (needs `cryptography`
authorization or manual handling), DCS guide/manual heading detection
improvements, statutory subsection capture, and the version-partitioning
requirement above.
