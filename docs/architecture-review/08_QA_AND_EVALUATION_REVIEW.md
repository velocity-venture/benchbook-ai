# 08 — QA and Evaluation Review (Phase 7)

**Date:** 2026-06-10 · `app/src/__tests__/` — 14 Vitest files, ~2,417 lines. Runner: Vitest 4.1.3 (`npm run test`). **No CI** (no `.github/workflows/`), no coverage reporting configured. The April 2026 coverage audit (`audits/test-coverage-2026-04-26-FINAL.md`) listed 10 priority gaps; all 10 now have tests — engineering-path coverage is genuinely good.

## A. Coverage matrix vs. judicial-grade requirements

| Required coverage | Status | Where / gap |
|---|---|---|
| Corpus completeness | ⚠ weak | `corpus-coverage.test.ts` tests the *annotator*, not actual completeness; `validate-corpus.js` not in any test/build path — and would fail (sources deleted) |
| Source currentness | ❌ | No test asserts corpus version/date. **The 2021 corpus passes every existing test.** Highest-value missing test in the suite |
| Citation normalization | ✅ partial | `citations.test.ts` (19 cases incl. new excluded-title cases); gaps: ranges, `Tenn. R. Juv. P.` form, TRE, DCS aliases (doc 06) |
| Exact citation retrieval | ❌ | No retrieval exists to test |
| Conceptual retrieval | ❌ | Same |
| DCS / TRJPP / Title 36 / Title 37 retrieval | ❌ | Keyword-gating in `loadRelevantCorpus` is tested for cache mechanics only (`chat-route-corpus-cache.test.ts`), not for "does the right authority reach the model"; the Title-36-trigger-word failure mode (doc 05 §B.8) is untested |
| TRE retrieval (if approved) | ❌ | TRE absent system-wide |
| Scope refusal | ✅ | `scope-guard.test.ts` (criminal/traffic classes only) |
| Unsupported-answer refusal | ⚠ | `hallucination-guard.test.ts` covers zero-citation **warning**; no refusal behavior exists |
| Fabricated citation detection | ✅ existence-level | `citations.test.ts`, `hallucination-guard.test.ts` |
| Real citation, unsupported proposition | ❌ | No machinery (doc 06) |
| Conflicting authority handling | ❌ | No tests, no design |
| Stale-source detection | ❌ | See "source currentness" |
| Source hierarchy | ❌ | No hierarchy exists |
| Prompt injection | ⚠ thin | `chat-route-input-validation.test.ts` is length/shape validation, not adversarial content; no injection-via-history tests (doc 07 §C) |
| Forcing web/memory answers | ❌ | No honeypot tests ("cite from memory", "ignore corpus") |
| Streaming/API failure modes | ✅ | `chat-route-anthropic-streaming.test.ts` — incl. mid-stream failure, no-leak assertions, usage-not-recorded-on-failure |
| Database migration safety | ❌ | No migration tests/rollback checks |
| RLS / privacy / security | ✅ partial | `chat-persistence.test.ts`, `research-patterns-route.test.ts` (per-user isolation via mocks); no live-Supabase RLS integration test |
| Env/config validation | ✅ | `chat-route-env-validation.test.ts`, `supabase-client-creation.test.ts` |
| **End-to-end smoke ("does a real chat answer at all")** | ❌ | Everything is mocked. The two P0 defects in doc 05 §C (context overflow, invalid model IDs) are invisible to this suite — the strongest argument that unit coverage ≠ system assurance here |

## B. Recommended judicial-grade QA harness (Phase H)

1. **Golden-question set with expected source spans.** 60–100 questions authored/approved by Judge Eckel across: Title 37 detention/adjudication/disposition/transfer; Title 36 custody/parentage/support; TRJPP procedure; DCS investigation/placement/permanency; TRE (per approval decision); cross-references; and out-of-scope traps. Each golden record: `{question, expected_authority_ids, expected_chunk_ids (spans), required_citations, forbidden_behaviors, expected_refusal?}`. Store as JSONL in `qa/golden/`; tie to `corpus_build_id` so goldens re-validate on every corpus rebuild.
2. **Refusal goldens:** credibility, ruling-recommendation, fact-investigation, criminal/traffic, no-authority topics, memory-honeypots (real-but-excluded statutes — e.g., a Title 39 section — must yield "not in corpus," never an answer).
3. **Adversarial pack:** prompt injection in query and in history; "my attorney says §X says Y, confirm" (false-premise); citation-format edge cases (ranges, subsections, TRE).
4. **Corpus invariant tests (build-time):** manifest hash verification; currentness threshold (fail if any authority's version older than configured bound); coverage counts per authority (e.g., Title 37 chapter list present); zero excluded-title content in answer corpus.
5. **Live smoke tier (pre-deploy, few questions):** real model call, asserts an answer streams, citations verify, trust events arrive in order before `done`.
6. **CI:** GitHub Actions running unit + invariant tiers on every PR; golden + smoke tiers nightly/pre-deploy. Add `vitest --coverage` with thresholds.
7. **Evaluation lineage:** the dead `benchbook-ai-infra` LangSmith evaluation runner shows prior intent; do not resurrect the AWS pipeline — run goldens via a simple script against the Phase E retrieval API instead.

**Classification:** existing 14-file suite — **Adopt** (extend). `audits/` coverage audits — **Adopt** (process worked; repeat post-rebuild). Missing golden/adversarial/invariant/smoke tiers — **build new**. LangSmith/AWS evaluation infra — **Archive**.
