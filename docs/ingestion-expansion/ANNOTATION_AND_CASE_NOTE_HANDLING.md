# Annotation, Case-Note, and Editorial Material Handling

**Date:** 2026-06-12 · Governs the Phase C expansion chunk store.

## The Judge's constraint

LexisNexis annotations, case notes, and editorial material **must not be
displayed in production answers** until the license/display policy is
resolved. They may be extracted and typed for internal QA only.

## How the pipeline enforces it

1. **Separate chunk types, never blended.** Lexis sub-documents are segmented
   at their block markers; black-letter statutory/rule text is emitted as
   `black_letter_text` chunks, and everything editorial is emitted under its
   own type:
   - `annotation_candidate` — Compiler's Notes, Cross-References, Law
     Reviews, Research References & Practice Aids, Opinion Notes / ATTORNEY
     GENERAL OPINIONS;
   - `case_note_candidate` — NOTES TO DECISIONS, Case Notes, Decisions Under
     Prior Law (sub-split at numbered note headings);
   - `advisory_comment` — Advisory Commission Comments and COMMENTS TO
     OFFICIAL TEXT.
2. **Display restriction is machine-enforceable.** Every chunk of those three
   types carries `production_display_status: restricted_pending_license_review`.
   Downstream layers (Phase D load, retrieval, answer assembly) must treat
   that field as a hard display gate; black-letter and DCS chunks carry
   `pending_extraction_qa` instead (no display claim either — nothing in this
   phase is production-approved).
3. **Conservative posture on advisory comments.** Advisory Commission
   Comments are official commission commentary rather than Lexis-authored
   editorial text, but they arrive inside the licensed Lexis export, so this
   phase restricts them under the same flag. If the Judge/licensing review
   determines commission comments are displayable, relaxing the flag for
   `advisory_comment` only is a one-line, fully-auditable change.
4. **Marker dictionary is swept, not assumed.** Before this run, all 14
   statute/rule PDFs were scanned for standalone marker lines; Title 36
   introduced `Opinion Notes`, `ATTORNEY GENERAL OPINIONS`, `COMMENTS TO
   OFFICIAL TEXT`, and `Decisions Under Prior Law`, all now mapped. Unmapped
   future markers would land in the surrounding block and surface through the
   oversized-chunk detector (this is how the pilot caught TRE's `Case Notes`).

## Counts (this run)

| Restricted type | Chunks |
|---|---|
| `annotation_candidate` | 1,120 |
| `case_note_candidate` | 979 |
| `advisory_comment` | 295 |
| **Total restricted** | **2,394** of 6,587 |

## Why keep restricted material at all

Internal QA uses it to (a) verify black-letter boundaries are correct (the
editorial blocks are the complement of the statutory text), (b) cross-check
section/rule histories against currency expectations, and (c) prepare the
license decision with concrete examples. None of it flows to any production
surface, which does not exist yet in this pipeline — there is no database
load and no retrieval layer in Phase C.
