# Phase C Expansion Report

**Date:** 2026-06-12 · **Branch:** `refactor/codex-gpt55-launch-prep`
**Pipeline:** `scripts/ingestion/run_expanded_ingestion.py` (`phase-c-expansion-1.0`)
**Mode:** Extraction/chunking only. No PostgreSQL load, no embeddings, no
app-code changes, no production-corpus replacement, nothing staged or
committed, source PDFs strictly read-only. **Nothing produced is
production-ready** — every chunk is `approval_status: pending_extraction_qa`.

## Scope executed (per the Judge's expansion decisions)

| Authority | Decision applied | Result |
|---|---|---|
| Title 36 (6 PDFs) | approved for extraction, `core_v1_candidate` | 500 sections → 2,197 chunks |
| Title 37 (6 PDFs) | approved for extraction, `core_v1_candidate` | 489 sections → 1,644 chunks |
| TRJPP | approved as core V1 authority, `core_v1_candidate` | 45 rules → 202 chunks |
| TRE | guardrail + limited answer authority; `evidence_guardrail_and_limited_answer_candidate`; `answer_scope_note` on every chunk; labeled separately throughout | 64 rules → 533 chunks |
| DCS staged chapters Ch09/Ch14/Ch16A/Ch16B/Ch31 | `staged_dcs_candidate`, duplicate-aware by SHA-256 | 232 files → 219 unique → 218 extracted → 2,011 chunks |
| Other DCS chapters | **not selected** (remain pending) | 0 |
| Lexis editorial material | extracted, typed, `restricted_pending_license_review` | 2,394 restricted chunks |

Selection is manifest-driven (`SOURCE_MANIFEST.jsonl`); all 246 selected files
re-verified by SHA-256 immediately before extraction (246/246 match).

## Headline results

- **6,587 chunks** across 5 authority families; median 520 chars; every chunk
  carries source path + manifest hash, family, type, designation, approval
  status, display status, page span, text hash, and deterministic chunk ID.
- **232/246 extracted; 13 skipped as exact DCS duplicates (by design); 1
  controlled failure** (AES-encrypted Clients Rights Handbook — needs the
  optional `cryptography` dependency, not installed without authorization).
- **Pilot hardening delivered:** marker-dictionary sweep before the run
  (4 new Title 36 markers found and mapped), case-note sub-splitting at
  numbered headings, stub suppression, SHA-256 dedup with alias preservation,
  reproducible dependency spec (`scripts/ingestion/requirements.txt` +
  README; no scratch paths in committed scripts).
- **Critical QA discovery — effective-dated statutory versions.** The Lexis
  exports contain paired current/future versions of amended sections
  (`[Effective until/on July 1, 2026 …]`) and newly enacted sections
  effective 2026-07-01 — 37 flagged units across 26 citations, including
  § 36-1-113 (termination of parental rights). All are flagged
  (`effective_dated_version_unit`), brackets preserved in titles, heading
  echoes stripped from text (verified zero leakage). **Phase D must
  version-partition these; current and future text must never be blended.**

Full QA detail: `EXPANDED_EXTRACTION_QA_REPORT.md`. Dedup detail:
`DEDUPLICATION_REPORT.md`. Editorial-material policy:
`ANNOTATION_AND_CASE_NOTE_HANDLING.md`. Schema: `EXPANDED_CHUNK_SCHEMA.md`.

## Storage discipline

All generated outputs live in `data/ingestion-expanded/` which is gitignored
(verified with `git check-ignore` before generation). Raw PDFs remain
gitignored. Committed artifacts are scripts, requirements, and documentation
only — no long quoted legal text appears in committed docs.

## Recommendation

**Proceed to Phase D: PostgreSQL authority database schema and load design.**
Extraction quality is sufficient (no better tool needed; no manual source QA
stop). Phase D design must account for, in priority order:
1. statutory **version partitioning** (current vs future-effective, with a
   switchover on 2026-07-01 or per the Judge's instruction);
2. the **display gate** on `restricted_pending_license_review` chunk types;
3. **many-to-many document↔chapter** membership from the dedup alias report;
4. TRE's limited-answer scoping as a queryable attribute, kept separately
   labeled;
5. the carry-forward extraction gaps (encrypted handbook; statutory
   subsection capture; DCS guide/manual heading depth).

`NEXT_PHASE_PROMPT.md` contains a ready-to-paste prompt for that work.
