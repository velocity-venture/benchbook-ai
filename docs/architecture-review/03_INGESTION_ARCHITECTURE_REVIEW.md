# 03 — Ingestion Architecture Review (Phase 2)

**Date:** 2026-06-10

## A. What exists: two disconnected pipelines

### Pipeline 1 — the one the app actually uses (`scripts/prebuild-corpus.js`)

`legal-corpus/*` → regex tag-strip → **four monolithic strings** → `app/src/lib/legal-corpus-data.json` → bundled into the Cloudflare Workers build (`build:cloudflare` runs prebuild first) → dynamically imported at runtime (`chat/route.ts:445-465`) with a 5-minute in-memory cache.

| Question (review charter) | Finding |
|---|---|
| 1. How are sources converted? | HTML → regex tag-stripping + entity decode + whitespace collapse (`prebuild-corpus.js:22-35`). `.txt` read directly. **PDFs are skipped entirely** (README: "these need pre-extraction"). |
| 2. Original PDFs preserved? | **No PDFs exist in the repo at all.** The DCS "PDFs" referenced in `legal-corpus/README.md` are actually `.txt` extractions of unknown provenance. |
| 3. Derivative traceable to source page/section? | **No.** Tag-stripping discards all structure; output has no page numbers, no per-section records, no source offsets. |
| 4. Stable chunk IDs? | **No chunks at all** — four flat strings keyed `tcaTitle36/tcaTitle37/trjppRules/dcsText`. |
| 5. Legal hierarchy preserved? | **No.** Title/chapter/part/section/subsection collapse into running text. |
| 6. Statute subsections preserved? | Only as inline text; not addressable. |
| 7. Comments/history/annotations separated from black-letter text? | **No.** TNCODE annotations, history lines, and statute text are mashed together — one reason citation "verification" against this text is weak evidence. |
| 8. DCS metadata (policy no., chapter, effective/revision date, forms)? | Policy number survives in filename-derived headers (`=== DCS Policy: chap14-14.1.txt ===`); dates exist only as unstructured prose. |
| 9. Versioned rebuilds? | **No.** Single `buildDate` timestamp; no corpus version ID; nothing recorded per answer. |
| 10. Build fails on missing/stale/unapproved sources? | **Worse than missing: it silently succeeds.** `prebuild-corpus.js:82-87` *preserves the previous bundled text* when a source file is absent, logging only a console warning. This is the mechanism that let the 2021 corpus survive the deletion of its own sources. Hard failure exists only if `tcaTitle36`/`tcaTitle37` are absent from **both** sources and the previous JSON (`:129-131`). |
| 11. Source manifest? | **None.** |
| 12. Checksums? | **None anywhere** (also absent in Pipeline 2). |
| 13. Chunking optimized for legal retrieval? | No chunking; no retrieval (see 05). |
| 14. Does extraction lose headings/hierarchy/tables/footnotes/pages? | **Yes — all of them**, by design of regex tag-stripping. |

`scripts/validate-corpus.js` checks existence/size/keyword heuristics for `tca/title-37.html`, `tca/title-36.html`, `trjpp/all-rules.txt` — all three now deleted, so validation **fails today** — but it is not wired into any build, CI, or deploy path, so nothing notices.

### Pipeline 2 — the abandoned/disconnected vector pipeline

- `scripts/ingest_local.py`: three modes (`--prepare/--embed/--pinecone`). Real section-aware TCA HTML parsing (`TCAHTMLSectionParser`, lines 109–177: h2/h3 `id` attributes → section records like `37-1-101`), pdfplumber/PyPDF2 PDF extraction with tables, paragraph chunking (1,500 chars / 200 overlap), chunk records with `id` (SHA-256 of file+section+index), `section_id`, `title`, `page` data, `version_date`, **OpenAI text-embedding-3-large** → Pinecone.
- `scripts/search_server.py`: localhost:8765 cosine-similarity server over `chunks_embedded.json`, section-aware dedup.
- `benchbook-ai-infra/`: SST v3 — S3 bucket (versioned), `chunker_lambda.py` (S3 `raw/*.pdf` trigger → chunk → embed → Pinecone → manifest to `chunks/*.json`), LangSmith evaluation runner, health endpoint.

**The app consumes none of this.** It also contradicts the controlling architecture: OpenAI embeddings + Pinecone instead of pgvector/PostgreSQL, generic token chunking rather than legal-structure chunking, and no approval/manifest gate. Its section parser and page-tracking ideas are worth salvaging; the pipeline itself should be archived.

## B. Gap vs. controlling target architecture

Target: `source PDF → cleaned text → structured Markdown/HTML → JSONL authority chunks → PostgreSQL (relational + FTS + pgvector)`.

| Target principle | Status |
|---|---|
| 1. Preserve original PDFs | ❌ none in repo |
| 2. Hash/source/date/authority-type/version/approval per file | ❌ |
| 3. Citation-preserving structured text | ❌ |
| 4. Markdown/HTML intermediate | ❌ (raw HTML was the *input*, then deleted) |
| 5. JSONL chunk exchange format | ❌ (Pipeline 2 has JSON chunk files, wrong metadata model) |
| 6–7. Postgres relational authority tables | ❌ (no authority tables exist — see 04) |
| 8. pgvector for semantic only | ❌ (no vectors; Pinecone in dead pipeline) |
| 9. FTS/BM25 keyword search | ❌ |
| 10. Hybrid retrieval | ❌ (no retrieval) |
| 11. Chunk by legal structure | ❌ |
| 12. Never embeddings-alone | n/a (no embeddings live) |
| 13. Answers grounded in retrieved authority | ⚠ grounded in *prompt-stuffed* stale text |
| 14. Refuse when no authority found | ⚠ prompt-level instruction + post-hoc warnings only |

## C. Recommended ingestion architecture (repo-specific)

1. **`legal-corpus/source-of-record/`** (or an external read-only volume): original PDFs exactly as received from the Drive folder. Never edited. `SOURCE_MANIFEST.json` at the root: per file — `sha256`, `source` (Drive folder), `date_downloaded`, `authority_type`, `version_label` (e.g., "TCA 2026 ed."), `effective_range`, `approval_status` (`approved_by_judge` / `pending` / `rejected`), `approved_use` (`answer_corpus` / `guardrail_corpus` / `both` — needed for the TRE decision).
2. **Extraction stage** (Python, replacing prebuild-corpus.js's role): PDF → per-page text with page numbers retained → structured Markdown with explicit heading levels mirroring legal hierarchy. Keep `ingest_local.py`'s section-parser approach; add explicit separation of `black_letter_text` vs `advisory_comment` vs `history` vs `annotation` vs `case_note` chunk types (TNCODE-style annotations must not be quotable as statute).
3. **Chunking by legal structure**: one chunk per section/subsection/rule/policy-section, with `parent_id` + `hierarchy_path`; JSONL per the controlling shape (`id`, `authority_type`, `title/chapter/part/section/subsection`, `rule_number`, `policy_number`, `effective_date`, `revision_date`, `source_pdf`, `page_start/page_end`, `canonical_citation`, `citation_aliases`, `version_hash`, `chunk_type`, `text`).
4. **Loader** into Supabase Postgres (schema in doc 04): relational authority tables + `tsvector` columns + pgvector embeddings (embedding model choice is an implementation decision; embeddings are auxiliary per principle 8/12).
5. **Build gate**: a `validate-manifest` step that **hard-fails** (exit non-zero, wired into `package.json` build and future CI) when any manifest file is missing, hash-mismatched, unapproved, or when corpus version metadata is older than a configured staleness threshold. Remove the silent-preserve fallback behavior pattern entirely.
6. **Versioned rebuilds**: every load stamps a `corpus_build_id` (content hash of the manifest); every answer records it (doc 05/04).

**Classification:** `prebuild-corpus.js` — Adopt with revision only as a stopgap loader until Phase C, then Archive. `validate-corpus.js` — Adopt with revision (rewrite against manifest, wire into build). `ingest_local.py` section parser — Adopt with revision (port concepts). `ingest_local.py` embed/pinecone modes, `search_server.py`, `benchbook-ai-infra` — Archive. `legal-corpus-data.json` — Reject as production authority (retain temporarily as demo data only, clearly labeled).
