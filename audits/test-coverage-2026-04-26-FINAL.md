# BenchBook.AI Test Coverage Audit (FINAL)

**Date:** 2026-04-26
**Author:** overnight-employee output (Sonnet) with operator-directed correction by claude_code 2026-04-26
**Supersedes:** `test-coverage-2026-04-26.md` and `test-coverage-2026-04-26-corrected.md`. Both prior versions were marked superseded with header notes; this FINAL version is the authoritative deliverable.
**Coupling:** None. This audit measures BenchBook.AI against BenchBook.AI's own production-readiness criteria. It does not reference, score against, or imply alignment with any external certification framework. Per operator directive 2026-04-26, BenchBook.AI is independently developed and is operationally independent from any other VVH project.

---

## 1. Scope

This audit examined test coverage across BenchBook.AI's production codebase (`~/Projects/benchbook-ai/app/`) to identify critical untested paths that block confident promotion from internal court use to public beta. The scope is the 12 library files under `src/lib/` plus the 3 API routes under `src/app/api/`. Frontend components, integration tests requiring live infrastructure, and external-system behaviors are explicitly out of scope (see section 5).

Method: read every source file and every existing test file under `src/__tests__/`; classify each source-file export as covered, partially covered, or uncovered; rank uncovered exports by the impact of an undetected failure on a real user query; produce the top 10 by impact.

## 2. Inventory

| File / Route | Path | Test coverage |
|--------------|------|---------------|
| **Library files** | | |
| Chat persistence | `src/lib/chat-persistence.ts` | None |
| Citation validator | `src/lib/citation-validator.ts` | Yes |
| Corpus coverage | `src/lib/corpus-coverage.ts` | Yes |
| DCS data loader | `src/lib/dcs-data.ts` | None |
| Hallucination guard | `src/lib/hallucination-guard.ts` | Yes |
| Query router | `src/lib/query-router.ts` | Yes |
| TCA data loader | `src/lib/tca-data.ts` | None |
| TRJPP data loader | `src/lib/trjpp-data.ts` | None |
| Utils | `src/lib/utils.ts` | None |
| Supabase client (browser) | `src/lib/supabase/client.ts` | None |
| Supabase middleware | `src/lib/supabase/middleware.ts` | None |
| Supabase server client | `src/lib/supabase/server.ts` | None |
| **API routes** | | |
| Chat | `src/app/api/chat/route.ts` | None |
| Research patterns | `src/app/api/research-patterns/route.ts` | None |
| Waitlist | `src/app/api/waitlist/route.ts` | None |

Existing test files (4): `query-router.test.ts`, `hallucination-guard.test.ts`, `citations.test.ts`, `corpus-coverage.test.ts`. Last vitest run (2026-04-25 evening): 4 files, 52 tests, all passing.

## 3. Top 10 untested critical paths

Ranked by impact of an undetected failure on a real user query.

### 1. Chat API authentication and rate limiting

**Path:** `src/app/api/chat/route.ts` ~lines 120 to 150 (checkRateLimit, user auth)
**What it does:** Validates that the request is from an authenticated user and enforces a rate limit per user.
**What breaks if untested:** Unauthenticated users could hit the chat endpoint and consume Anthropic API budget; spammed accounts could exhaust the rate limiter under load.
**Test shape:** Mock the Supabase auth client and make requests with valid token, missing token, expired token, and over-limit conditions; assert correct status codes and rate-limit responses.
**Effort:** M

### 2. Legal corpus loading and caching

**Path:** `src/app/api/chat/route.ts` ~lines 300 to 350 (loadRelevantCorpus, refreshCorpusCache)
**What it does:** Reads the prebuilt legal corpus, selects sections relevant to the user's query, caches the selection.
**What breaks if untested:** A wrong-corpus failure mode (right structure, wrong content) is hard to detect in production because the model still produces fluent, citation-shaped output. Judges would receive plausible-looking answers grounded in the wrong statutory area.
**Test shape:** Mock the prebuilt corpus, exercise keyword matching across covered and uncovered title areas, exercise cache hit and cache miss paths, assert correct selection.
**Effort:** M

### 3. Anthropic API streaming integration

**Path:** `src/app/api/chat/route.ts` ~lines 400 to 500 (streamClaude function)
**What it does:** Streams responses from the Anthropic API back to the client over server-sent events.
**What breaks if untested:** API errors mid-stream leave the user staring at a half-rendered answer; transient failures are not retried; usage tokens are miscounted on partial streams.
**Test shape:** Mock the Anthropic SDK with success and several failure modes (transient, auth, rate limit, mid-stream disconnect); assert correct event formatting and error handling.
**Effort:** M

### 4. Chat session persistence

**Path:** `src/lib/chat-persistence.ts` lines 1 to 80 (all exported functions)
**What it does:** Creates, retrieves, updates, and lists user chat sessions in Supabase.
**What breaks if untested:** Session leakage across users (auth boundary violation), lost sessions during a research session, duplicate sessions on retries.
**Test shape:** Mock the Supabase client; exercise the CRUD path with row-level security simulated; assert per-user isolation.
**Effort:** S

### 5. Supabase server client creation

**Path:** `src/lib/supabase/server.ts` lines 1 to 25 (createClient)
**What it does:** Constructs a server-side Supabase client with the cookie-bound session.
**What breaks if untested:** Misconfigured environment variables silently produce a client that connects to the wrong project, or a client with no session that bypasses RLS.
**Test shape:** Test client creation with valid and invalid env vars; mock cookie handling for present, absent, and malformed sessions.
**Effort:** XS

### 6. Query input validation

**Path:** `src/app/api/chat/route.ts` ~lines 150 to 200 (request validation)
**What it does:** Validates query length, message format, and request structure before processing.
**What breaks if untested:** Malformed inputs could crash the API, and missing length caps could exhaust token budgets on a single request.
**Test shape:** Boundary conditions for query length, malformed JSON, invalid message structures, oversized history arrays.
**Effort:** S

### 7. Research query tracking

**Path:** `src/app/api/chat/route.ts` ~lines 550 to 600 (trackResearchQuery)
**What it does:** Logs queries and verified citations to a per-user research-pattern table.
**What breaks if untested:** No audit trail of judicial research queries makes future compliance review and quality work impossible.
**Test shape:** Mock the Supabase insert path; exercise query truncation; exercise source serialization with empty, single, and multiple source cases.
**Effort:** S

### 8. Environment configuration validation

**Path:** `src/app/api/chat/route.ts` ~lines 80 to 100 (API key checks)
**What it does:** Validates that `ANTHROPIC_API_KEY` and related feature flags are present.
**What breaks if untested:** A missing env var causes a silent failure on the first user query rather than a clear startup error.
**Test shape:** Test with missing or malformed `ANTHROPIC_API_KEY` and `USE_CLAUDE_API` settings; assert clear failure responses.
**Effort:** XS

### 9. Feedback toggle

**Path:** `src/lib/chat-persistence.ts` lines 60 to 80 (toggleFeedback)
**What it does:** Manages thumbs up/down and bookmark flags on individual AI responses.
**What breaks if untested:** Feedback writes to the wrong user, feedback duplicates on rapid clicks.
**Test shape:** Test feedback toggle logic, verify per-user authorization, exercise duplicate-click handling.
**Effort:** XS

### 10. Data file loading error handling

**Path:** `src/app/api/chat/route.ts` ~lines 30 to 35 (prebuiltCorpus import)
**What it does:** Imports the pre-built legal corpus JSON at module-load time.
**What breaks if untested:** A missing or corrupted JSON file would crash the route at import time, taking down chat for every user.
**Test shape:** Test with missing or malformed JSON file; verify graceful fallback or clear startup error.
**Effort:** XS

## 4. Pre-launch reliability priorities

Items 1, 2, and 3 are the smallest set that exercises the full user-query path: an authenticated user hits the chat endpoint, the system loads relevant corpus, and the model streams back a grounded answer. Adding tests for those three would let the BenchBook owner promote a build to public beta with measurable confidence in the integration's correctness.

Items 4 through 7 are smaller and additive. They harden specific subsystems (sessions, server client, input validation, query tracking) without changing the shape of the integration. They are the natural follow-on after items 1 to 3 land.

Items 8 to 10 are operational guardrails. They reduce silent-failure risk by converting subtle wrong-config errors into loud startup failures.

The total estimated effort for items 1 through 10 is roughly two to three engineering days, given the codebase is small and the dependencies are cleanly mockable.

## 5. Out of scope

- UI component snapshot testing (frontend testing is outside this backend audit).
- Integration tests requiring a live Supabase project (would need a test database with seeded data).
- End-to-end browser testing (would require Playwright or a similar tool installation).
- Performance testing under load (needs a dedicated test environment).
- Claude model behavior testing (external API behavior is not controllable from this codebase).
- Legal corpus content validation (legal review, not engineering testing).

## Discord Summary

BenchBook.AI test coverage audit identified 10 critical untested paths across authentication, legal corpus loading, Anthropic API integration, and data persistence. The three highest-priority gaps block confident public-beta launch: chat-API authentication and rate limiting, legal corpus loading and caching, and Anthropic API streaming integration. All three sit on the main user-query path, so testing them exercises the full integration in one set of work. Remaining items are smaller, additive, and do not change the shape of the integration. Total estimated effort: roughly two to three engineering days. Full audit at `~/Projects/benchbook-ai/audits/test-coverage-2026-04-26-FINAL.md`.
