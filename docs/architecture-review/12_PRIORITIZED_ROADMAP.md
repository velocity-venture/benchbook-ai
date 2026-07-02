# 12 — Prioritized Roadmap

**Date:** 2026-06-10 · Sequencing locked per Judge's directive: corpus work (A–B) precedes all app work. Code-change authorization follows the standing model: review/manifest phases need no code approval; phases that modify application source require explicit go-ahead per phase.

---

## Phase A — Clean repository and source manifest
- **Objective:** A repo where every remaining file is either live architecture or explicitly archived history, plus the manifest scaffold.
- **Tasks:** Move stale-era docs to `docs/history/` (list in doc 11); archive dead deploy artifacts (`docker-compose.yml`, `makefile.txt`, `deploy_rag.sh`, `deploy_infra.sh`); move excluded-title stubs out of `legal-corpus/`; commit `audits/`; commit (or have author commit) the four pending guarded files; create `legal-corpus/source-of-record/` + empty `SOURCE_MANIFEST.json` schema; fix `route.ts` default model IDs and document required env vars in DEPLOY.md; add GitHub Actions running `npm run test`.
- **Files likely affected:** root docs, `legal-corpus/tca/*.md`, `.github/workflows/test.yml`, `DEPLOY.md`, `route.ts:93-94` (two-line constant fix), `SOURCE_MANIFEST.json`.
- **Acceptance criteria:** `git status` clean; CI green on push; manifest schema reviewed by Judge; no file in `legal-corpus/` that is not intended corpus input.
- **Tests required:** existing suite green in CI; a unit test asserting model-ID constants match a documented allowlist.
- **Risks:** archiving something another agent still references (mitigate: move, don't delete); model-ID fix changes prod behavior if env vars were masking it (verify env first).
- **Code changes allowed?** Docs/CI/file moves: yes. The model-ID fix touches app source — **requires operator approval** (small, isolated; recommend approving with Phase A).

## Phase B — Corpus authority audit and source-of-record preservation
- **Objective:** Every approved authority present locally as an original PDF, hashed, versioned, approval-tagged; staleness impossible to hide.
- **Status update 2026-06-10:** the Drive folder **is already downloaded** to the repo root as `Benchbook.ai Database Files/` (untracked; first-look hashes in `APPENDIX_A_SOURCE_FILE_HASHES_20260610.txt`). It must not be moved, modified, or committed until the manifest and storage decision exist.
- **Tasks:** re-hash the folder and verify against Appendix A; design and populate `SOURCE_MANIFEST.json` (hash, source, date_downloaded, authority_type, version_label, effective range, approval_status — **pending unless expressly approved** — approved_use); classify every file (statute / rule / DCS policy / metadata / unknown / excluded); verify Title 36/37 edition year and TRJPP/TRE amendment dates against the PDFs; record the Judge's TRE designation (answer corpus / guardrail corpus / both); reconcile the Drive DCS tree against `~/Downloads/TN-DCS-Policies-Procedures-Obligations-STAGING/` and capture the Judge-approved policy list; compare repo `trjpp/*.txt` and `dcs/*.txt` against PDFs to decide reuse vs. regeneration; recommend (not execute) the permanent storage structure for source-of-record files (gitignored path + committed manifest, git-lfs, or external volume); review Lexis license constraints; document lineage findings for the 2021 corpus (closure memo). **No text extraction or ingestion in this phase.**
- **Files likely affected:** `legal-corpus/source-of-record/**`, `SOURCE_MANIFEST.json`, `legal-corpus/README.md` rewrite, closure memo in `docs/`.
- **Acceptance criteria:** manifest lists 100% of approved authorities with `approved_by_judge` status; every PDF hash recorded; currentness statement per authority signed off by Judge; **blocker from doc 02 formally cleared or scoped**.
- **Tests required:** manifest validation script (hashes match files; required authorities present; no unapproved files in source-of-record).
- **Risks:** Drive folder PDFs themselves stale (verify edition dates before accepting); DCS set mismatch between Downloads and Drive (treat Drive as canonical per Judge instruction); large PDFs in git (consider git-lfs or external storage with manifest-only in repo).
- **Code changes allowed?** No app code. Scripts for hashing/validation: yes.

## Phase C — Ingestion pipeline rebuild
- **Objective:** Deterministic PDF → Markdown → JSONL pipeline preserving citation, hierarchy, pages, and chunk types.
- **Tasks:** Build extractor (pdfplumber-class tooling; port `ingest_local.py` section-parser ideas); structured Markdown intermediate per authority; JSONL chunks per the controlling shape (stable IDs like `tca_37_1_129_a_<ver>`; `chunk_type` separation of black-letter vs comments/history/annotations; DCS policy metadata fields); build gate that hard-fails on manifest mismatch/missing/unapproved/stale; versioned outputs keyed by `corpus_build_id`; remove `prebuild-corpus.js` silent-preserve fallback.
- **Files likely affected:** new `pipeline/` (or `scripts/ingest/`), `legal-corpus/_build/**` (gitignored), `scripts/validate-corpus.js` rewrite, `package.json` build scripts.
- **Acceptance criteria:** rebuild from PDFs alone reproduces byte-identical JSONL (same manifest ⇒ same `version_hash`es); spot-check by Judge: 10 sections/rules/policies traced JSONL→page; zero excluded-title content; black-letter vs annotation separation verified on TNCODE-style content.
- **Tests required:** invariant tests (doc 08 §B.4): per-authority chunk counts, hierarchy integrity (every chunk has valid `parent_id`/`hierarchy_path`), citation round-trip (canonical_citation parses back to the same chunk), staleness threshold.
- **Risks:** PDF extraction quality (scanned pages, tables in DCS policies — fall back to manual correction files tracked in manifest); subsection segmentation errors in dense statutes (mitigate with golden spot-checks).
- **Code changes allowed?** New pipeline code: yes (does not touch the running app). Removing the prebuild fallback touches build path — flag at PR.

## Phase D — Database schema for legal authorities and chunks
- **Objective:** PostgreSQL as the legal database: relational authority tables + FTS + pgvector + audit tables (schema in doc 04 §D).
- **Tasks:** migrations for `source_files`, `authorities`, `authority_versions`, `chunks` (tsvector GIN + pgvector), `citation_aliases`, `corpus_builds`, `retrieval_logs`, `answer_verifications`, `refusal_events`; `corpus_build_id` on `chat_messages`; loader from Phase C JSONL; RLS (corpus read for authenticated; audit service-role); Judge decision recorded on case-management tables (future vs archive).
- **Files likely affected:** `supabase/migrations/2026MMDD_*.sql` (new), loader script, `DEPLOY.md`.
- **Acceptance criteria:** full corpus loads idempotently; exact-citation SQL lookup returns correct chunk for 20 sample citations incl. subsections; FTS returns the controlling section for 10 sample phrases; build version queryable.
- **Tests required:** migration up/down safety; loader idempotency; RLS tests on new tables; lookup correctness fixtures.
- **Risks:** Supabase pgvector dimension/index choices (settle embedding model first or defer vector column fill); migration ordering against the 7 existing files.
- **Code changes allowed?** Migrations + loader: yes, with migration review before apply (persistent-state change — **operator approval per standing model**).

## Phase E — Hybrid retrieval and citation lookup
- **Objective:** Replace context-stuffing with retrieval; fix the context-overflow defect properly.
- **Tasks:** citation parser → exact lookup; FTS path; pgvector path with metadata filters; authority-aware rerank; span packaging under token budget; retrieval logging; rewrite `loadRelevantCorpus()`; recalibrate `query-router.ts`; keep SSE/trust-event contract.
- **Files likely affected:** `app/src/app/api/chat/route.ts`, new `app/src/lib/retrieval/*`, `query-router.ts`, tests.
- **Acceptance criteria:** every doc-08 retrieval scenario passes (exact citation, conceptual, per-authority); prompt token count bounded and asserted; the doc 05 §B.8 failure cases (untriggered Title 36 / DCS queries) return correct authority; live smoke streams a cited answer end-to-end.
- **Tests required:** retrieval goldens; token-budget unit tests; regression on existing route tests; smoke tier.
- **Risks:** edge-runtime DB latency (measure; consider region pinning); rerank tuning; prompt-cache hit-rate drop (expected and acceptable — spans are small).
- **Code changes allowed?** Yes — core app change; **explicit go-ahead required before starting**.

## Phase F — Citation and proposition-support validation
- **Objective:** Verification means support, not existence (design in doc 06 §E).
- **Tasks:** DB-backed citation resolution (subsections, ranges, aliases, TRE per designation); proposition decomposition + entailment check against retrieved spans; quoted-text verbatim check; persist `answer_verifications`; distinguish fabricated vs unsupported in UI/events; regenerate-once-then-refuse policy; write `trust_metadata` or supersede it.
- **Files likely affected:** `citation-validator.ts`, `hallucination-guard.ts`, `corpus-coverage.ts`, route, migrations (if columns missing), UI event consumers.
- **Acceptance criteria:** fabricated-citation goldens blocked; real-citation/unsupported-proposition goldens flagged or refused; verification rows persisted with `corpus_build_id` for 100% of answers.
- **Tests required:** doc 06 §D gap list as cases; support-verifier goldens; persistence assertions.
- **Risks:** entailment-check latency/cost (run on material propositions only; Haiku-class model); false positives blocking good answers (tune with regenerate-once).
- **Code changes allowed?** Yes — **explicit go-ahead required**.

## Phase G — Judicial guardrails and refusal behavior
- **Objective:** Deterministic refusal of credibility, case-specific ruling, fact-investigation, and extra-record requests; role-bounded prompt (plan in doc 07 §D).
- **Tasks:** new scope classes (query + history + response side); SYSTEM_PROMPT rewrite (drop "most common practice first"; add judicial-role boundary); per-class refusal templates; `refusal_events` logging; corpus-version banner hook.
- **Files likely affected:** `scope-guard.ts`, `route.ts` prompt + guard call sites, refusal templates module, tests.
- **Acceptance criteria:** doc 08 refusal goldens pass; injection suite passes; every refusal logged with class + matched terms.
- **Tests required:** refusal goldens per class; history-injection vectors; memory-honeypots.
- **Risks:** over-blocking legitimate bench questions (e.g., "what factors govern credibility determinations under TRE 608" is a *legal* question — classifier must distinguish law-about-credibility from credibility-assessment; include such cases in goldens).
- **Code changes allowed?** Yes — **explicit go-ahead required**; prompt changes reviewed by Judge verbatim.

## Phase H — QA harness and golden questions
- **Objective:** Judicial-grade evaluation gate (design in doc 08 §B).
- **Tasks:** Judge-authored golden set (60–100) with expected spans; refusal + adversarial packs; corpus invariant tier; live smoke tier; CI wiring (unit+invariant per PR; golden+smoke pre-deploy); coverage thresholds.
- **Files likely affected:** `qa/golden/*.jsonl`, `qa/run.ts`, `.github/workflows/*`, vitest config.
- **Acceptance criteria:** ≥95% golden pass with zero fabricated-citation escapes and zero guardrail escapes; harness re-runs automatically on corpus rebuild.
- **Tests required:** the harness *is* the tests; meta-test that goldens pin `corpus_build_id`.
- **Risks:** golden authoring time (Judge bandwidth — draft candidates for Judge to edit/approve); flaky live tier (quarantine to pre-deploy only).
- **Code changes allowed?** Harness code yes; no app changes expected.

## Phase I — UI trust-state and source display
- **Objective:** UI tells the truth about the corpus and shows sources at span level (doc 09 §E).
- **Tasks:** corpus-version banner; citation click-through to source span/page; fix trust-event ordering + remove/label unverified client fallback; copy fixes (MOBILE.md, "recent amendments", README pricing); "what BenchBook will not do" panel; then UI-AUDIT cosmetic fixes.
- **Files likely affected:** `chat/page.tsx`, browser pages, `page.tsx` landing, `MOBILE.md`, `README.md`.
- **Acceptance criteria:** a screenshot of any answer shows: build version, per-citation verification state, click-through to source; no copy claim exceeds manifest reality.
- **Tests required:** component tests for trust states; e2e snapshot of event ordering.
- **Risks:** low.
- **Code changes allowed?** Yes — **go-ahead required** (UI-only).

## Phase J — Internal judicial testing only
- **Objective:** Judge Eckel uses the system on real research questions (not real sealed case data) and signs off or files defects.
- **Tasks:** verify doc 10 "before internal testing" gate items; structured test script from golden categories; defect log; weekly review; explicit exit criteria for considering external users (separate decision, separate security gate).
- **Files likely affected:** `docs/testing/INTERNAL_TEST_PROTOCOL.md`, defect log.
- **Acceptance criteria:** N sessions (suggest ≥20) with zero fabricated citations, zero guardrail escapes, refusals judged appropriate; Judge sign-off memo.
- **Tests required:** none new; harness re-run at start and end.
- **Risks:** confidential queries during testing (protocol: no party names/sealed facts; queries are retained — S7).
- **Code changes allowed?** Defect fixes only, each via normal approval.
