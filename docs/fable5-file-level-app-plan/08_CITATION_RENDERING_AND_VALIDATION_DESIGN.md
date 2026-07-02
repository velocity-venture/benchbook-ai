# 08 - Citation Rendering and Validation Design (F5-03)

Date: 2026-07-02
Contract source: F5-02 doc 04 plus `citation_object_contract.json`. This document fixes the M1 module design.

## 1. Validation pipeline (`lib/qa-research/citation-verifier.ts`)

1. **Extraction:** citation-shaped strings in the generated text are detected with the pattern families already proven in `citation-validator.ts` (imported constants or re-declared patterns; the legacy module itself is not modified). In M1 the mock model client emits deterministic citation placements, so extraction is fully testable.
2. **Level assignment (doc 04):**
   - `verified_retrieved`: string normalizes to the canonical or alias form of a chunk in this request's retrieval set.
   - `verified_resolved`: normalizes via adapter `lookupCitationAlias` but its chunk was not retrieved; M1 policy is DEMOTE (render as "resolved" note, not a card) because the mock cannot fetch new spans mid-answer; the F5-05 policy choice (follow-up fetch vs demotion) is flagged in the F5-04 exit report for owner review.
   - `unresolved`: no resolution; render as warning; never a card.
   - `out_of_universe`: matches excluded-title patterns; triggers GA-3 suppression path.
3. **Granularity clamp:** subsection-suffixed strings are clamped to the parent section citation before display; the original claim is preserved in the verification record metadata.
4. **Conversion rule:** if zero citations reach `verified_retrieved` (or `verified_resolved` under the demotion policy) and the answer contains legal statements, the whole response converts to refusal variant `citation_validation_failure` before any answer event is emitted to the client (server-side conversion; the page's defensive rule in doc 07 is the backstop).

## 2. Builder discipline

Citation objects are constructed exclusively by `buildCitationObject(fixtureRow, verification, environment)` in the verifier module, from adapter data. The model output NEVER supplies a field value. A static test asserts the builder is the only construction site (source scan for object literals matching the contract shape outside the builder).

## 3. Rendering rules (page-side)

Doc 07 section 2 covers card layout. Additional rules: SYNTHETIC marker must be visually preserved (never trimmed) in M1; verification badges are text plus icon; the "resolved, not retrieved" badge links to an explanation tooltip; warnings list deduplicates by normalized citation; confidence badge inputs come only from verification results (GA-4 honesty rule: HIGH only when every rendered citation is verified_retrieved).

## 4. Persistence

The QA page persists messages with the citation objects array (minus runtime passages) into the existing chat persistence shape (`sources` plus `trust_metadata`), keeping Supabase app-tables usage unchanged (chat persistence is an existing, allowed app surface; it stores the QA conversation itself, not legal authority). The mock audit logger separately captures the citation verification entries for test assertions.

## 5. Test coverage (mirror: `test-plan/mock_citation_tests.json`)

MC-01..MC-08 scenario coverage plus: builder-exclusivity static test, SYNTHETIC-marker preservation test, confidence-honesty test (mixed-level citation sets), persistence-shape test, and the mandatory-citation failure test (T-CIT-MISSING: scripted generation with legal statements and zero citations must convert to refusal, never render).
