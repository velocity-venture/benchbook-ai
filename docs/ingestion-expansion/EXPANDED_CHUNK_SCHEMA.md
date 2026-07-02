# Expanded Authority Chunk Schema (`EXPANDED_AUTHORITY_CHUNKS.jsonl`)

**Phase C expansion — extraction QA stage. Nothing here is production-ready.**
Output lives in gitignored `data/ingestion-expanded/`; this schema doc is the
committed record. One JSON object per line; chunk IDs (`bb-exp-` + 24 hex of
SHA-256(source_sha256 + structural key)) are deterministic across reruns.

## Fields

| Field | Type | Meaning |
|---|---|---|
| `chunk_id` | string | Stable deterministic ID (see above). |
| `source_manifest_sha256` | string | SHA-256 of the source PDF per `SOURCE_MANIFEST.jsonl`, re-verified at run time. |
| `source_path` | string | Repo-relative source PDF path. For deduplicated DCS documents this is the primary path; aliases are in the deduplication report. |
| `source_type` | enum | `statute` \| `rule` \| `dcs_policy`. |
| `authority_family` | enum | `tca_title_36` \| `tca_title_37` \| `tenn_rules_juvenile_practice_procedure` \| `tenn_rules_evidence` \| `dcs_policies_procedures`. |
| `corpus_designation` | enum | `core_v1_candidate` (T36/T37/TRJPP) \| `evidence_guardrail_and_limited_answer_candidate` (TRE) \| `staged_dcs_candidate` (DCS). Per the Judge's Phase C expansion decisions. |
| `approval_status` | string | `pending_extraction_qa` on every chunk — extraction approval is a downstream human decision. |
| `production_display_status` | enum | `restricted_pending_license_review` on `annotation_candidate`, `case_note_candidate`, and `advisory_comment` chunks (LexisNexis editorial/commentary material must not be displayed in production answers until the license/display policy is resolved); `pending_extraction_qa` otherwise. |
| `canonical_citation` | string | `Tenn. Code Ann. § 36-1-113` / `Tenn. R. Juv. P. 307` / `Tenn. R. Evid. 403` / `DCS Policy 14.14`. Blank + warning when not reliably parseable. |
| `citation_aliases` | array | `T.C.A. § …`, `TRJPP …`, `TRE …`, `DCS …` variants. |
| `title` | string | Section/rule heading (including any `[Effective …]` version bracket verbatim) or DCS document title. |
| `chapter` / `part` | string | T.C.A. chapter/part from the Lexis hierarchy line; TRE article in `chapter`. |
| `section` | string | T.C.A. section number, or DCS body-section heading. |
| `subsection` | string | For sub-split note compilations: the numbered note heading (e.g. `22. Best Interests of Children.`). Statutory `(a)(1)`-level capture is deferred (see limitations). |
| `rule_number` | string | TRJPP/TRE rule number. |
| `policy_number` / `policy_chapter` | string | DCS policy number and chapter folder (`Ch14_CPS`). |
| `document_type` | string | DCS document type: `policy`, `protocol`, `guide`, `guidelines`, `manual`, `work_aid`, `tip_sheet`, `faq`, `handbook`, `n_a`, `rda`, … (from page-1 banner + filename token). Empty for statutes/rules. |
| `chunk_type` | enum | See below. |
| `page_start` / `page_end` | int \| null | 1-based page span in the source PDF. |
| `hierarchy_path` | array | Lexis breadcrumb or DCS path. |
| `text` | string | Chunk text, running headers/footers/heading-echoes stripped. |
| `text_sha256` | string | SHA-256 of `text` — duplicate detection + downstream integrity. |
| `extraction_warnings` | array | Chunk-level flags (`unusually_large_chunk:…`, `effective_dated_version_unit:[Effective …]`, `effective_dated_version_text:…`). |
| `answer_scope_note` | string | On every TRE chunk: TRE is answer authority only for evidentiary/procedural questions (admissibility, objections, offers of proof, expert proof, hearsay, judicial notice, related issues); otherwise guardrail/reference. Empty elsewhere. |

## `chunk_type` values

`black_letter_text` (statute/rule text proper — the only candidate answer text
for statutes/rules) · `history` · `advisory_comment` (Advisory Commission
Comments, COMMENTS TO OFFICIAL TEXT) · `annotation_candidate` (Compiler's
Notes, Cross-References, Law Reviews, Research References, Opinion Notes /
ATTORNEY GENERAL OPINIONS) · `case_note_candidate` (NOTES TO DECISIONS / Case
Notes / Decisions Under Prior Law, sub-split at numbered note headings) ·
`policy_text` / `protocol` / `guide` / `work_aid` / `manual` (DCS document
bodies by type) · `metadata` (DCS page-1 header block incl. effective/
supersedes/revision dates) · `unknown` (unmapped DCS types such as tip
sheets/FAQs/handbooks, preamble pages — conservatively never guessed).

## Statutory version variants (critical Phase D input)

Lexis publishes amended sections as paired sub-documents whose headings end
with `[Effective until July 1, 2026 …]` (current text) or `[Effective on
July 1, 2026 …]` (future text); newly enacted sections carry `[Effective
July 1, 2026]`. Every chunk of such a unit is flagged
`effective_dated_version_unit` and the bracket is preserved verbatim in
`title`. **Phase D must partition these versions; current and future text must
never be blended or double-retrieved.** 37 flagged units across 26 citations
in this run (11 confirmed current/future pairs; remainder future-effective new
sections).

## Known limitations (recorded, not hidden)

- Statutory subsection (`(a)(1)`) capture deferred; `subsection` is used for
  note sub-headings only.
- DCS guide/manual internals are heading-detected best-effort; large
  unstructured documents fall back to page-bounded chunks with warnings.
- One AES-encrypted DCS handbook not extracted (optional `cryptography`
  dependency not installed — authorization required).
