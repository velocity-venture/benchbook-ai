# Source Manifest Audit Report (Phase A/B)

**Date:** 2026-06-12 · **Branch:** `refactor/codex-gpt55-launch-prep`
**Builder:** `scripts/source_manifest/build_source_manifest.py` (manifest_version 1.1)
**Mode:** Read-only against the source folder. No PDF text extracted, nothing
ingested, no embeddings, no app source modified, nothing staged or committed.

## 1. Coverage and hash verification

| Check | Result |
|---|---|
| Files inventoried | **677** (matches expected count) |
| Total bytes | 165,836,692 (≈158.2 MB) |
| SHA-256 computed | 677/677 |
| Verification vs `APPENDIX_A_SOURCE_FILE_HASHES_20260610.txt` | **EXACT_MATCH** — 0 mismatches, 0 additions, 0 deletions |

The source folder remains byte-identical to its first observation on
2026-06-10 (and to the 2026-06-11 re-verification). No stop-and-ask condition.

## 2. Counts by source type

| source_type | Count |
|---|---|
| `statute` | 12 |
| `rule` | 2 |
| `dcs_policy` | 661 |
| `metadata` | 2 (`START_HERE.txt`; `00_INDEX/download_manifest_windows_paths.csv`) |
| `unknown` | 0 |
| `excluded` | 0 |

## 3. Counts by authority family

| authority_family | Count | Notes |
|---|---|---|
| `tca_title_36` | 6 | Range exports spanning §36-1-101 → §36-8-104 |
| `tca_title_37` | 6 | Range exports spanning §37-1-101 → §37-11-103 (standalone `37-11-103.pdf` closes the range) |
| `tenn_rules_juvenile_practice_procedure` | 1 | |
| `tenn_rules_evidence` | 1 | `corpus_designation: pending_judge_designation` — **not** an answer-corpus source absent the Judge's designation |
| `dcs_policies_procedures` | 661 | Chapter folders preserved in `notes` |
| `metadata` | 2 | |

## 4. Approval status

| approval_status | Count |
|---|---|
| `pending_judge_approval` | 675 |
| `not_required_metadata` | 2 |
| `approved` / `rejected` | 0 |

Presence in the folder is not approval. Currentness was **not** inferred from
filenames; the read-only currency inspection of 2026-06-11 (see
`MANIFEST_REPORT.md` §4) found all statutes "Current through Act 951 (except
Act 704) of the 2026 Regular Session" and both rule sets current through
2026-05-27 — evidence for the Judge's approval decision, not a substitute
for it.

## 5. Anomaly findings

| Detector | Result |
|---|---|
| **Duplicate hashes** | **24 groups, 54 files (30 redundant copies → 631 unique DCS documents).** All groups are DCS documents legitimately cross-listed under multiple chapters of the DCS policy table (e.g., *Work Aid 13 — DCS Cases Involving Domestic Violence* appears under Ch13, Ch14, Ch16A, and Ch31; *Protocol for Employee Code of Conduct* under Ch01 and Ch04). Full list: `data/source-manifest/SOURCE_MANIFEST_DUPLICATES.json`. **Benign**, but Phase C must deduplicate by hash — chunk each document once and reference it from every chapter it belongs to — to avoid double-weighted retrieval. |
| Non-PDF files | 2 — the two expected metadata files (`START_HERE.txt`, 00_INDEX CSV). |
| Empty files | 0 |
| Unusually large (>10 MB) | 0 (largest: `Title 36/36_1_101_36_3_302.pdf`, 5.4 MB) |
| Unknown files | 0 |
| Excluded / out-of-universe files | 0 — no stray Title 39/40/55 material, no case law |
| Unexpected top-level entries | 0 — top level is exactly {Title 36, Title 37, DCS P&P, the two rules PDFs} |

No folder contamination; no condition requiring a judicial decision beyond
the standing approval/designation questions.

## 6. Git protection added

`.gitignore` now contains (with a comment block explaining why):

```gitignore
Benchbook.ai Database Files/
legal-corpus/source-of-record/
```

Verified: `git check-ignore` confirms the source PDFs are ignored, and
`data/source-manifest/`, `docs/source-manifest/`, `scripts/source_manifest/`
remain **commit candidates** (not ignored). The second entry pre-stages
protection for the recommended permanent home. `.gitignore` alone does not
stop `git add -f`; the pre-commit hook and CI PDF check are recorded as Phase
C tasks in `SOURCE_OF_RECORD_STORAGE_RECOMMENDATION.md`.

## 7. Outputs produced (all commit candidates)

| Path | Purpose |
|---|---|
| `scripts/source_manifest/build_source_manifest.py` | Rerunnable audit builder (stdlib-only) |
| `data/source-manifest/SOURCE_MANIFEST.jsonl` | Canonical machine-readable manifest, 677 lines |
| `data/source-manifest/SOURCE_MANIFEST_SUMMARY.json` | Counts, anomalies, verification result |
| `data/source-manifest/SOURCE_MANIFEST_DUPLICATES.json` | 24 duplicate-hash groups |
| `data/source-manifest/SOURCE_MANIFEST_UNKNOWN_FILES.json` | Empty (no unknown/excluded files) |
| `docs/source-manifest/SOURCE_MANIFEST_IMPLEMENTATION_PLAN.md` | Phase A/B plan + exit criteria |
| `docs/source-manifest/SOURCE_MANIFEST_SCHEMA.md` | Field/enum definitions, invariants |
| `docs/source-manifest/SOURCE_OF_RECORD_STORAGE_RECOMMENDATION.md` | Storage options + recommendation |
| `docs/source-manifest/HOW_TO_RERUN_MANIFEST_AUDIT.md` | Rerun procedure + exit-code meanings |

Prior-pass deliverables (2026-06-11: `MANIFEST_DESIGN.md`,
`SOURCE_MANIFEST.json` v1.0.0 with per-file currency quotations,
`MANIFEST_REPORT.md`) are retained; the JSONL is now the canonical
machine-readable record.

## 8. Decisions awaiting the Judge (Phase C gate)

1. Approval stamps per authority (`pending_judge_approval` → approved/rejected).
2. Tenn. R. Evid. designation: answer corpus, guardrail/reference corpus, or both.
3. DCS approved-policy list: all 661 (631 unique) or a designated subset.
4. Storage structure adoption (Option A recommended) and authorization to move
   the folder.
5. LexisNexis license confirmation (retention/backup; annotation display).

## 9. Recommended next phase

**Phase C — ingestion pipeline rebuild** (source PDF → cleaned text →
structured Markdown/HTML → JSONL authority chunks), **gated on the decisions
above**. Phase C must: verify the manifest before every run, process only
`approved` files, deduplicate DCS documents by SHA-256, and strip or retain
Lexis annotations per the license answer. Not started in this run.
