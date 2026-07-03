# 03 - Refusal Template Review Report (F5-05)

Date: 2026-07-02
Source: `app/src/lib/qa-research/refusal-templates.json` (21 templates, READ ONLY this phase).
Machine artifacts: `refusal-template-review/refusal_template_inventory.json`, `refusal_template_owner_review_matrix.json`; recommendations in `refusal_template_recommended_revisions.md` with the owner sign-off block.

## Method

Each template was reviewed against: (1) substantive correctness for its refusal class; (2) judicial suitability on six tone axes (too broad / too narrow / too casual / too legalistic / too directive / insufficiently judicial); (3) leakage risk (legal substance, restricted metadata, queue details); (4) presence of a permissible next action; (5) whether the F5-04 suites actually demonstrate the template rendering (linkage in the inventory's `proven_by` fields).

## Results

| Classification | Count | Templates |
|---|---|---|
| Accept as written | 15 | general_legal_or_web, ruling_recommendation, credibility_evaluation, extra_record_facts, dcs_authority_demand, classifier_error, pending_qa_only, unknown_effectivity, restricted_lexis, citation_validation_failure, retrieval_error, internal_gate_error, target_control, audit_write_failure, leakage_suppressed |
| Adopt with revision | 4 | excluded_title (R1 voice), prompt_injection (R2 tone), none_found (R3 register), input_invalid (R4 framing) |
| Needs owner review | 2 | future_effective (O1 help-key forward reference), model_no_support (O2 undemonstrated path, gap G3) |
| Reject | 0 | none |

## Overall judgment

The template set is conservative in exactly the right places: it names material classes without leaking them, admits when answers were drafted and withheld (which is the honest posture that builds warranted trust in the citation gate), always offers a permissible next step, and never lectures. The four revisions are wording-level; the two owner items are decisions, not defects. Nothing in the set is unsafe for continued mock-only internal QA use as written.

## Systemic observations

1. **Voice**: one first-person "I" survives in excluded_title; everything else speaks as the system. R1 normalizes it.
2. **Template-key discipline works**: the route throws on unknown keys, so wording can only change through a reviewed data diff; version-bumped keys (`.v2`) will make owner-approved revisions auditable.
3. **Demonstrability**: 20 of 21 templates render in executed tests; model_no_support is the sole exception (G3), which is why it is held for owner review rather than accepted.
4. **Kind taxonomy**: input_invalid reuses `out_of_scope`; acceptable for M1, but a distinct accounting would keep scope-refusal statistics clean (R4, app change deferred to F5-06 with owner sign-off).

## What happens next

The owner completes the sign-off block in `refusal_template_recommended_revisions.md`. Approved changes are applied in F5-06 as a `refusal-templates.json` data diff with `.v2` keys plus test updates; nothing was changed in this phase.
