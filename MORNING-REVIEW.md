# Morning Review: Branch `remediation/overnight-2026-04-07`

**Reviewer:** Claude Opus 4.6
**Date:** April 8, 2026
**Overnight operator:** Churchill (Claude Opus 4.6)

---

## 1. Overnight Session Summary

**What was done (8 commits, 17 files, +2867/−497 lines):**
- Security audit: scanned git history for leaked secrets, hardened `.gitignore`
- Citation validation engine: rebuilt with corpus cross-referencing, 16 tests
- Hallucination prevention guard: confidence scoring (HIGH/MEDIUM/LOW), warnings for unverified citations, guardrails injected into system prompt
- Smart routing: rewrote `classifyQueryComplexity()` to force Sonnet for complex legal queries, restrict Haiku to simple lookups
- System prompt: rewritten for bench-ready format (answer → statute → procedure → practical notes)
- Corpus: dynamic file discovery in prebuild script, placeholder stubs for Titles 39/40/55
- UI: confidence badges, hallucination warnings, copy button, bench cards panel
- Build health: vitest installed, 21 tests passing, clean build
- Documentation: README and ARCHITECTURE rewritten

**What was skipped:**
- DCS PDF text extraction (25 PDFs still in PDF format; edge runtime can't use Node fs APIs)
- Pre-existing lint warnings in `settings/page.tsx`, `voice-input.tsx`, `research-patterns/route.ts`

**Issues flagged by overnight session:**
- DCS PDFs need offline extraction to `.txt` before they can be indexed
- Criminal law corpus (Titles 39/40/55) are stubs only — content gap for General Sessions

---

## 2. Test Suite

**Result: PASS**

```
Test Files:  2 passed (2)
Tests:       21 passed (21)
Duration:    249ms
```

All 21 tests pass cleanly. Coverage spans citation index building, TCA/TRJPP/DCS verification, format variations, subsections, case law detection, deduplication, and confidence scoring.

---

## 3. Production Build

**Result: PASS (with pre-existing warnings)**

Build compiles successfully. 8 static pages, 11 dynamic routes, middleware 73.8 kB, corpus 5.9 MB (within Cloudflare Workers limits).

**Warnings (all pre-existing, not introduced by this branch):**
- `chat/page.tsx`: React Hook `useEffect` missing dependency
- `settings/page.tsx`: `any` type usage
- `research-patterns/route.ts`: unused `request` parameters
- `voice-input.tsx`: `any` types, unused `placeholder` variable

None of these are blockers. They should be cleaned up in a separate PR.

---

## 4. Smart Routing

**Result: PASS with gaps**

**Location:** `app/src/app/api/chat/route.ts`, function `classifyQueryComplexity()` (lines 285-329)

**Categories currently configured for Sonnet routing:**

| Category | Pattern | Status |
|----------|---------|--------|
| Sentencing | `sentenc\|revocation` | PRESENT |
| Juvenile court | `title\s+37\|trjpp\|juvenile\s+court\|juvenile\s+detention` | PRESENT |
| DCS / dependency-neglect | `\bdcs\b\|department\s+of\s+children\|dependency\|neglect\|child\s+abuse\|removal` | PRESENT |
| Bond scheduling | `bond\s+schedul` | PARTIAL |
| Probation violations | `probation\s+violat\|revocation` | PRESENT |
| Legal standards | `probable\s+cause\|due\s+process\|preponderance\|beyond\s+a\s+reasonable\s+doubt` | PRESENT |
| Best interest | `best\s+interest\s+of\s+the\s+child` | PRESENT |
| Analysis/comparison | `analyz\|compar\|evaluat\|assess` | PRESENT |
| Long queries (>150 chars) | length check | PRESENT |
| Multiple questions | `?` count > 1 | PRESENT |

**Missing categories (requested in review checklist):**

| Category | Status | Notes |
|----------|--------|-------|
| **Custody** | MISSING | No pattern matches "custody" queries |
| **Bail** | MISSING | Pattern matches "bond schedul" but not standalone "bail" or "bond hearing" |
| **Contempt** | MISSING | No pattern for contempt proceedings |
| **Mental health commitments** | MISSING | No pattern for mental health, commitment, or involuntary treatment |

**Recommendation:** Add these four categories to the `forceComplex` array:
```typescript
/custody|custodial/i.test(query),
/\bbail\b|bond\s+hear/i.test(query),
/contempt/i.test(query),
/mental\s+health|commitment|involuntary\s+treatment/i.test(query),
```

---

## 5. Hallucination Guard

**Result: PASS**

**Location:** `app/src/lib/hallucination-guard.ts` and `app/src/lib/citation-validator.ts`

**Confidence scoring logic (`computeConfidence()`):**

| Level | Condition | Reason shown to user |
|-------|-----------|---------------------|
| HIGH | All statute/rule citations verified, no case law present (or no citations at all) | "All citations verified against the legal corpus." |
| MEDIUM | All statute/rule citations verified, but case law references present | "All statute citations verified, but case law references cannot be verified..." |
| LOW | One or more statute/rule citations could NOT be verified against corpus | "Unverified citations: [list]. These could not be found in the loaded legal corpus." |

**Edge case analysis — can LOW be served without warning?**

No. The warning generation loop in `runHallucinationGuard()` iterates over the same `unverified` set that triggers LOW confidence. If `computeConfidence()` returns LOW, at least one unverified statute exists, and a warning is generated for each. Warnings and LOW confidence are always paired.

**Architectural note:** The guard runs after the full response has been streamed. During streaming, the user sees response text without confidence indicators. The confidence badge and warnings appear only after streaming completes. This is acceptable UX for a streaming architecture, but worth noting.

**System prompt guardrails** (`HALLUCINATION_GUARDRAILS` constant) are injected into every API request, instructing Claude not to fabricate citations. This is a defense-in-depth approach: prompt-level prevention + post-response verification.

---

## 6. Citation Validation

**Result: FAIL — "Tenn. Code Ann." format not matched**

**Location:** `app/src/lib/citation-validator.ts`, line 123

**Current regex:**
```
/T\.?C\.?A\.?\s*§?\s*(?:section\s+)?(\d+-\d+-\d+)(?:\([a-z0-9]+\))?/gi
```

**Test results against required strings:**

| Input | Result |
|-------|--------|
| `T.C.A. § 37-1-102` | MATCH |
| `T.C.A. 37-1-102` | MATCH |
| `Tenn. Code Ann. § 37-1-102` | **NO MATCH** |
| `TCA 37-1-102` | MATCH |

The regex handles abbreviated forms (`T.C.A.`, `TCA`) but does **not** handle the formal citation format `Tenn. Code Ann.` — this is the format used in published Tennessee appellate opinions and legal briefs. Claude may generate this format in responses, causing valid citations to be flagged as unverified and triggering false LOW confidence scores.

**Recommendation:** Add an alternate pattern or modify the existing regex:
```typescript
const TCA_PATTERN = /(?:T\.?C\.?A\.?|Tenn\.?\s*Code\s*Ann\.?)\s*§?\s*(?:section\s+)?(\d+-\d+-\d+)(?:\([a-z0-9]+\))?/gi;
```

---

## 7. Corpus File Discovery

**Result: PASS**

**Location:** `scripts/prebuild-corpus.js`

The `findFiles()` function (lines 40-54) recursively scans directories for `.html`, `.txt`, and `.md` files. Beyond the hardcoded core paths (TCA Title 37, Title 36), the script:
- Dynamically discovers additional TCA title files in the tca/ directory
- Falls back to scanning individual TRJPP rule files if the consolidated file is absent
- Scans the DCS directory for `.txt` and `.md` files
- Discovers and processes any additional corpus subdirectories beyond tca/trjpp/dcs

Dropping new `.md` or `.txt` files into `/legal-corpus/` subdirectories will include them in the next `npm run prebuild` without code changes.

---

## 8. System Prompt Structure

**Result: PASS**

**Location:** `app/src/app/api/chat/route.ts`, lines 100-124

The system prompt explicitly instructs the following response structure:
1. **Direct answer** in 1-2 sentences
2. **Applicable statute** with section number (T.C.A. § format)
3. **Key procedural requirements** or elements
4. **Practical notes** for bench application

This matches the required answer → statute → procedure → practical notes format. The prompt also includes hallucination guardrails and key procedural references for common queries (detention, dispositions, reasonable efforts, less restrictive alternatives).

The prompt is delivered as two cached `systemBlocks`: the core prompt and the legal corpus, both using `cache_control: { type: 'ephemeral' }` for Anthropic prompt caching.

---

## Final Scorecard

| Item | Result | Severity |
|------|--------|----------|
| 1. Overnight log review | PASS | — |
| 2. Tests (31/31) | PASS | — |
| 3. Production build | PASS (pre-existing warnings) | Low |
| 4. Smart routing | PASS | — (fixed) |
| 5. Hallucination guard | PASS | — |
| 6. Citation validation | PASS | — (fixed) |
| 7. Corpus discovery | PASS | — |
| 8. System prompt | PASS | — |

---

## Fixes Applied (April 8, 2026)

### FIX 1 — Citation Regex (HIGH, now resolved)
- **Changed:** `TCA_PATTERN` in `citation-validator.ts` now uses `(?:T\.?C\.?A\.?|Tenn\.?\s*Code\s*Ann\.?)` as the prefix, matching all four format variants: `T.C.A. §`, `T.C.A.`, `Tenn. Code Ann. §`, and `TCA`.
- **Tests added:** 2 new tests in `citations.test.ts` — one for `Tenn. Code Ann.` format specifically, one parametric test covering all four variants.
- **Verified:** All four formats now match and verify correctly.

### FIX 2 — Smart Routing Gaps (MEDIUM, now resolved)
- **Changed:** Added four new category patterns to `classifyQueryComplexity()` (extracted to `lib/query-router.ts` for testability):
  - Custody: `custody`, `custodial`, `parenting time`, `parenting plan`, `residential parent`
  - Bail: `bail`, `bail hearing`, `bail revocation` (complements existing `bond schedul`)
  - Contempt: `contempt`, `contempt of court`, `willful contempt`, `civil contempt`, `criminal contempt`
  - Mental health: `mental health commitment`, `judicial commitment`, `Title 33`, `involuntary commitment`
- **Tests added:** 8 new tests in `query-router.test.ts` covering all four categories plus sanity checks on existing routing.
- **Verified:** All new categories route to Sonnet. Simple queries still route to Haiku.

### Remaining (deferred, Low):
1. **Pre-existing lint warnings**: Clean up `any` types and unused variables in `settings/page.tsx`, `voice-input.tsx`, `research-patterns/route.ts`.
2. **DCS PDF extraction**: Extract 25 DCS PDFs to `.txt` for corpus indexing.
3. **Criminal law corpus stubs**: Titles 39/40/55 are placeholders — needs real statute text.

---

## Test & Build Verification

```
Tests:  31 passed (31) — 3 test files
Build:  Compiled successfully — no new warnings introduced
```

---

## Merge Recommendation

**READY TO MERGE.** Both blocking issues (citation regex, smart routing gaps) have been fixed and verified with new tests. The branch passes all 31 tests and builds cleanly. Remaining items (lint cleanup, DCS PDF extraction, corpus stubs) are low-severity and can be addressed in follow-up PRs.
