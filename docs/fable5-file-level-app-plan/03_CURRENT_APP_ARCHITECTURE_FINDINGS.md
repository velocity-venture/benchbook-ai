# 03 - Current App Architecture Findings (F5-03)

Date: 2026-07-02

Findings that shape the file-level plan. The full lifecycle audit is F5-02 doc 02; this document records the M1-relevant conclusions.

## 1. Patterns worth copying verbatim into M1

| Pattern | Where it lives | M1 use |
|---|---|---|
| Fail-fast env validation throwing named-variable errors | `lib/supabase/env.ts` | `lib/qa-research/environment.ts` follows the same shape for target pin, model IDs, and QA-mode flag |
| Auth-then-rate-limit-then-validate route preamble | `api/chat/route.ts` steps 1-3 | Reused structurally in the new route; rate limiter stays fail-closed |
| Pre-generation refusal streamed as SSE without a model call | `streamScopeRefusal()` in the chat route | Generalized into the refusal envelope for all doc 05 variants |
| SSE event vocabulary (`delta`, `sources`, `confidence`, `coverage`, `done`, `error`) | chat route and chat page | Kept, extended with `citations`, `refusal`, `environment` events |
| Route testing via vi.mock plus dynamic import | all `chat-route-*.test.ts` files | The M1 test files use the identical harness shape |
| Trust-metadata persistence with messages | chat page plus `20260501_chat_trust_metadata.sql` | QA page persists the richer envelope the same way |

## 2. Findings that dictate M1 boundaries

1. **The legacy route is load-bearing and must not be touched.** Every M1 file is new except two low-risk touch points (sidebar nav entry, package.json script). This keeps rollback trivial: delete the new directory, revert two one-line edits.
2. **No dependency injection exists in the chat route** (module-scope Anthropic client, corpus cache, env reads). M1 must not inherit this: the new route receives its adapter, model client, audit logger, and clock through a factory selected by environment, so the mock backend is a first-class binding rather than a test hack.
3. **The Anthropic SDK is already mock-friendly in tests** (vi.mock of the module). M1 adds an interface layer anyway (`model-client.ts`) because the scripted-misbehavior profiles of the F5-02 harness (fabricated citations, ruling-shaped text) need deterministic control the raw SDK mock makes awkward.
4. **`legal-corpus-data.json` imports are the fallback hazard.** The no-general-fallback proof (test plan `no_general_fallback_tests.json`) includes a static test asserting the entire `lib/qa-research/` module graph and the new route import neither the flat-JSON corpus nor the three `*-data.ts` libs.
5. **Edge runtime constraints apply** (`runtime='edge'`): no Node-only imports in any new module; fixtures load via static JSON import; the audit logger interface must not assume Node streams. Existing SDK pin (`@anthropic-ai/sdk@^0.31.0` in app package.json on this branch) stays untouched in M1; the model-client interface isolates it.
6. **Vitest runs with defaults**; new tests are picked up by glob without config changes, so `package.json` modification is optional convenience only.

## 3. Defect ledger disposition in M1 (from F5-02 doc 02 section 4)

| Defect | M1 handling |
|---|---|
| D1 invalid default model IDs | New route's boot check validates model IDs against an allowlist pattern and refuses to serve on failure; legacy route untouched |
| D2 context stuffing | Absent by construction: prompt assembly consumes only adapter spans |
| D3 non-blocking citation checks | `citation-verifier.ts` implements doc 04 levels with blocking conversion |
| D4 no audit trail | `audit-logger.ts` interface with mock sink in M1; write sequence proven by tests |
| D5 last-message-only guardrails | GP-1 window assembly in `guardrail.ts` |
| D6 no as-of date | Request field, echoed in envelope, asserted in tests |
| D7 no environment labeling | `environment.ts` pin, echo, MOCK_ONLY label, banner |
