# BenchBook.AI Ingestion Pipeline (Phase C expansion)

Extraction/chunking ONLY: source PDF → cleaned per-page text → structured
Markdown → JSONL authority chunks + QA reports. No database load, no
embeddings, no production corpus. Outputs land in `data/ingestion-expanded/`,
which is **gitignored** (derivative legal text stays out of git pending the
storage/licensing decision).

## Setup

Any Python 3.10+ interpreter with the pinned dependencies:

```bash
python3 -m venv .venv-ingestion
.venv-ingestion/bin/pip install -r scripts/ingestion/requirements.txt
```

No scratch paths are hardcoded — run the script with whichever interpreter
satisfies `requirements.txt`. OCR tools (`ocrmypdf`/`tesseract`) are detected
opportunistically but have never been needed: all sources carry embedded text.

Known limitation: one staged source
(`…/Ch31_Field_Services/637_Handbook_Clients_Rights_Handbook.pdf`) is
AES-encrypted; opening it requires the optional `cryptography` package (see
requirements.txt), which is **not installed** — the pipeline records a
controlled `extraction_failed` for that file instead.

## Run

```bash
.venv-ingestion/bin/python scripts/ingestion/run_expanded_ingestion.py
```

The script:
1. loads `data/source-manifest/SOURCE_MANIFEST.jsonl` and selects the
   judge-approved expansion set (Title 36, Title 37, TRJPP, TRE, DCS staged
   chapters Ch09/Ch14/Ch16A/Ch16B/Ch31) — selection is manifest-driven, never
   a hardcoded file list;
2. re-verifies every selected file's SHA-256 against the manifest
   (**any mismatch aborts with exit 2 — stop-and-ask**);
3. dedups DCS files by SHA-256 (chunk once, aliases preserved in
   `EXPANDED_DEDUPLICATION_REPORT.json`);
4. extracts per-page text (pypdf), strips running headers/footers, segments
   by legal structure, and emits chunks + QA outputs (see
   `docs/ingestion-expansion/` for schema and reports).

Exit codes: `0` success (controlled per-file failures are recorded, not
fatal); `2` manifest verification failure; `3` missing prerequisites.

## Rerunning

The pipeline is deterministic for unchanged sources: chunk IDs are derived
from source SHA-256 + structural position, so reruns diff cleanly except
top-level `generated_at` timestamps. Rerun after any manifest change, parser
fix, or newly approved DCS chapters (extend `STAGED_DCS_CHAPTERS` only on the
Judge's written approval).

## Hard rules encoded in the pipeline

- Annotations / case notes / AG opinions / commentary are separate chunk
  types, marked `production_display_status: restricted_pending_license_review`
  — never merged into black-letter text.
- TRE chunks carry `corpus_designation:
  evidence_guardrail_and_limited_answer_candidate` plus an `answer_scope_note`;
  TRE is answer authority only for evidentiary/procedural questions.
- Statutory version variants (`[Effective until/on July 1, 2026 …]`) are
  flagged with `effective_dated_version_unit` warnings — current and
  future-effective text must be partitioned in Phase D, never blended.
- Every chunk's `approval_status` is `pending_extraction_qa`; nothing this
  pipeline produces is production-ready.
