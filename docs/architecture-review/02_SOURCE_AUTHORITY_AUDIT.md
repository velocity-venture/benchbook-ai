# 02 — Source Authority and Corpus Audit (Phase 1)

**Date:** 2026-06-10 · This is the controlling finding of the review.
**Judge's directive (2026-06-10):** the active 2021-derived corpus is disqualified for production answers; corpus rebuild is priority one.

## A. Source-of-record PDFs: RESOLVED MID-REVIEW (status superseded at 2026-06-10 21:12)

At the start of this review the approved Google Drive folder had **no local copy**: `~/Library/CloudStorage/` was empty (no Drive client mount), and Spotlight plus recursive `find` across `~/Desktop`, `~/Downloads`, `~/Documents`, `~/Projects`, and iCloud Drive found none of the five named PDFs. The review proceeded on that basis with Judge's direction.

**While the review was in progress, the folder was downloaded into the repo root** as `Benchbook.ai Database Files/` (untracked):

| Content | Files | First-look assessment |
|---|---|---|
| `Tenn. R. Evid..pdf` | 1 (4.6 MB) | Present — first TRE artifact anywhere in the project |
| `Tenn. R. Juv. P. Rules.pdf` | 1 (481 KB) | Present |
| `Title 36/` | 6 PDFs (section-range files `36_1_101_36_3_302.pdf` …) | LexisNexis exports |
| `Title 37/` | 6 PDFs (`37_1_101_37_1_201.pdf` … `37-11-103.pdf`) | LexisNexis exports |
| `DCS P&P/TN_DCS_Policies/` | chapter tree, 675 PDFs total in folder | Appears to mirror the Downloads "Windows_Ready" structure incl. `START_HERE.txt` |

**Currency spot-check (performed):** `Title 37/37_1_101_37_1_201.pdf` metadata shows creation 2026-06-08 via Lexis+ (Aspose producer, `plus.lexis.com` link annotations, `LADocCount(100)`); body text carries amendment histories through **2025 ch. 322 and ch. 398** and version banners "[Effective until July 1, 2026. See the version effective on July 1, 2026.]" — i.e., **current through the 2025 session with 2026 forward-versioning**. This is the correct era of source material, and it is *annotated* TCA (Annotations/Notes sections present), matching the closed-universe specification.

Provisional SHA-256 hashes for **all 677 files** (675 PDFs, `START_HERE.txt`, and `00_INDEX/download_manifest_windows_paths.csv` — a DCS download/provenance index worth keeping as `metadata`) are recorded in `docs/architecture-review/APPENDIX_A_SOURCE_FILE_HASHES_20260610.txt` (chain-of-custody; Phase B's `SOURCE_MANIFEST.json` supersedes it).

**Open items moving to Phase B:** per-file currency evidence for the remaining 5 Title-37 / 6 Title-36 PDFs, TRE and TRJPP amendment-date verification; Judge approval stamps; TRE use designation; DCS approved-policy list; reconciliation against the `~/Downloads` DCS sets; decision whether 100+ MB of PDFs stay in-repo (git-lfs) or move outside with manifest tracking; and **review of LexisNexis license terms** before any Lexis annotation text is displayed to end users (the PDFs embed Lexis document IDs and a user permission ID — personal licensed access).

## B. Authority-by-authority inventory

Classifications: **Adopt / Adopt with revision / Archive / Reject / Needs further review (NFR)**

### B.1 In-repo corpus materials

| # | File/path | Authority type | Source / currentness | Original or derivative | In closed universe? | Condition | Checksum/version metadata | Traceable to page/section/version? | Classification | Next action |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `app/src/lib/legal-corpus-data.json` → `tcaTitle36` (4,547,209 chars) | Statute (TCA Title 36) | **TNCODE Release 76, released 2021-05-21**, Public.Resource.Org transform (cic-beautify v1.3, 2021-05-18) — self-declared in first line of text | Derivative (HTML→tag-stripped flat string) | Yes (Title 36) but **stale** | **Stale (5 years), unverified** | None (only file-level `buildDate: 2026-04-18`) | No — no page, hierarchy collapsed to one string | **Reject as production authority** | Replace via Phase B/C from approved current PDF |
| 2 | same file → `tcaTitle37` (1,558,718 chars) | Statute (TCA Title 37) | Same TNCODE Release 76 (2021); still carries "[Effective until January 1, 2025]" Zero-to-Three sunset as future law | Derivative | Yes (Title 37) but **stale** | **Stale, unverified** | None | No | **Reject as production authority** | Same |
| 3 | same file → `trjppRules` (74,121 chars) | Court rules (TRJPP) | Unknown release year; no version line in text | Derivative (concatenation of rule .txt files) | Yes | **Unverified currentness** (TRJPP amended most years) | None | Rule numbers yes; advisory comments not separated; no version | **NFR** | Verify against current official TRJPP PDF; likely replace |
| 4 | same file → `dcsText` (549,393 chars) | DCS policy extracts | Unknown extraction date; covers ~26 policies only | Derivative (.txt extractions) | Yes *if* the underlying policies are the Judge-approved annotated set — unverified | **Partial** (chapters 9.5, 14.x, 16.x only) and unverified | None | Policy numbers in headers; no effective/revision dates preserved as fields | **NFR** | Replace via DCS source-of-record set (B.2 #1) |
| 5 | `legal-corpus/tca/title-39/40/55-*.md` (3 stubs, ~1 KB each) | Statute placeholders | n/a (placeholder text) | Placeholder | **No — explicitly excluded titles** | Placeholder | n/a | n/a | **Archive** | Move out of corpus tree so no build can ever ingest them |
| 6 | `legal-corpus/trjpp/rule-101.txt … rule-404.txt` (45 files) | Court rules | Unknown; files dated 2026-04-19 (repo mtime, not authority date) | Derivative | Yes | Unverified; `all-rules.txt` (the build input) **deleted** | None | Rule number per filename; no version | **NFR** | Verify vs. official current TRJPP; regenerate from PDF |
| 7 | `legal-corpus/dcs/chap*.txt` (26 files: 9.5, 14.1–14.13, 14.25–14.28, 16.2–16.11) | DCS policy text | Unknown extraction provenance | Derivative | Conditionally (pending Judge's approved-policy list) | Partial subset; README claims these are PDFs (they are not) | None | Policy number in filename; dates inside text not structured | **NFR** | Re-extract from approved PDF set with metadata |
| 8 | `legal-corpus/tca/title-36.html`, `title-37.html`, `trjpp/all-rules.txt` | Statute/rules HTML sources | **DELETED from repo** | — | — | **Missing** — breaks `validate-corpus.js` REQUIRED_FILES and makes #1–#3 unrebuildable | — | — | **(absent)** | Critical blocker; restore lineage via Phase B |
| 9 | Tennessee Rules of Evidence | Court rules | **ABSENT — appears nowhere in repo, corpus, or code** | — | Yes (pending Judge's production-use designation) | Missing entirely | — | — | **(absent)** | Acquire PDF; Judge to designate answer corpus vs. guardrail corpus vs. both |
| 10 | Local rules (`legal-corpus/local-rules/`) | Local court rules | Directory referenced by README/copy but **does not exist** | — | Only if expressly approved per court | Missing | — | — | **(absent)** | Future; keep out of V1 until approved |

### B.2 Local filesystem candidates (outside repo)

| # | Path | Authority type | Assessment | Classification | Next action |
|---|---|---|---|---|---|
| 1 | `~/Downloads/TN-DCS-Policies-Procedures-Obligations-STAGING/` — 661 PDFs across 22 chapter folders, PowerDMS document IDs in filenames, `00-source-index/`, README | DCS policies (original PDFs) | **Best available DCS source-of-record candidate.** Provenance index included; PowerDMS IDs allow version pinning | **Adopt with revision** (pending Judge's approval of which policies enter the answer corpus) | Hash + manifest in Phase B; confirm against the Drive folder set |
| 2 | `~/Downloads/TN_DCS_Policies_Windows_Ready/` — 661 PDFs, renamed/flattened | DCS policies (derivative renaming) | Duplicate of #1 with lossy filenames | **Archive** | Keep as backup only; do not ingest |
| 3 | `~/Library/Mobile Documents/com~apple~CloudDocs/MacStudio_M3_Backup_20260313/OneDrive_Transfer/AI_VR_AR/BenchBook.ai/Title 36 Files(100).ZIP` and `Title 37 Files(100).ZIP` (also duplicated under `GROK Project Files/BBhistoric Files/`) | TCA titles, zipped | Historical OneDrive-era transfer; unverified contents and date; likely same stale era | **NFR** | Do not ingest. Open only to compare lineage after current PDFs arrive |
| 4 | Same backup → `Juvenile Court/TENNESSEE RULES OF JUVENILE PROCEDURE.docx` | TRJPP (Word) | Unverified era; .docx not source-of-record | **NFR / likely Archive** | Supersede with official PDF |
| 5 | `~/Downloads/Tenn. Code Ann. _ 39-17-1324.pdf`, `39-17-1505.pdf`, `State v Hall...pdf`, misc. court PDFs | Individual Title 39 sections, case law | Outside closed universe (Title 39; case law unapproved) | **Reject for corpus** | Leave in Downloads; never ingest |
| 6 | `~/Projects/vvh-legal-authority-corpus/raw/statutes/tca-*.txt` | Individual TCA sections (incl. 36/37 sections) | **Different project (VVH).** Mixed titles incl. 39/55 | **Reject for BenchBook** | Do not cross-contaminate projects |

## C. Closed-universe coverage scorecard

| Approved authority | Present in production corpus? | Current? | Traceable? | Verdict |
|---|---|---|---|---|
| TCA Title 36 | Yes (flat string) | **No — 2021** | **No** | Rebuild required |
| TCA Title 37 | Yes (flat string) | **No — 2021** | **No** | Rebuild required |
| Approved annotated DCS policies | Partial (~26 of 661+) | Unknown | Filename-level only | Rebuild + Judge approval list required |
| TRJPP | Yes (flat string) | Unknown | Rule-level only | Verify or rebuild |
| Tenn. R. Evid. | **Absent** | — | — | Acquire + designate use |
| Later-approved sources | n/a | — | — | Manifest must support additions |

**Unapproved material checks:** Case law — not in the corpus; regex patterns in `citation-validator.ts:164-171` detect case citations in *answers* and always mark them unverified, with a Westlaw/LexisNexis warning (correct posture; keep). Web-derived material — none ingested at runtime (no fetch calls in the chat path). Secondary sources — none found. Local rules — none present. Titles 39/40/55 — placeholder stubs only, excluded by `prebuild-corpus.js` (`V1_TCA_TITLES`), by `scope-guard.ts`, and (in the uncommitted change) by `citation-validator.ts` defense-in-depth. The seed file `supabase/seed-demo-data.sql` contains fictional case-management demo data (case numbers, child initials) — not corpus material, but it must never ship to production (see 04/10).

## D. Critical blocker statement

Per the review instruction, the stale-corpus condition is **confirmed, not suspected**: the active Title 36/37 text self-identifies as TNCODE Release 76 (2021-05-21). Combined with deleted build inputs and the silent-preserve fallback in `prebuild-corpus.js:82-87`, the system has no mechanism that would ever surface this staleness to a user or operator. The `buildDate` of 2026-04-18 on the JSON actively *misleads* — it records when the stale text was last re-bundled, not the law's currency.

**Next action (Phase A/B of the roadmap):** Judge downloads the Drive folder to a fixed local path; every file is hashed (SHA-256), recorded in a `SOURCE_MANIFEST.json` with authority type, version label, effective date, and approval status; originals preserved read-only; only manifest-listed, Judge-approved files may enter any future build, and builds must fail (not silently fall back) when manifest validation fails.
