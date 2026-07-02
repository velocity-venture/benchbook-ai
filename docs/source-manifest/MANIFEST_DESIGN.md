# SOURCE_MANIFEST.json — Design Specification

**Status:** Phase A/B deliverable (2026-06-11). Controlling review: `docs/architecture-review/` (2026-06-10).
**Supersedes:** `docs/architecture-review/APPENDIX_A_SOURCE_FILE_HASHES_20260610.txt` (provisional chain-of-custody record) once this manifest is generated and verified against it.

## Purpose

`SOURCE_MANIFEST.json` is the single source-of-record inventory for the approved closed universe of Benchbook.ai source documents. Every file in the source folder (`Benchbook.ai Database Files/`, downloaded from the approved Google Drive folder) gets exactly one entry. No document may enter any ingestion pipeline (Phase C+) unless it appears in this manifest with `approval_status: "approved"`.

## File location

`docs/source-manifest/SOURCE_MANIFEST.json` — committed to the repository. The PDFs themselves are **never** committed (see storage recommendation in `MANIFEST_REPORT.md`).

## Manifest-level fields

| Field | Type | Description |
|---|---|---|
| `manifest_version` | string | Semver of the manifest document itself. Bump patch for corrections, minor for new fields, major for schema changes. Starts at `"1.0.0"`. |
| `generated_at` | string (ISO 8601) | Timestamp the manifest file was generated. |
| `generator` | string | Tool/process identity that produced the manifest (for audit trail). |
| `total_files` | integer | Number of entries in `files[]`. Must equal the count of files on disk at generation time. |
| `root_path` | string | The folder the `relative_path` values are relative to, as observed at generation time. The folder's permanent home is a pending storage decision; this field records where it was when hashed. |
| `hash_verification` | object | Result of verifying every file hash against the prior record (Appendix A for v1.0.0; the previous manifest version thereafter): `{ verified_against, verified_at, files_matched, mismatches, additions, deletions }`. Any nonzero `mismatches`/`additions`/`deletions` is a stop-and-ask condition. |
| `files` | array | One entry per file, schema below. Sorted by `relative_path`. |

## Per-file fields

| Field | Type | Description |
|---|---|---|
| `sha256` | string | Lowercase hex SHA-256 of file bytes. Identity key for the file's content. |
| `relative_path` | string | Path relative to `root_path`, forward slashes. |
| `filename` | string | Basename, for convenience/search. |
| `size_bytes` | integer | File size in bytes. |
| `source` | string | Provenance: `"Benchbook.ai Database Files" Google Drive folder` for all current entries. Future additions must name their approved origin. |
| `date_observed` | string (YYYY-MM-DD) | Date the file was first observed and hashed (`2026-06-10` per Appendix A for the initial universe). |
| `authority_classification` | string (enum) | Exactly one of: `statute` \| `rule` \| `dcs_policy` \| `metadata` \| `unknown` \| `excluded`. See classification rules below. |
| `version_label` | string \| null | Human-readable edition/currency label (e.g., `"Current through Act 951 (except Act 704) of the 2026 Regular Session"`; for DCS, the policy's current effective date or the index's last-updated marker). `null` for metadata files. |
| `currency_evidence` | array | List of `{ "quote": string, "location": string }` — verbatim quoted text establishing currency, with where it came from (`"p.1 of PDF"`, `"PDF metadata /CreationDate"`, `"00_INDEX CSV 'Last Updated' column"`). Empty array if not applicable (metadata files). |
| `approval_status` | string (enum) | `pending` \| `approved` \| `rejected`. **Initial value is `pending` for every file.** Only Judge Eckel's express written approval moves a file to `approved`; presence in the folder is not approval. |
| `approved_use` | string \| null | How an approved document may be used: e.g. `answer_corpus`, `guardrail_corpus`, `both`. `null` until designated by the Judge (notably the Tenn. R. Evid. designation decision). |
| `license_notes` | string | License constraints. LexisNexis Lexis+ exports (statutes, rules): licensed content, no redistribution, annotation-display constraints to be confirmed. DCS policies: public records via public.powerdms.com. |
| `notes` | string | Free text: policy number/name, PowerDMS URL, audit observations, anomalies. |

## Classification rules (Phase A/B)

- `Title 36/*.pdf`, `Title 37/*.pdf` → `statute`
- `Tenn. R. Juv. P. Rules.pdf`, `Tenn. R. Evid..pdf` → `rule`
- `DCS P&P/TN_DCS_Policies/**/*.pdf` → `dcs_policy`
- `START_HERE.txt`, `00_INDEX/download_manifest_windows_paths.csv`, index/readme files → `metadata`
- Cannot be confidently classified → `unknown` (never guess)
- Outside the approved closed universe (stray Title 39/40/55 material, case law, anything else) → `excluded`

## Invariants

1. Every file on disk under `root_path` has exactly one manifest entry; the manifest has no entry without a file (verified at generation).
2. `sha256` values are verified against the prior record on every regeneration; any mismatch/addition/deletion halts work pending direction.
3. `approval_status` transitions (`pending → approved/rejected`) are made only on the Judge's written instruction and should be accompanied by a dated note in `notes`.
4. Ingestion tooling (Phase C+) must refuse any file whose hash is absent from the manifest or whose `approval_status` is not `approved`.
