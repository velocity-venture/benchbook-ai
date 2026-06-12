# Full-Corpus Ingestion Architecture Recommendation

**Date:** 2026-06-12 · Based on: Phase C pilot (17 sources, 1,047 chunks,
0 extraction failures). Status: recommendation only — full-corpus ingestion is
**not authorized yet** and depends on the Judge's pending approval/designation
decisions.

## Recommendation: EXPAND (with the pilot's parser hardened, not replaced)

The pilot validated the architecture end-to-end on all four authority shapes.
Embedded text quality is high (no OCR, no garbling), Lexis structural markers
are reliable, and conservative parsing produced complete unit coverage
(98/98 statute sections, 45/45 TRJPP rules, 64 TRE rules, 14/14 DCS policies).
There is no reason to switch extraction tools or stop for manual source QA.

## Pipeline shape for the full corpus

```
SOURCE_MANIFEST.jsonl  (gate: hash re-verify + approval_status == approved)
        │
        ├─ Lexis statute exports (Title 36: 6 PDFs, Title 37: 6 PDFs)
        │     unit split on "Tenn. Code Ann. § …" page headers
        ├─ Rules exports (TRJPP, TRE)
        │     unit split on "Tenn. R. … " page headers
        └─ DCS tree (661 files, 631 unique by SHA-256)
              doc-type banner + page-1 metadata + section headings
        │
   cleaned text (per page, running headers stripped)   → extracted-text/ (audit)
   structured Markdown (per source, per unit)          → human review
   JSONL authority chunks (schema = pilot schema, version bumped)
   QA reports (same detectors as pilot, thresholds reviewed)
```

## Required hardening before full-corpus run (from pilot findings)

1. **Case-note sub-splitting.** Split `case_note_candidate` compilations at
   their numbered headings (`1. Application.` …). Pilot max chunk was 114k
   chars (TRE 403 case notes); retrieval needs these as individual notes.
2. **Dedup by `text_sha256` with multi-parent references.** 26 duplicate
   groups in the pilot alone; the DCS tree adds 24 known duplicate *files*.
   Store one chunk, reference all parents (sections/chapters) — prevents
   double-weighted retrieval.
3. **Suppress header-only stubs** (bare `Case Notes` lines, empty blocks).
4. **Marker dictionary per family.** The TRE `Case Notes` vs T.C.A.
   `NOTES TO DECISIONS` discrepancy was caught by QA; before the full run,
   sweep all 14 statute/rule PDFs for unrecognized standalone marker lines and
   extend the dictionary (cheap scan, big correctness payoff).
5. **Subsection capture for statutes** (`(a)`, `(b)(1)` …) as structured
   metadata on black-letter chunks — pilot left `subsection` blank by design.
6. **DCS document-type coverage.** The pilot's 14 files were all numbered
   POLICY documents. Protocols, guides, work aids, manuals, and FAQ/tip-sheet
   layouts need parser variants + a sample QA pass before bulk processing
   (the type is already detectable from the page-1 banner and the 00_INDEX CSV).
7. **Extractor pinning.** Pin pypdf version in a project-local requirements
   file for the ingestion tooling (currently running from a scratch venv;
   acceptable for pilot, not for the production pipeline run).

## Approval gating (unchanged, non-negotiable)

- The full pipeline must refuse any file whose hash is missing from
  `SOURCE_MANIFEST.jsonl` or whose `approval_status != approved`.
- TRE chunks keep `corpus_designation: pending_judge_designation` until the
  Judge designates answer vs guardrail use.
- `annotation_candidate`/`case_note_candidate` chunks must be excluded from
  any answer corpus by default; whether they may even be *displayed* awaits
  the LexisNexis license answer. They are retained in the chunk store as
  clearly-typed non-authority text.

## What comes after ingestion (later phases, not now)

Phase D: PostgreSQL authority schema (documents/units/chunks tables keyed by
manifest SHA-256 + chunk_id, with FTS). Phase E: pgvector index over approved
black-letter/policy chunks only. Both are designs to be reviewed before any
load; **no database work was done in this pilot.**

## Decision needed from the Judge before the full-corpus run

1. Approval stamps (manifest `approval_status`) for Title 36, Title 37, TRJPP,
   TRE, and the DCS policy set (all 661 / 631 unique, or a subset).
2. TRE designation (answer / guardrail / both).
3. LexisNexis annotation-display license answer (determines whether
   annotation/case-note chunks are retained-but-hidden or dropped).
4. Authorization to run full-corpus ingestion (Phase C expansion).
