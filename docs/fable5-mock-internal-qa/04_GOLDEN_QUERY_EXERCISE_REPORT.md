# 04 - Golden Query Exercise Report (F5-05)

Date: 2026-07-02
Machine artifact: `exercises/golden_query_mock_exercise.json` (20-category matrix).

## Method

The F5-01/F5-02 golden-query categories were mapped onto the mock surface and EXECUTED through the real route pipeline via the F5-04 suites (real modules, constructor-injected mock deps) at HEAD `c3eef92`. Every category row carries its executed evidence (scenario ids and test files) and its result. Query shapes are synthetic and reference only SYNTHETIC fixtures; no legal text was used anywhere.

## Results: 20 categories, 19 PASS, 1 PASS_WITH_GAP, 0 FAIL

Successes (Title 36, Title 37, evidence-rule) return ANSWER envelopes with verified_retrieved citation metadata; the DCS category returns the REFERENCE class with not_controlling_authority cards and no model call; all eight refusal categories (Titles 39/40/55, web/general, no-authority, ruling, credibility, extra-record) refuse at pre-retrieval or retrieval stage with the correct kind/variant and zero adapter leakage; all four gated-material categories (restricted Lexis, pending QA, unknown effectivity, future effectivity) block with the most restrictive applicable class; the citation-missing category converts to refusal with the draft suppressed; audit objects and the MOCK_ONLY label are present on every row.

## The one gap (G1)

Juvenile-rule (TRJPP) success is genuinely exercised: MR-03's fixture set retrieves and cites `TRJPP SYN-Rule 901 (SYNTHETIC)` alongside Title 37 rows, and the claim extractor verifies the rule-form citation. But no assertion pins the `tenn_rules_juvenile_practice_procedure` family explicitly, so a regression that silently dropped TRJPP rows from answer support would not fail a named assertion. Recommended F5-06 change: one explicit per-family assertion (test-only). This is a test-coverage gap, not a behavior defect; manual inspection of the executed envelope confirms the TRJPP citation renders.

## Interpretation guidance for the owner

This exercise proves the CONTRACT behavior of the surface against synthetic fixtures. It does not (and cannot, in M1) prove retrieval quality over real Tennessee authority; that belongs to the fixture-tier and preview-tier work behind the corpus-side gate chain. What it does prove: no path exists from any golden-query category to an unsourced, uncited, unaudited, or unlabeled response.
