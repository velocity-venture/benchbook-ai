# 05 — Retrieval and RAG Review (Phase 4)

**Date:** 2026-06-10 · Primary file: `app/src/app/api/chat/route.ts` (649 lines, edge runtime)

## A. Actual request flow

auth (`supabase.auth.getUser`) → rate limit (in-memory map + `check_rate_limit` RPC; 20/min) → input validation (query ≤2000 chars; ≤20 history messages ≤4000 chars) → **scope guard** (`detectOutOfScopeQuery`, pre-generation, server-side) → **corpus load** (`loadRelevantCorpus`, 5-min cached dynamic import of `legal-corpus-data.json`; 503 if unusable) → model routing (`query-router.ts`: Haiku vs Sonnet by keyword/length heuristics) → `streamClaude()` (system prompt + corpus block, `max_tokens: 4000`, `temperature: 0.3`, prompt caching via `cache_control: ephemeral`) → SSE streaming → post-hoc `runHallucinationGuard` → `sources`/`confidence`/`coverage`/`done` events → `research_queries` insert.

## B. Findings against the review questions

1. **Retrieves from approved corpus only?** There is **no retrieval**. `loadRelevantCorpus()` (route.ts:379-417) concatenates flat strings: Title 37 **always**, TRJPP **always**, Title 36 if the query contains `custody|parent|guardian|domestic`, DCS text if it contains one of 14 keywords. The "retrieval unit" is an entire title.
2. **Direct context loading** only. No keyword search, no FTS, no vectors, no citation lookup.
3. **Deterministic citation lookup?** No. (The citation *index* exists but is used only post-generation for verification, not for retrieval.)
4. **Full-text search?** No. 5. **Semantic search?** No (Pinecone pipeline disconnected; see doc 03).
6. **Authority hierarchy respected?** No — hierarchy was destroyed at ingestion.
7. **Statute text vs comments/annotations distinguished?** No — TNCODE annotations are inline in the same strings.
8. **Top-k misses controlling authority?** Inverted failure mode: the keyword gate can drop entire authorities. Example: a pure Title 36 alimony query phrased without the four trigger words ("spousal support after a divorce decree") **never receives Title 36 text**; a DCS question phrased as "permanency plan requirements" misses every DCS keyword and gets no DCS text. The model then either refuses or answers from the always-included (wrong) titles.
9. **Current/stale/duplicate sources?** Exclusively stale (2021) — see doc 02.
10. **Can generation cite text not retrieved?** Yes at generation time; the post-hoc guard then flags citations absent from the corpus text, but a citation *present in the 2021 corpus and repealed since* verifies cleanly. Verification strength is capped by corpus currency.
11. **Can the model answer from memory?** Yes — prevention is prompt-text only ("Only cite legal provisions whose text appears in the corpus above…"). Post-hoc verification catches fabricated section numbers, not memorized-but-real ones used without corpus support, and not unsupported propositions attached to real citations.
12. **Unsupported authorities?** Case law: detected, always `verified:false`, warned with Westlaw/Lexis referral — good. Statutes: existence-check only.
13. **Refusal when no support?** Prompt instructs "state the topic is not in your available corpus"; `hallucination-guard.ts` adds a warning when an answer has zero citations. There is **no hard refusal** — the un-cited answer is still delivered.
14. **Retrieval logs adequate for audit?** No. `research_queries` stores query + cited sources (200-char snippets). No retrieved spans (nothing is retrieved), no corpus version, no model params. Refusals are not logged at all.
15. **Answer traceable to corpus version + spans?** No. No corpus version exists; `chat_messages.trust_metadata` is never written server-side.

## C. The two defects that make the current path non-viable

**C.1 Context overflow (verify with smoke test, then treat as P0).** `tcaTitle37` is 1,558,718 chars (~390K tokens at ~4 chars/token); with TRJPP it is *always* in the system blocks. Both configured models accept 200K tokens. There is no truncation, no token counting, and no extended-context beta header (verified by inspection of `streamClaude`, route.ts:520-545). Expected behavior: the Anthropic API rejects the request, the catch at route.ts:606-611 emits a generic SSE `error`, and the user sees "Failed to generate response." A production smoke test must confirm whether *any* corpus-backed answer currently succeeds.

**C.2 Invalid default model IDs.** `HAIKU_MODEL`/`SONNET_MODEL` default to `claude-haiku-4-5-20250414` / `claude-sonnet-4-5-20250414` (route.ts:93-94) — neither is a real Anthropic model ID (real: `claude-haiku-4-5-20251001`, `claude-sonnet-4-5-20250929`). Unless `CLAUDE_HAIKU_MODEL`/`CLAUDE_SONNET_MODEL` are set in Cloudflare, every call 404s regardless of C.1. Check the deployment env first when smoke-testing.

## D. What is worth keeping

- The **post-generation verification + SSE trust-event pattern** (sources → confidence → coverage → done) and its UI consumers.
- **Prompt caching discipline** (will matter again once retrieved spans are packaged).
- **Scope guard placement** (server-side, pre-generation, cannot be bypassed by client).
- Sanitized error handling and the corpus-unavailable 503 path (commit `e3bc1bb`), including its tests.
- Model routing concept (cheap model for simple lookups) — revisit thresholds after retrieval exists.

## E. Recommended hybrid retrieval architecture (target for Phase E)

1. **Citation parser + exact lookup first:** normalize the query's citations via `citation_aliases`; on hit, fetch the chunk(s) plus parents/siblings deterministically. A judge typing "37-1-114(b)" must never depend on embeddings.
2. **PostgreSQL FTS** (`tsv` GIN, `websearch_to_tsquery`, BM25-style ranking) over `black_letter_text` and `policy_procedure` chunks for statutory/rule phrasing.
3. **pgvector** similarity for conceptual recall, restricted by metadata filters (authority_type, currentness, approved_use) — never the sole path.
4. **Authority-aware reranking:** black-letter statute/rule > DCS policy > advisory comment > annotation; current version only; dedupe by authority.
5. **Mandatory source-span packaging:** the prompt contains only retrieved chunks, each tagged with `id` + `canonical_citation` + page span; total budgeted under a token ceiling with overflow handled by rank, not truncation mid-chunk.
6. **Generation constrained to spans:** instruct citation-per-proposition against provided chunk IDs.
7. **Post-generation verification** upgraded to proposition support (doc 06).
8. **Refusal when support is absent:** if retrieval returns nothing above threshold, return the refusal template *instead of* calling the model speculatively; log to `refusal_events`.
9. **Log everything:** `retrieval_logs` row per request with strategy, chunk IDs, scores, `corpus_build_id`; write `answer_verifications` and `chat_messages.corpus_build_id`.

**Classification:** chat route plumbing (auth/rate-limit/validation/SSE/error paths) — **Adopt**. `loadRelevantCorpus()` keyword gating — **Reject** (replace with retrieval). `query-router.ts` — **Adopt with revision**. Corpus-stuffing context construction — **Reject**. Trust-event emission — **Adopt with revision** (persist results; fix done-event ordering noted in CODEX-ASSESSMENT).
