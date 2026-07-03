# PR #4 Required Owner Reviews (F5-05)

Date: 2026-07-02. What Judge Eckel personally must look at before PR #4 can leave draft, in reading order with time estimates.

## 1. Refusal template texts (~15 minutes; the P6 commitment)

File: `app/src/lib/qa-research/refusal-templates.json` (21 templates).
Review aid: `docs/fable5-mock-internal-qa/refusal-template-review/refusal_template_owner_review_matrix.json` and `refusal_template_recommended_revisions.md` (R1-R4 wording lifts, O1-O2 decisions, sign-off block included).
Question to answer: is each user-facing refusal appropriate for judges in an internal QA setting?

## 2. The completion evidence (~10 minutes)

`docs/fable5-mock-app-implementation/00_F5_04_MOCK_APP_IMPLEMENTATION_REPORT.md` (what was built, the 12 objectives table, 6 recorded deviations) and `docs/fable5-mock-internal-qa/00_F5_05_MOCK_INTERNAL_QA_REPORT.md` (this phase's QA verdicts).

## 3. The M-2 policy demonstrations (~5 minutes)

- Demotion: MC-02 shows a resolved-but-not-retrieved citation renders the distinct "resolved" badge and caps confidence at MEDIUM.
- Access hook: `accessCheck` defaults to allow-all-authenticated in M1; it is the single tightening point named for any future live target.
- Flag defaults: everything defaults off; enabling the surface requires three explicit environment values.

## 4. Branch policy decision (~2 minutes)

Options:
(a) HOLD PR #4 as draft until F5-06 applies the approved template revisions, then merge once (recommended: one review cycle, templates land reviewed);
(b) merge PR #4 into the launch-prep branch now and land template revisions as a follow-up PR;
(c) keep the feature branch long-running through the QA exercise period.
Recommendation: (a).

## Explicitly NOT requiring owner review

Test internals, fixture wording (synthetic placeholders), validator code, and dashboard formatting: covered by technical review. Nothing in PR #4 touches corpus data, gates, migrations, or deployment, so no corpus-side or infrastructure review is triggered.
