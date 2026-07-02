# BenchBook.AI Test Coverage Audit (SUPERSEDED)

> **SUPERSEDED 2026-04-26 by `test-coverage-2026-04-26-corrected.md`.** This document carries contamination from a deprecated BenchMark Standard framing (Bronze/Silver/Gold tiers, six-domain old names including a standalone "Reliability" domain, fabricated rubric criteria 1.1/1.4/1.5 with weights 25%/10%). The contamination originated in the overnight task prompt this agent was given. Per operator directive 2026-04-26 BenchBook is independently developed and is NOT measured against BenchMark Standard. The corrected version preserves the inventory and the 10 untested paths and re-frames priorities around BenchBook's own production-readiness. See `~/Projects/MEMORY-CONTAMINATION-AUDIT-2026-04-26.md` for the full contamination chain.

---

**Date:** 2026-04-26
**Author:** overnight-employee (Sonnet)

This audit examined test coverage across BenchBook.AI's production codebase to identify critical untested paths that impact system reliability. The analysis focused on core query processing, authentication, API routes, and citation verification systems that directly affect user-facing judicial research functionality.

## Inventory

| File/Route | Path | Has Test Coverage |
|------------|------|------------------|
| **Library Files** | | |
| Chat Persistence | `src/lib/chat-persistence.ts` | ❌ No |
| Citation Validator | `src/lib/citation-validator.ts` | ✅ Yes |
| Corpus Coverage | `src/lib/corpus-coverage.ts` | ✅ Yes |
| DCS Data | `src/lib/dcs-data.ts` | ❌ No |
| Hallucination Guard | `src/lib/hallucination-guard.ts` | ✅ Yes |
| Query Router | `src/lib/query-router.ts` | ✅ Yes |
| TCA Data | `src/lib/tca-data.ts` | ❌ No |
| TRJPP Data | `src/lib/trjpp-data.ts` | ❌ No |
| Utils | `src/lib/utils.ts` | ❌ No |
| Supabase Client | `src/lib/supabase/client.ts` | ❌ No |
| Supabase Middleware | `src/lib/supabase/middleware.ts` | ❌ No |
| Supabase Server | `src/lib/supabase/server.ts` | ❌ No |
| **API Routes** | | |
| Chat API | `src/app/api/chat/route.ts` | ❌ No |
| Research Patterns | `src/app/api/research-patterns/route.ts` | ❌ No |
| Waitlist | `src/app/api/waitlist/route.ts` | ❌ No |

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

## Domain 1 (Reliability) Implications

The three highest priority untested paths directly impact BenchMark Standard Domain 1 criterion scores. Chat API authentication failures would violate Criterion 1.5 (Edge Case Handling) by allowing unauthorized access instead of appropriate refusal. Legal corpus loading errors threaten Criterion 1.1 (Citation Accuracy) because wrong corpus sections could lead to fabricated or misattributed legal authorities. The Anthropic API streaming integration affects Criterion 1.4 (Consistency) since API failures create unpredictable response patterns that judges cannot rely upon.

According to the Domain 1 rubric, Citation Accuracy and Hallucination Rate each carry 25% weight in the overall reliability score. Testing the corpus loading and API integration paths would directly strengthen these high-weight criteria. Proper edge case handling through authentication testing addresses the 10% weighted Criterion 1.5, creating measurable improvement toward the Bronze threshold of 70 points.

The current 60/100 reliability score reflects exactly these coverage gaps. Implementing comprehensive tests for the top three untested paths would provide the verification framework needed to achieve consistent citation accuracy and appropriate failure modes required for Bronze certification.

## Out of Scope

- UI component snapshot testing (frontend testing outside current backend audit scope)
- Integration tests requiring live Supabase connections (would need test database setup)  
- End-to-end browser testing (requires Playwright or similar tool installation)
- Performance testing under load (needs dedicated test environment)
- Claude model behavior testing (external API behavior not controllable)
- Legal corpus content validation (legal review, not engineering testing)

## Discord Summary

BenchBook.AI test coverage audit identified 10 critical untested paths across authentication, legal corpus loading, API integration, and data persistence. The three highest priority gaps affect reliability scoring under BenchMark Standard Domain 1 criteria for Citation Accuracy, Edge Case Handling, and Consistency. Chat API authentication lacks boundary testing for unauthorized access scenarios. Legal corpus caching and keyword-based loading systems have no verification that correct statute sections reach judicial users. Anthropic API streaming integration lacks error handling tests that could prevent response failures during live hearings. Implementing comprehensive test coverage for these three core paths would strengthen reliability verification and progress toward Bronze certification requirements.