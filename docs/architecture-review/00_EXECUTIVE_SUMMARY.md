# BenchBook.AI Architecture Review — Executive Summary

**Date:** 2026-06-10
**Reviewer:** Claude Fable 5 (Claude Code), acting as senior system architect / legal RAG designer / QA partner
**Branch reviewed:** `refactor/codex-gpt55-launch-prep` (HEAD `e3bc1bb`)
**Scope:** Read-only review. No application source files were modified. Pre-existing uncommitted changes to `citation-validator.ts`, `scope-guard.ts`, and their tests were inspected but not touched.
**Directive confirmed by Judge Eckel 2026-06-10:** the active 2021 corpus is disqualified for production answers; corpus rebuild is priority one.

---

## 1. Gate Decision

**NO-GO for any judicial reliance, external users, or production marketing in its current state.**

BenchBook.AI has a genuinely strong trust *shell* — server-side scope guard, post-generation citation verification, confidence badges, honest UI copy, strict RLS — wrapped around a corpus and retrieval core that fails the closed-universe requirement at every layer:

- The legal text it answers from is a **May 2021 snapshot of the Tennessee Code** (TNCODE Release 76 via Public.Resource.Org), five legislative sessions out of date.
- The corpus is **untraceable**: the HTML sources it was built from were deleted from the repo, and `scripts/prebuild-corpus.js:82-87` silently reuses the old bundled JSON when sources are missing — a built-in staleness machine.
- There is **no retrieval**. The entire multi-megabyte corpus is concatenated into the prompt. Title 37 alone (~1.56M chars ≈ ~390K tokens) exceeds the 200K context window of both configured models, so corpus-backed requests almost certainly fail at the Anthropic API. Separately, the route's default model IDs (`claude-haiku-4-5-20250414`, `claude-sonnet-4-5-20250414`) do not exist; production depends on undocumented env overrides.
- The approved **source-of-record PDFs are now locally accessible** (downloaded mid-review to the untracked repo-root folder `Benchbook.ai Database Files/`), but they are **not yet hashed into a controlled manifest, not approval-classified, and not connected to anything** — and the Tennessee Rules of Evidence still appear nowhere in the *running system*. The PDFs must go under a source-of-record manifest before any ingestion.

Permitted in the interim: internal demonstration by Judge Eckel only, with the corpus-date caveat stated aloud, and only if a live smoke test shows the chat path works at all (see Blocker #3).

## 2. Top Five Blockers

1. **Stale corpus (CRITICAL, confirmed).** `app/src/lib/legal-corpus-data.json` (built 2026-04-18) carries Titles 36/37 from TNCODE Release 76, released 2021-05-21. It still describes the Zero to Three Court Initiative as "[Effective until January 1, 2025]" in the future tense. Every Title 36/37 answer is grounded in 2021 law. *Disqualified per Judge's directive.*
2. **Untraceable, unrebuildable corpus.** `legal-corpus/tca/title-36.html`, `title-37.html`, and `trjpp/all-rules.txt` — the REQUIRED_FILES of `scripts/validate-corpus.js:13-17` — are deleted. The build cannot be reproduced, verified, or refreshed; `prebuild-corpus.js` masks this by silently preserving the stale JSON.
3. **Context-window overflow / broken chat path.** `loadRelevantCorpus()` (`app/src/app/api/chat/route.ts:379-417`) always injects all of Title 37 + TRJPP (~400K+ tokens) with no truncation, token counting, or 1M-context beta. Requests should be rejected by the API as too long. This must be smoke-tested; either the app is silently failing in production or something undocumented is propping it up.
4. **~~Source-of-record PDFs not locally accessible~~ — RESOLVED mid-review (2026-06-10 21:12).** The approved Drive folder was downloaded to the repo root as `Benchbook.ai Database Files/` while this review was in progress: Title 36 (6 PDFs), Title 37 (6 PDFs), `Tenn. R. Juv. P. Rules.pdf`, `Tenn. R. Evid..pdf`, and a DCS policy tree (675 PDFs total). Spot-verification of `Title 37/37_1_101_37_1_201.pdf` confirms these are **current LexisNexis exports** (created 2026-06-08; amendment histories through 2025 ch. 322/398; "[Effective until July 1, 2026]" forward-versioning). Provisional SHA-256s captured in `APPENDIX_A_SOURCE_FILE_HASHES_20260610.txt`. Residual blocker: the corpus *built from* these PDFs does not exist yet (Phases B–D), TRE's production designation is undecided, and the Lexis-annotated content carries license terms to review before any annotation text is displayed to end users. Note the TRE remains absent from the *running system*.
5. **Citation validation is existence-only; no proposition support.** `citation-validator.ts` confirms a cited section number appears somewhere in the corpus text; it cannot confirm the cited text supports the stated proposition, cannot resolve subsections (it strips `(a)(2)`), ranges, or aliases, and never blocks — a fabricated-but-existing citation passes as HIGH confidence.

## 3. Top Five Components Worth Adopting

1. **The trust pipeline pattern** — scope guard (pre-generation, server-side) → hallucination guard → per-citation verification → confidence events → UI badges/warnings (`scope-guard.ts`, `hallucination-guard.ts`, `citation-validator.ts`, `chat/page.tsx:800-898`). The *architecture* is right; only its evidence base (flat-string regex index) must be replaced with a real authority database. **Adopt with revision.**
2. **The test suite** — 14 Vitest files, ~2,400 lines, covering auth, rate limits, streaming failure, corpus-load errors, citation verification, scope refusal, RLS isolation. All 10 priorities from the April 2026 coverage audit are now covered. **Adopt** (extend with golden questions).
3. **Supabase security posture** — strict per-user RLS on every user-scoped table, dual-layer rate limiting (in-memory + `check_rate_limit` RPC), no service-role key client-side, clean secrets hygiene, sanitized error paths. **Adopt.**
4. **Frontend trust UI and honest product copy** — confidence badges, "(unverified)" labels, verification-pending notice, "AI can make mistakes" banner, Terms/Privacy disclaimers. One overpromise to fix (MOBILE.md "all DCS policies"). **Adopt with revision.**
5. **The DCS STAGING PDF set + the section-aware parsing concepts** — `~/Downloads/TN-DCS-Policies-Procedures-Obligations-STAGING/` (661 PDFs, PowerDMS IDs, source index) is the best source-of-record candidate pending Judge approval; `scripts/ingest_local.py`'s TCA HTML section parser shows the right chunking instincts even though its OpenAI/Pinecone pipeline should be archived. **Adopt with revision / Needs further review.**

## 4. Shortest Safe Path Forward

1. **Phase A+B first (no code):** ~~Judge downloads the Google Drive folder~~ Done mid-review — `Benchbook.ai Database Files/` is at the repo root. Build `SOURCE_MANIFEST.json` from it (provisional hashes already in Appendix A), verify currency evidence per authority, preserve originals read-only, decide whether the folder stays in-repo (git-lfs) or moves outside with manifest-only tracking. Record TRE approval decision (answer corpus vs. guardrail corpus vs. both) and review Lexis license terms for annotation display.
2. **Phase C+D:** rebuild ingestion as PDF → structured Markdown → JSONL authority chunks (chunked by legal structure, stable IDs, hierarchy, page spans) → PostgreSQL authority tables + FTS + pgvector. The Supabase instance is already there; the schema in `04_DATABASE_SCHEMA_REVIEW.md` slots beside the existing chat tables.
3. **Phase E:** replace `loadRelevantCorpus()` context-stuffing with hybrid retrieval (exact citation lookup → FTS → vector → authority-aware rerank), packaging only retrieved spans into the prompt. This simultaneously fixes the context overflow.
4. **Phase F+G:** extend the existing verifier to proposition-support checking against retrieved spans; add refusal-on-no-support; keep the existing scope guard and extend it to credibility/ruling-recommendation/fact-investigation refusals.
5. **Phase H:** golden-question QA harness with expected source spans before any internal judicial testing (Phase J).

## 5. What NOT To Do Next

- **Do not deploy, demo externally, or market** until the corpus is current and traceable — especially do not let the mobile listing claim "complete TRJPP rules and all DCS policies" (`MOBILE.md:149-158`) while the corpus holds a 26-file DCS subset and a 2021 code.
- **Do not build more app features on the flat-string corpus** (statute browser enhancements, voice input, research patterns UI). Every hour spent there is rework after the corpus rebuild.
- **Do not "fix" the context overflow by trimming the corpus harder or switching to a 1M-context call.** That entrenches context-stuffing; the fix is retrieval.
- **Do not wire up the dormant case-management tables** (`cases`, `hearings`, `documents`…) — out of V1 closed-universe scope; decide launch/future/archive in Phase D.
- **Do not upgrade Next.js 14→16 or do bulk dependency bumps pre-launch**; targeted Supabase/SDK patches only.
- **Do not touch the pre-existing uncommitted work** (`citation-validator.ts`, `scope-guard.ts` + tests). It is sound, improves excluded-title handling, and should be committed by its author or with the Judge's approval.

---

*Full findings: documents 01–13 in this directory. Component-by-component dispositions: `11_COMPONENT_CLASSIFICATION_TABLE.md`. Next-step prompt: `13_NEXT_ACTION_PROMPT_FOR_IMPLEMENTATION.md`.*
