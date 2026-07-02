# 13 — Next-Action Prompt for Implementation (Phase A/B only)

**Revised 2026-06-10 (second pass).**

## Corrected high-level finding

The approved source PDFs are now locally accessible as an untracked root-level folder, `Benchbook.ai Database Files/` (675+ PDFs; spot-verified as current 2026-06-08 LexisNexis exports; first-look SHA-256s in `APPENDIX_A_SOURCE_FILE_HASHES_20260610.txt`). The active production corpus remains **stale, flat, untraceable, and disqualified**. The source PDFs must be hashed and placed under a controlled source-of-record manifest **before any ingestion**. The immediate next implementation phase is **Phase A/B: clean source manifest, source-of-record preservation, approval classification, and corpus authority audit. No RAG refactor and no UI work begins before that is complete.**

---

## Proposed next Claude Code prompt (copy-paste)

```
You are Claude Code working in /Users/m3_ai_factory/Projects/benchbook-ai on branch
refactor/codex-gpt55-launch-prep.

Context: docs/architecture-review/ (2026-06-10) is the controlling review. The approved
source PDFs are present as the untracked root folder "Benchbook.ai Database Files/"
(675+ PDFs). First-look hashes are recorded in
docs/architecture-review/APPENDIX_A_SOURCE_FILE_HASHES_20260610.txt. The production
corpus (app/src/lib/legal-corpus-data.json) is a disqualified 2021 snapshot.

This run is Phase A/B ONLY: source-of-record manifest and corpus authority audit.

HARD CONSTRAINTS:
- Do NOT extract, parse, chunk, embed, or ingest any PDF text into any corpus format.
- Do NOT modify anything under app/src/** (including the four files with preexisting
  uncommitted changes: citations.test.ts, scope-guard.test.ts, citation-validator.ts,
  scope-guard.ts).
- Do NOT move, rename, modify, or delete anything inside "Benchbook.ai Database Files/".
  Treat it as read-only evidence.
- Do NOT run `git add` or `git commit` on anything. In particular, never stage the PDF
  folder: large licensed PDFs must not enter git history casually. If a .gitignore
  addition is needed to protect against accidental commits, propose the exact line in
  your report rather than committing it.
- Do NOT expose secrets or print env values.

TASKS:
1. Manifest design. Write docs/source-manifest/MANIFEST_DESIGN.md specifying the
   SOURCE_MANIFEST.json schema: per-file fields sha256, relative_path, filename,
   size_bytes, source ("Benchbook.ai Database Files" Google Drive folder), date_observed,
   authority_classification, version_label, currency_evidence (quoted text + page/source),
   approval_status, approved_use, license_notes, notes. Include manifest-level fields:
   manifest_version, generated_at, generator, total_files, root_path.
2. Hash every file in "Benchbook.ai Database Files/" (read-only). Verify each hash
   against APPENDIX_A_SOURCE_FILE_HASHES_20260610.txt and report any mismatch, addition,
   or deletion since first observation as a discrepancy (a discrepancy is a stop-and-ask
   condition).
3. Generate docs/source-manifest/SOURCE_MANIFEST.json per the design, covering every
   file in the folder.
4. Classify every file into exactly one of: statute | rule | dcs_policy | metadata |
   unknown | excluded. Guidance: Title 36/Title 37 PDFs = statute; Tenn. R. Juv. P. and
   Tenn. R. Evid. = rule; the DCS tree PDFs = dcs_policy; START_HERE.txt, index or readme
   files = metadata; anything you cannot confidently classify = unknown (never guess);
   anything outside the approved closed universe (e.g., stray Title 39/40/55 material,
   case law) = excluded.
5. Set approval_status to "pending" for EVERY file. Nothing is "approved" unless Judge
   Eckel has expressly approved it in writing; do not infer approval from presence in
   the folder. Leave approved_use null (the Judge will designate Tenn. R. Evid. as
   answer corpus, guardrail corpus, or both).
6. Currency audit (read-only inspection of PDFs, no corpus output): for each statute and
   rule PDF, extract the edition/currency evidence (creation date, "current through" or
   amendment-history endpoints, effective-date banners) and record it as
   currency_evidence in the manifest. Confirm none of the Title 36/37 files are the 2021
   TNCODE Release 76 lineage. For the DCS tree, sample at least 10 policies across
   different chapters for effective/revision dates.
7. Write docs/source-manifest/MANIFEST_REPORT.md: counts by classification; counts by
   approval status; per-authority currency summary; files classified unknown or excluded
   (each with reason); hash-verification result vs Appendix A; reconciliation summary of
   the Drive DCS tree vs ~/Downloads/TN-DCS-Policies-Procedures-Obligations-STAGING/
   (sample PowerDMS IDs — same versions or not); and open questions for the Judge
   (approval stamps, TRE designation, DCS approved-policy list).
8. Storage recommendation (recommend only — execute nothing): in MANIFEST_REPORT.md,
   recommend the permanent source-of-record structure. Evaluate at least:
   (a) legal-corpus/source-of-record/ gitignored with only the manifest committed;
   (b) git-lfs; (c) an external read-only volume with the manifest as the repo's sole
   record. Address: accidental-commit protection, backup, hash re-verification cadence,
   and LexisNexis license constraints on redistribution/annotation display.

REPORT AT THE END:
- files created; files updated; commands run
- whether any app source files changed (must be: none)
- git status before vs after (only docs/source-manifest/** additions expected)
- any remaining blockers and the exact questions awaiting the Judge

STOP AND ASK FOR DIRECTION IF: any hash mismatches Appendix A; any required authority
(Title 36, Title 37, TRJPP, TRE, DCS) appears missing or stale; any file appears to be
outside the closed universe in a way that suggests folder contamination; or any task
would require modifying app source or moving the source folder.
```

## What the Judge must decide after that run

1. **Approval stamps** per authority (manifest `approval_status`: pending → approved/rejected).
2. **TRE designation:** answer corpus, guardrail/reference corpus, or both.
3. **DCS approved-policy list:** which policies constitute the "expressly approved" set.
4. **Storage decision:** adopt one of the recommended source-of-record structures (this is when the folder finally moves — not before).
5. **Go-ahead for Phase C** (ingestion pipeline rebuild) once the manifest is approved.

## Explicitly deferred (do not start before Phase A/B closes)

- Ingestion/extraction (Phase C), authority database schema (Phase D), retrieval/RAG refactor (Phase E), citation/support validation (Phase F), guardrail expansion (Phase G), QA harness (Phase H), all UI/copy work (Phase I).
- The two app-code defects from doc 05 §C (context overflow; invalid default model IDs) remain open and untouched by design — they are recorded for the first phase in which app-code changes are authorized.
