# BenchBook.AI Test Coverage Audit (corrected) — SUPERSEDED 2026-04-26 by FINAL

> **SUPERSEDED 2026-04-26 by `test-coverage-2026-04-26-FINAL.md`.** This corrected version was an interim re-issue this morning that still referenced "Domain 1 Reliability" once and used a heading-level structure inconsistent with the canonical contract. The FINAL version is the authoritative deliverable. Both prior versions retained for forensic chain only.

---

**Date:** 2026-04-26
**Author:** overnight-employee output (Sonnet) with corrections by claude_code 2026-04-26
**Supersedes:** `test-coverage-2026-04-26.md` (original carried contamination from a deprecated BenchMark Standard framing; see contamination audit at `~/Projects/CONTAMINATION-AUDIT-FINAL-2026-04-26.md`)

This audit examined test coverage across BenchBook.AI's production codebase to identify critical untested paths that block confident public-beta launch. The analysis focused on core query processing, authentication, API routes, and citation verification systems that directly affect user-facing judicial research functionality. The 10 prioritized paths in section 2 are scored by impact on a real user query going wrong, not by any external certification rubric.

## Inventory

| File/Route | Path | Has Test Coverage |
|------------|------|------------------|
| **Library Files** | | |
| Chat Persistence | `src/lib/chat-persistence.ts` | No |
| Citation Validator | `src/lib/citation-validator.ts` | Yes |
| Corpus Coverage | `src/lib/corpus-coverage.ts` | Yes |
| DCS Data | `src/lib/dcs-data.ts` | No |
| Hallucination Guard | `src/lib/hallucination-guard.ts` | Yes |
| Query Router | `src/lib/query-router.ts` | Yes |
| TCA Data | `src/lib/tca-data.ts` | No |
| TRJPP Data | `src/lib/trjpp-data.ts` | No |
| Utils | `src/lib/utils.ts` | No |
| Supabase Client | `src/lib/supabase/client.ts` | No |
| Supabase Middleware | `src/lib/supabase/middleware.ts` | No |
| Supabase Server | `src/lib/supabase/server.ts` | No |
| **API Routes** | | |
| Chat API | `src/app/api/chat/route.ts` | No |
| Research Patterns | `src/app/api/research-patterns/route.ts` | No |
| Waitlist | `src/app/api/waitlist/route.ts` | No |

## Top 10 Untested Critical Paths

### 1. Chat API Authentication & Rate Limiting
**Path:** `src/app/api/chat/route.ts` lines 120-150 (checkRateLimit, user auth)
**Description:** Validates user authentication and enforces rate limits on chat queries
**Failure Impact:** Unauthenticated users could access legal research or spam queries could overwhelm the system
**Test Shape:** Mock Supabase auth responses and test both authenticated/unauthenticated requests, verify rate limit enforcement
**Effort:** M

### 2. Legal Corpus Loading & Caching
**Path:** `src/app/api/chat/route.ts` lines 300-350 (loadRelevantCorpus, refreshCorpusCache)
**Description:** Loads and caches relevant legal text based on query keywords
**Failure Impact:** Wrong corpus sections loaded means judges get incomplete or wrong legal authorities
**Test Shape:** Mock prebuilt corpus data, test keyword matching, verify cache invalidation with vitest
**Effort:** M

### 3. Anthropic API Streaming Integration
**Path:** `src/app/api/chat/route.ts` lines 400-500 (streamClaude function)
**Description:** Manages streaming responses from Claude API with error handling
**Failure Impact:** API failures during queries leave judges without research results mid-hearing
**Test Shape:** Mock Anthropic API with success/failure scenarios, verify stream event formatting
**Effort:** M

### 4. Chat Session Persistence
**Path:** `src/lib/chat-persistence.ts` lines 1-80 (all functions)
**Description:** Creates, retrieves, and manages persistent chat sessions in Supabase
**Failure Impact:** Lost session state means judges lose previous research context during hearings
**Test Shape:** Mock Supabase client, test session CRUD operations and auth boundary enforcement
**Effort:** S

### 5. Supabase Server Client Creation
**Path:** `src/lib/supabase/server.ts` lines 1-25 (createClient function)
**Description:** Creates authenticated Supabase client for server-side operations
**Failure Impact:** Database connection failures prevent all user authentication and data persistence
**Test Shape:** Test client creation with valid/invalid environment variables, mock cookie handling
**Effort:** XS

### 6. Query Input Validation
**Path:** `src/app/api/chat/route.ts` lines 150-200 (request validation)
**Description:** Validates query length, message format, and request structure
**Failure Impact:** Malformed inputs could crash the API or allow injection attacks
**Test Shape:** Test boundary conditions for query length, malformed JSON, invalid message structures
**Effort:** S

### 7. Research Query Tracking
**Path:** `src/app/api/chat/route.ts` lines 550-600 (trackResearchQuery)
**Description:** Logs queries and verified citations to user research patterns
**Failure Impact:** No audit trail of judicial research queries prevents compliance review
**Test Shape:** Mock Supabase insert operations, test query truncation and source serialization
**Effort:** S

### 8. Environment Configuration Validation
**Path:** `src/app/api/chat/route.ts` lines 80-100 (API key checks)
**Description:** Validates required environment variables for Claude API integration
**Failure Impact:** Missing configuration causes silent failures during legal research
**Test Shape:** Test with missing/invalid ANTHROPIC_API_KEY and USE_CLAUDE_API settings
**Effort:** XS

### 9. Feedback System
**Path:** `src/lib/chat-persistence.ts` lines 60-80 (toggleFeedback)
**Description:** Manages thumbs up/down and bookmark feedback on AI responses
**Failure Impact:** No feedback mechanism prevents quality improvement and user satisfaction tracking
**Test Shape:** Test feedback toggle logic, verify user authorization and duplicate handling
**Effort:** XS

### 10. Data File Loading Error Handling
**Path:** `src/app/api/chat/route.ts` lines 30-35 (prebuiltCorpus import)
**Description:** Imports pre-built legal corpus JSON at runtime
**Failure Impact:** Missing or corrupted legal data means no statute citations available for judges
**Test Shape:** Test with missing/malformed JSON file, verify graceful fallback behavior
**Effort:** XS

## Pre-launch reliability priorities

The three highest-priority untested paths block confident promotion of BenchBook from internal court use to public beta. Authentication and rate-limiting (#1) controls who can hit the system at all and is a prerequisite for any public exposure. Legal corpus loading and caching (#2) determines whether judges receive correct statute text or a silent miss; a wrong-corpus failure mode is hard to detect without tests because the responses still look fluent. Streaming integration with the Claude API (#3) determines whether failures are graceful or leave the user staring at a half-rendered answer mid-hearing.

These three are also the smallest set that exercises the full request path: an authenticated user hits the chat endpoint, the system loads relevant corpus, and the model streams back a grounded answer. With test coverage on those three, every other untested path becomes a smaller, additive task that does not change the shape of the integration.

The remaining seven items are lower priority because they either fail loudly when they fail (environment configuration #8), are not yet exercised in the user flow (feedback #9, research tracking #7), or have well-understood failure modes that are visible in development (data file loading #10).

## Out of Scope

- UI component snapshot testing (frontend testing outside current backend audit scope)
- Integration tests requiring live Supabase connections (would need test database setup)
- End-to-end browser testing (requires Playwright or similar tool installation)
- Performance testing under load (needs dedicated test environment)
- Claude model behavior testing (external API behavior not controllable)
- Legal corpus content validation (legal review, not engineering testing)

## Discord Summary

BenchBook.AI test coverage audit identified 10 critical untested paths across authentication, legal corpus loading, API integration, and data persistence. The three highest priority gaps block confident public-beta launch: chat-API authentication and rate-limiting, legal corpus loading and caching, and Anthropic API streaming integration. All three sit on the main user-query path, so testing them exercises the full integration in one set of work. Remaining items are smaller, additive, and do not change the shape of the integration. The full audit lives at `~/Projects/benchbook-ai/audits/test-coverage-2026-04-26-corrected.md`.
