# Production Exclusion Rules

These rules define what must remain out of production display and production retrieval unless a later written owner approval changes the rule.

## Default exclusion rules

1. Pending extraction QA chunks are excluded.
   - Count: 4,198.
   - Rule: no production display, no production answer retrieval.

2. Restricted Lexis annotation, case-note, and advisory chunks are excluded.
   - Count: 2,392.
   - Rule: no production display, no production answer retrieval, no judge-facing source card.

3. DCS document-anchored rows remain guardrail-only.
   - Count: 130 units and 1,146 chunks.
   - Rule: do not treat as policy-citation answer authority unless manually mapped and approved.

4. DCS corpus rows remain non-production-eligible by default.
   - Count: 2,014 chunks.
   - Rule: guardrail/reference only until document type, currency, extraction QA, and owner approval are complete.

5. TRE remains limited authority.
   - Count: 533 chunks.
   - Rule: answer authority only for evidentiary rules, admissibility, objections, offers of proof, expert proof, hearsay, judicial notice, and related evidentiary or procedural issues. Otherwise, TRE is guardrail/reference material.

6. Unknown-effectivity rows are excluded.
   - Count: 15 versions and 39 chunks.
   - Rule: no production eligibility until effectivity QA assigns a reliable status.

7. Future-effective rows are as-of-date gated.
   - Count: 16 versions and 120 chunks.
   - Rule: not visible before the effective date. E5 proof shows 0 future-effective versions visible before 2026-07-01.

8. Production display gates remain closed by default.
   - E5 production displayable count: 0.
   - Rule: displayable status requires explicit approval.

9. Embeddings remain excluded.
   - Rule: no pgvector population and no semantic index until separately approved.

10. Production corpus replacement remains excluded.
    - Rule: local dry-run corpus rows do not replace the app production corpus.

## Scope exclusion rules

The V1 corpus must not include:

- T.C.A. Title 39.
- T.C.A. Title 40.
- T.C.A. Title 55.
- Open web retrieval.
- Broad external legal research.
- BenchMark Standard content or coupling.
- Broad case-management features.

## Local rules exclusion rule

Optional local juvenile court rules remain a future private overlay concept. They must not be loaded into the global corpus. Any later local-rules database design must separate statewide authority from court-private local authority and must keep absent local rules as a clean not-applicable state.

## Production retrieval contract

Production retrieval should use security-definer RPCs or equivalent server-side gates that enforce:

- Authentication.
- Display approval.
- License restrictions.
- Extraction QA status.
- As-of date filtering.
- Family and scope limits.
- Court-private overlay boundaries.
- Query privacy rules.
