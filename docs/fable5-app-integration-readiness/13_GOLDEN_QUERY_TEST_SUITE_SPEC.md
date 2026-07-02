# 13 - Golden Query Test Suite Spec

Date: 2026-07-02
Phase: F5-02. Refines F5-01 doc 11 into a runnable suite spec bound to the contracts of this package.

## 1. Suite composition (unchanged targets, now contract-bound)

Eight blocks, 60-90 queries at authoring time: GB1 Title 37 bench topics (15-20), GB2 Title 36 (10-15), GB3 TRJPP (10-12), GB4 TRE evidentiary (8-10), GB5 DCS reference (6-8), GB6 citation-form variants (10-15), GB7 effectivity probes (4-6), GB8 cross-family disambiguation (4-6). Query texts are authored by the corpus admin in the CSV schema below; this repo never stores legal passages, only query phrasings, citations, and expectations.

## 2. Golden query record schema (CSV, authored by corpus admin)

query_id, block, phrasing_variant_id, query_text, answer_scope_intent_expected, family_filter_expected, expected_unit_citations (canonical forms, pipe-separated), acceptable_alternates, expected_response_class (ANSWER or REFERENCE), expected_scope_tags, expected_as_of_behavior, expected_version_status, confidence_floor, required_source_card_fields, audit_assertions (retrieval_log, answer_audit, citation_verification counts), notes.

## 3. Runner behavior (T3 tier; also runnable at T2 against fixtures for mechanics)

1. Submits each query through the QA route exactly as a user would (same auth tier, same SSE consumption).
2. Captures the full contract response plus persisted audit rows.
3. Scores per F5-01 doc 11 section 4: citation accuracy (100 percent GB1/GB6 target; 90 percent first-run topical), zero non-retrieved-authority citations (hard fail), 100 percent scope labeling (hard fail on DCS-as-authority or unlabeled TRE), latency recorded not gated.
4. Every failure receives a disposition: alias gap, metadata gap, ranking, prompt defect, guardrail defect; dispositions feed the qa_harness_dashboard burndown.
5. Regression lock: a previously passing query that fails blocks internal QA sessions until triaged.

## 4. Cadence

Full suite before the first internal QA session (twice, consecutively green with the refusal matrix); weekly during internal QA; after any corpus reload, prompt change, guardrail pattern change, or refusal template change.

## 5. Build order

1. Corpus admin authors GB6 and GB1 first (they gate citation trust) using the CSV template shipped with the E14C kit.
2. Codex implements the runner in F5-04 alongside the T1 harness (same assertions module).
3. First T3 execution happens only after E15 reload and O2 tier promotion, per the F5-01 runway.
