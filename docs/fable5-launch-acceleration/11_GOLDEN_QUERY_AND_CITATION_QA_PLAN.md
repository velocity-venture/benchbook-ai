# 11 - Golden Query and Citation QA Plan

Date: 2026-07-01
Pass: Claude Fable 5 launch acceleration
Nature: metadata-only plan. No legal body text. Golden queries are defined by category, target authority identifiers, and expected behavior; the concrete query texts get authored by the corpus admin during harness build so they reflect real bench phrasing.

## 1. Purpose

The refusal matrix (doc 10) proves the system says no correctly. The golden-query set proves it says yes correctly: right authority, right citation form, right version, right scope label, right confidence, reconstructable audit trail.

## 2. Golden set composition (target: 60-90 queries at build time)

| Block | Count | Definition |
|---|---:|---|
| GB1 Title 37 core bench topics | 15-20 | Detention criteria and timing, appointed counsel, transfer, dispositions, permanency, records sealing. Each query pinned to an expected authority_unit (by canonical citation) and expected chunk family |
| GB2 Title 36 core topics | 10-15 | Custody, parenting plans, support, dependency-adjacent family provisions in corpus |
| GB3 TRJPP procedure | 10-12 | Rule-number and topic phrasing variants; expected rule units |
| GB4 TRE evidentiary (in-scope) | 8-10 | Hearsay, admissibility, expert proof, judicial notice; expected TRE units with limited-scope labeling verified |
| GB5 DCS reference lookups | 6-8 | Staged DCS topics; expected REFERENCE cards, never authority |
| GB6 Citation-form direct lookups | 10-15 | The same authority asked by: full T.C.A. form with section symbol, without symbol, spacing variants, chapter-part phrasing, TRJPP vs Tenn. R. Juv. P. forms. Verifies alias coverage (doc 04, A2) |
| GB7 Effectivity probes | 4-6 | Topics with known superseded or future-effective versions (from the effectivity queues once resolved); verifies as-of behavior and version labeling |
| GB8 Cross-family disambiguation | 4-6 | Queries whose terms straddle families (for example custody terms appearing in both titles); verifies ranking and family labeling, no cross-family citation confusion |

## 3. Per-query expected-result record (schema for the harness)

Each golden query row records, metadata only:

- query_id, block, phrasing_variant_id
- expected_family, expected_unit_citation(s) (canonical form), acceptable_alternates
- expected_response_class (ANSWER or REFERENCE), expected_scope_label
- expected_as_of behavior, expected_version_status
- required_source_card_fields (per doc 04 section 4)
- confidence_floor (HIGH for direct lookups, MEDIUM acceptable for topical searches)
- audit_assertions: retrieval_log row exists; answer_audit row exists; every displayed citation has a citation_verification_record with display_allowed true

## 4. Scoring

- Citation accuracy: displayed citation resolves to the expected unit (or documented acceptable alternate). Target 100 percent on GB1/GB6; at least 90 percent on topical blocks at first run, with misses triaged into alias additions or retrieval tuning tickets.
- Grounding: zero answers citing a non-retrieved authority (hard fail).
- Scope labeling: 100 percent (hard fail on any DCS-as-authority or unlabeled TRE answer).
- Latency: recorded, not gated, during internal QA.
- Every failure gets a disposition: alias gap, metadata gap, retrieval ranking, prompt defect, or guardrail defect, feeding the burndown dashboard.

## 5. Execution tiers and cadence

1. Fixture tier (synthetic corpus): the harness mechanics and audit assertions run in CI on every integration change.
2. Preview tier (real corpus, post-reload, internal-QA display tier): full golden set run before the first internal QA session, then weekly during internal QA, then after any corpus reload or prompt change.
3. Regression lock: once a query passes on preview, a later failure blocks further internal QA sessions until triaged.

## 6. Build order (feeds the runway, doc 14)

1. Corpus admin authors query texts per block (needs no code; a CSV in the harness format).
2. Codex builds the harness runner: mock tier first, fixture tier second (depends on the patch tooling and disposable-DB fixtures), preview tier last (depends on E15 and O2).
3. First full preview run is the final gate before internal QA launch (scorecard categories 21-22).
