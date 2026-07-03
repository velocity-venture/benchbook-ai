# 05 - Citation and Audit QA Report (F5-05)

Date: 2026-07-02
Machine artifacts: `exercises/mock_citation_exercise.json`, `exercises/mock_audit_exercise.json`.

## Citation mandate (phase question 4): HOLDS

Two independent enforcement layers were verified:

1. **Server-side (primary)**: a generation with zero verified citations converts to the `citation_validation_failure` refusal (T-CIT-MISSING, MC-08, RF-14); an all-unresolved draft never renders; an out-of-universe citation suppresses the entire answer (MC-04). The suppressed draft's hash is retained in the audit chain (MA-04), so withheld answers remain forensically accountable.
2. **Page-side (defensive)**: the page renders answer text only when at least one verified citation object arrived; otherwise the refusal presentation wins.

Citation objects are contract-complete (13/13 required fields), levels are honest (verified_retrieved full badge; verified_resolved distinct badge with MEDIUM confidence cap per M-2; unresolved as warnings only), granularity clamps to fixture resolution, canonical strings come only from fixture rows, SYNTHETIC markers survive to rendering, TRE citations carry the evidentiary tag, and DCS cards never enter the answer envelope or the confidence computation.

## Refusal attribution (phase question 5): HOLDS

Every refusal envelope carries kind + variant + owner-reviewed message key (reason), a stage from the three-stage enum, and a non-empty permissible-help list (next action). Missing templates throw rather than degrade. Verified across all 20 exercised variants; the 21st (model_no_support) has the same structural guarantees but no demonstration run (G3).

## Audit universality (phase question 6): HOLDS

Every executed request path writes its chain: answers write retrieval log then answer audit then per-citation verification records, in asserted order; pre-retrieval refusals write the refusal record; retrieval-stage refusals write retrieval log (flagged refused-before-generation) then refusal record; conversions additionally write the suppressed answer audit linked to the refusal record. Audit write failures fail closed in both positions (no unaudited answer ever streams). Content rules are enforced by the sink itself: prohibited field names, passage-length strings, and unhashed queries/answers THROW. The reconstruction drill recovers query hash, retrieved chunk ids, prompt hash, prompt version, answer hash, citation levels, and environment target from sink rows alone.

## QA conclusion

The two properties the owner cares most about (nothing uncited, everything audited) are enforced structurally at multiple layers and were demonstrated by execution, not inspection. No defect found; no code change needed.
