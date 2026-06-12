# Pilot Authority Chunk Schema (`PILOT_AUTHORITY_CHUNKS.jsonl`)

**Phase C pilot — extraction/chunking validation only. Nothing in this file is
production-ready or an approved authority text.**

One JSON object per line. Chunk IDs are deterministic (derived from the source
file's manifest SHA-256 plus the chunk's structural position), so reruns over
unchanged sources produce identical IDs.

## Fields

| Field | Type | Meaning |
|---|---|---|
| `chunk_id` | string | `bb-pilot-` + first 24 hex of SHA-256(source_sha256 + structural key). Stable across reruns. |
| `source_manifest_sha256` | string | SHA-256 of the source PDF, copied from `data/source-manifest/SOURCE_MANIFEST.jsonl` after re-verification at run time. |
| `source_path` | string | Repo-relative path of the source PDF. |
| `source_type` | enum | `statute` \| `rule` \| `dcs_policy` (from manifest). |
| `authority_family` | enum | `tca_title_37` \| `tenn_rules_juvenile_practice_procedure` \| `tenn_rules_evidence` \| `dcs_policies_procedures` (from manifest). |
| `corpus_designation` | enum | `pilot_extraction_only` for all chunks except Tennessee Rules of Evidence chunks, which carry `pending_judge_designation` — TRE is **not** a final answer-corpus source. |
| `approval_status` | string | Flows through unchanged from the source manifest (`pending_judge_approval` for every pilot legal source). The pilot never upgrades approval. |
| `canonical_citation` | string | `Tenn. Code Ann. § 37-1-129` / `Tenn. R. Juv. P. 307` / `Tenn. R. Evid. 403` / `DCS Policy 14.14`. Blank when not reliably parseable (warning recorded). |
| `citation_aliases` | array | Common alternate forms (`T.C.A. § …`, `TRJPP …`, `TRE …`, `DCS …`). |
| `title` | string | Section/rule heading or DCS policy title, as extracted. |
| `chapter` | string | T.C.A. chapter (e.g. `Chapter 1 Juvenile Courts and Proceedings`) or TRE article. |
| `part` | string | T.C.A. part (e.g. `Part 1 General Provisions`). |
| `section` | string | T.C.A. section number (`37-1-114`) or DCS body-section heading. |
| `subsection` | string | Reserved; blank in this pilot (subsection splitting not attempted). |
| `rule_number` | string | TRJPP/TRE rule number. |
| `policy_number` | string | DCS policy number (`14.14`). |
| `policy_chapter` | string | DCS chapter folder (`Ch14_CPS`). |
| `chunk_type` | enum | See below. |
| `page_start` / `page_end` | int \| null | 1-based page span in the source PDF the chunk's text came from. |
| `hierarchy_path` | array | Lexis hierarchy breadcrumb (statutes/rules) or DCS path (`["DCS Policies and Procedures", "Ch14_CPS", "14.14 Removal: …"]`). |
| `text` | string | The chunk text (cleaned of running headers/footers). |
| `text_sha256` | string | SHA-256 of `text` (UTF-8) — used for duplicate detection and downstream integrity. |
| `extraction_warnings` | array | Chunk-level warnings (e.g. `unusually_large_chunk:…`). File-level warnings live in `PILOT_EXTRACTION_WARNINGS.json`. |

## `chunk_type` values

| Value | Meaning |
|---|---|
| `black_letter_text` | Statutory/rule text proper — the only blocks that may ever be quoted as the law itself. |
| `history` | Enactment/amendment history lines (`Acts 2024, ch. 866, § 1.`). |
| `advisory_comment` | Advisory Commission Comments / Commentary blocks. |
| `annotation_candidate` | Lexis editorial matter: Compiler's Notes, Cross-References, Law Reviews, Research References & Practice Aids. **Never** law; also subject to the open LexisNexis annotation-display license question. |
| `case_note_candidate` | NOTES TO DECISIONS / Case Notes compilations (Lexis case summaries). Same caveats as annotations. |
| `policy_text` | DCS policy body section. |
| `protocol` / `guide` / `work_aid` / `manual` | DCS document types (none in this pilot set — all 14 are numbered policies). |
| `metadata` | DCS page-1 header block (application, authority, standards, effective/supersedes dates). |
| `unknown` | Could not be classified (preamble pages, unparseable units). |

## Block-separation guarantee

Annotations, case notes, history, and commentary are emitted as **separate
chunks** from black-letter text, segmented at the Lexis block markers
(`History`, `Annotations`, `Commentary`, `NOTES TO DECISIONS`, `Case Notes`,
`Research References & Practice Aids`). Annotations are never silently merged
into statutory or rule text. Where a marker is missing or unrecognized, the
text stays in its current block and the QA layer flags anomalies (oversized
chunks, missing headings) rather than guessing.
