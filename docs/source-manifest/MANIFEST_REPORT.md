# Phase A/B Manifest Report — Source-of-Record & Corpus Authority Audit

**Date:** 2026-06-11
**Scope:** `Benchbook.ai Database Files/` (677 files), per `docs/architecture-review/13_NEXT_ACTION_PROMPT_FOR_IMPLEMENTATION.md`.
**Deliverables:** `MANIFEST_DESIGN.md`, `SOURCE_MANIFEST.json` (this folder).
**Mode:** Read-only. No PDF text was extracted into any corpus format; no app source was modified; the source folder was not moved, renamed, or altered; nothing was staged or committed to git.

---

## 1. Hash verification vs Appendix A

**Result: EXACT MATCH — no stop condition.**

Every file under `Benchbook.ai Database Files/` was re-hashed (SHA-256) on 2026-06-11 and compared line-for-line against `docs/architecture-review/APPENDIX_A_SOURCE_FILE_HASHES_20260610.txt` (as corrected 2026-06-11 to include the 00_INDEX CSV).

| Check | Result |
|---|---|
| Files on disk | 677 |
| Entries in Appendix A | 677 |
| Hash mismatches | 0 |
| Files added since first observation | 0 |
| Files deleted since first observation | 0 |

The folder is byte-identical to its first observation on 2026-06-10. `SOURCE_MANIFEST.json` now supersedes Appendix A as the source-of-record inventory.

## 2. Counts by classification

| Classification | Count | Notes |
|---|---|---|
| `statute` | 12 | 6 Title 36 PDFs + 6 Title 37 PDFs (Lexis+ range exports; the standalone `37-11-103.pdf` completes Title 37) |
| `rule` | 2 | `Tenn. R. Juv. P. Rules.pdf`, `Tenn. R. Evid..pdf` |
| `dcs_policy` | 661 | Full DCS PowerDMS download tree under `DCS P&P/TN_DCS_Policies/` |
| `metadata` | 2 | `START_HERE.txt`; `00_INDEX/download_manifest_windows_paths.csv` (per Appendix A correction) |
| `unknown` | 0 | — |
| `excluded` | 0 | No stray Title 39/40/55 material, no case law, no out-of-universe files found |
| **Total** | **677** | |

No evidence of folder contamination: every file fits the approved closed universe (Title 36, Title 37, TRJPP, TRE, DCS policy tree, and the two index files).

## 3. Counts by approval status

| Status | Count |
|---|---|
| `pending` | 677 |
| `approved` | 0 |
| `rejected` | 0 |

Per instruction, **nothing** was marked approved. `approved_use` is `null` on every entry pending the Judge's designations.

## 4. Per-authority currency summary

All 14 statute/rule PDFs were individually inspected (read-only) — metadata plus first/last-page text.

| Authority | Currency evidence (quoted from p.1 banners) | Verdict |
|---|---|---|
| **Title 36 (6 PDFs)** | "Current through Act 951 (except Act 704) of the 2026 Regular Session." All 6 files; PDF /CreationDate 2026-06-08. | **Current.** Not the 2021 TNCODE Release 76 lineage. |
| **Title 37 (6 PDFs)** | "Current through Act 951 (except Act 704) of the 2026 Regular Session." All 6 files; PDF /CreationDate 2026-06-08. | **Current.** Not the 2021 lineage. |
| **Tenn. R. Juv. P.** | "Current with amendments received through May 27, 2026"; "[Adopted February 22, 2016; Effective July 1, 2016]". 113 pages. | **Current.** |
| **Tenn. R. Evid.** | "Current with amendments received through May 27, 2026"; "[Effective January 1, 1990]". 356 pages. | **Current.** |
| **DCS policies (661)** | 12-policy sample across 12 chapters (Ch 1, 9, 14, 15, 16A, 16B, 18, 19, 20, 21, 31, 32): every sampled policy carries an Effective Date / Supersedes block; current effective dates range 2013–2026, including very recent revisions (e.g., Protocol for CPS Categories effective 2/17/2026; Policy 19.1 effective 5/12/2026). | **Live PowerDMS versions.** Some older effective dates (e.g., Policy 21.1, eff. 01/01/13) are simply the latest published revision, not staleness of the download. |

DCS "Last Updated" distribution (from the 00_INDEX CSV, 661 rows): 2023 → 75, 2024 → 55, 2025 → 115, 2026 → 74; long tail back to 2007; **94 rows blank**. Of the blanks, 93 manifest entries currently have no per-file currency evidence (one blank-row file was in the inspected sample). These are *recorded*, not failures — their effective dates exist on page 1 of each PDF and can be captured in a Phase C full-text pass or an extended Phase A/B sweep if the Judge wants complete per-file evidence before approval.

**Required-authority completeness:** Title 36 PDFs span §36-1-101 → §36-8-104; Title 37 PDFs span §37-1-101 → §37-11-103 (the standalone `37-11-103.pdf` closes the range). TRJPP and TRE are present in full. No required authority is missing or stale.

## 5. Files classified unknown or excluded

None. (If any had appeared — stray titles, case law — they would have been listed here with reasons and treated as a stop-and-ask condition.)

## 6. Reconciliation: Drive DCS tree vs `~/Downloads/TN-DCS-Policies-Procedures-Obligations-STAGING/`

- The Drive folder's own index (`00_INDEX/download_manifest_windows_paths.csv`, 661 rows with per-file SHA256 + PowerDMS URL) is **internally consistent**: all 661 CSV hashes match the actual files on disk; 0 missing, 0 mismatched.
- The staging tree contains 661 chapter PDFs named with embedded PowerDMS IDs plus index files and a README (downloaded 2026-06-09 from tn.gov/DCS).
- **Sample reconciliation (15 PowerDMS IDs, spread across the full row range — IDs 2099425, 2099440, 2102614, 2103868, 2099461, 2104142, 2104427, 2104695, 2099551, 2103848, 2099588, 2099612, 2105044, 2122479, 2105082): all 15 staging files are byte-identical (same SHA-256) to their Drive-folder counterparts.** Same versions.
- Conclusion: the Drive DCS tree and the Downloads staging archive are the same download set; the Drive copy is the controlling one (it is the approved Google Drive folder content and is covered by Appendix A / the manifest). The staging copy in `~/Downloads` can be treated as a redundant scratch copy once the Judge confirms.

## 7. Open questions for the Judge

1. **Approval stamps:** Which authorities/files move from `pending` to `approved`? (Manifest is ready to record per-file decisions; a blanket per-authority approval — e.g., "all 12 Title 36/37 statute PDFs approved" — can be applied mechanically once given in writing.)
2. **TRE designation:** Is `Tenn. R. Evid..pdf` to be used as **answer corpus**, **guardrail/reference corpus**, or **both**? (`approved_use` is null pending this.)
3. **DCS approved-policy list:** Does the approved set comprise all 661 downloaded policies, or a designated subset (e.g., court-facing/direct-service chapters only)? The CSV's "Selection Reason" column preserves the original targeting rationale if a subset is preferred.
4. **Blank-date DCS files:** The 94 policies with a blank "Last Updated" in the index — is index-level evidence sufficient for approval, or should each be individually inspected for its effective-date block first?
5. **LexisNexis license:** Confirm license terms on (a) retaining the exports in project storage/backup, and (b) whether Lexis editorial annotations/compiler's notes may be shown in product output or must be stripped at ingestion (Phase C design input).
6. **Storage decision:** Adopt one of the structures below (§8). The folder does not move until this decision is made.

## 8. Storage recommendation (recommend only — nothing executed)

### Options evaluated

**(a) `legal-corpus/source-of-record/` in-repo, gitignored; only the manifest committed — RECOMMENDED**
- The folder moves (post-decision) to `legal-corpus/source-of-record/`, gitignored. `SOURCE_MANIFEST.json` is the committed record; hashes bind the repo to exact file bytes without the bytes entering git.
- *Accidental-commit protection:* layered — `.gitignore` entry, plus a pre-commit hook rejecting any staged path under `legal-corpus/source-of-record/` or any staged blob > 5 MB, plus a CI check that no `.pdf` exists in the tree. (Defense in depth because `git add -f` bypasses `.gitignore`.)
- *Backup:* the approved Google Drive folder remains the off-machine master; one additional encrypted local Time Machine/disk backup. Restore = re-download + re-verify against the manifest.
- *Hash re-verification cadence:* scripted `verify-manifest` check run (1) before every ingestion run, (2) weekly, (3) after any sync from Drive. Any mismatch/addition/deletion is a stop-and-ask condition.
- *License fit:* PDFs never enter git history or any remote git host, satisfying the no-redistribution constraint; access stays limited to the local machine + the approved Drive folder.

**(b) git-lfs — NOT recommended**
- Puts licensed LexisNexis content into hosted LFS storage (a redistribution/retention question), costs LFS quota for ~150 MB+ of PDFs, and still pollutes clones. Hash tracking adds nothing over the manifest (LFS pointers are themselves SHA-256, but the manifest already provides that without hosting the bytes).

**(c) External read-only volume; manifest as the repo's sole record — viable fallback**
- Strongest accidental-commit protection (files physically outside the repo) and a read-only mount prevents casual modification. Costs friction: pipeline needs a configured absolute path, the volume must be present for ingestion, and it's easier to end up with unsynchronized copies. Choose this if the Judge prefers the source PDFs entirely outside the project directory; otherwise (a) is simpler with equivalent safety given the hook + CI layers.

### Interim protection (until the storage decision)

The source folder currently sits untracked at the repo root. To protect against accidental staging, the following line should be added to `.gitignore` (not committed by this run, per constraints — proposed only):

```gitignore
Benchbook.ai Database Files/
```

---

## Appendix: method notes

- Hashing: `shasum -a 256` over all 677 files; comparison against Appendix A after stripping comment lines.
- PDF inspection: `pypdf` in a throwaway venv (`/tmp/bb_venv`), reading metadata + first/last pages only, used solely to quote currency banners into the manifest. No extracted text was written anywhere except as short quoted `currency_evidence` snippets.
- Inputs read, never written: the source folder, the 00_INDEX CSV, the Downloads staging tree.
