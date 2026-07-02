# Source Manifest Implementation Plan (Phase A/B)

**Date:** 2026-06-12 · **Branch:** `refactor/codex-gpt55-launch-prep`
**Controlling review:** `docs/architecture-review/` (2026-06-10)

## Objective

Establish the source-of-record manifest for the approved closed universe of
BenchBook.AI source documents before any ingestion work begins. PDFs are
archival source-of-record, **not** the working database; the manifest is the
committed, auditable record that binds the repository to exact source bytes
without the bytes entering git.

## Scope (Phase A/B only)

| In scope | Out of scope (later phases) |
|---|---|
| Hash + inventory every file in `Benchbook.ai Database Files/` | Text extraction / cleaning (Phase C) |
| Classification: source type + authority family | Markdown/HTML structuring, JSONL chunks (Phase C) |
| Anomaly detection (duplicates, non-PDF, empty, oversized, unknown, out-of-universe) | PostgreSQL authority DB / FTS / pgvector (Phases D–E) |
| `.gitignore` protection for raw source files | Citation/guardrail/QA/UI work (Phases F–I) |
| Storage recommendation (recommend only) | Moving the source folder (awaits Judge's storage decision) |
| Approval bookkeeping (`pending_judge_approval`) | Granting approvals (Judge only, in writing) |

## Components

1. **Builder script** — `scripts/source_manifest/build_source_manifest.py`
   (stdlib-only Python 3). Walks the source folder read-only, hashes (SHA-256),
   classifies, detects anomalies, optionally verifies against a prior hash
   record, and writes all machine-readable outputs deterministically (sorted by
   `relative_path`). Exit code 2 on any verification discrepancy = stop-and-ask.
2. **Machine-readable outputs** — `data/source-manifest/`:
   `SOURCE_MANIFEST.jsonl` (one object per file),
   `SOURCE_MANIFEST_SUMMARY.json`, `SOURCE_MANIFEST_DUPLICATES.json`,
   `SOURCE_MANIFEST_UNKNOWN_FILES.json`. All are commit candidates.
3. **Schema** — `docs/source-manifest/SOURCE_MANIFEST_SCHEMA.md` (field
   definitions, enums, invariants).
4. **Audit report** — `docs/source-manifest/SOURCE_MANIFEST_AUDIT_REPORT.md`
   (human-readable; usable for judicial/legal audit).
5. **Storage recommendation** —
   `docs/source-manifest/SOURCE_OF_RECORD_STORAGE_RECOMMENDATION.md`.
6. **Rerun procedure** — `docs/source-manifest/HOW_TO_RERUN_MANIFEST_AUDIT.md`.
7. **Git protection** — `.gitignore` entries for `Benchbook.ai Database Files/`
   and the future `legal-corpus/source-of-record/` home.

## Relationship to the 2026-06-11 deliverables

The first Phase A/B pass produced `MANIFEST_DESIGN.md`,
`SOURCE_MANIFEST.json` (v1.0.0, single JSON document), and
`MANIFEST_REPORT.md`, including the per-authority **currency audit**
(Lexis banners quoted; statutes current through Act 951 of the 2026 Regular
Session; rules current through 2026-05-27) and the Drive-vs-staging
reconciliation. Those findings stand. This pass supersedes the *machine-readable*
record: `SOURCE_MANIFEST.jsonl` v1.1 (rerunnable, scripted, with anomaly
detection) is now canonical; the v1.0.0 JSON and `MANIFEST_DESIGN.md` are
retained as the prior revision. Currency evidence lives in the v1.0.0 JSON and
`MANIFEST_REPORT.md` §4 and will be folded into the authority database design
in Phase D.

## Invariants

1. Every file on disk has exactly one manifest line; no line without a file.
2. Hashes are verified against the prior record on every rerun; any
   mismatch/addition/deletion halts work (exit 2) pending direction.
3. `approval_status` changes only on the Judge's written instruction.
4. Phase C+ tooling must refuse any file whose hash is not in the manifest or
   whose status is not `approved`.
5. The source folder is never modified, moved, renamed, or committed.

## Exit criteria for Phase A/B → Phase C

- Manifest covers all 677 files with hash verification passing. ✅ (this run)
- Judge's written decisions recorded: approval stamps per authority; TRE
  designation; DCS approved-policy list; storage structure. ⬜ (pending)
- Storage decision executed (folder moved to its permanent home, manifest
  regenerated and re-verified). ⬜ (pending)
