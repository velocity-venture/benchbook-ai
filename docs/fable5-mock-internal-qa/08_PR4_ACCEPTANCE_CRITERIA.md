# 08 - PR #4 Acceptance Criteria (F5-05)

Date: 2026-07-02
Machine mirror: `manifests/pr4_acceptance_manifest.json`; working artifacts under `pr-acceptance/`.

## Classification decision

Of the four possible classifications (not ready for merge; ready for owner review only; ready for technical review only; ready for guarded merge after specific conditions), PR #4 is classified:

**READY FOR OWNER REVIEW AND TECHNICAL REVIEW; NOT READY FOR MERGE** until (a) the refusal-template owner review is signed and (b) the branch policy is decided.

## Why this classification

- Everything a technical reviewer needs is green and evidenced: 226/226 twice at F5-04 close and re-verified at F5-05 start, 57/57 scenarios, build/lint clean, validators pass, diff confined to the documented map, no forbidden path touched, no live path representable.
- Everything an owner reviewer needs is packaged: template review matrix with per-template reasoning, M-2 demonstrations, gap register (G1-G3), and a sign-off block.
- What is genuinely missing is OWNER JUDGMENT, not engineering: 6 of 21 templates carry recommendations or decisions, and the merge-vs-hold branch policy is the owner's call. Merging before that review would put unreviewed user-facing refusal text on the launch-prep branch, contradicting the P6 commitment.

## The acceptance criteria themselves

Technical criteria (all currently met) and owner criteria (all currently pending) are enumerated in `pr-acceptance/pr4_acceptance_checklist.md`; the strict merge gate is `pr-acceptance/pr4_do_not_merge_until.md`; the required owner reading list with time estimates is `pr-acceptance/pr4_required_owner_reviews.md`; the controls that survive the merge are in `pr-acceptance/pr4_post_merge_controls.md`.

## Standing rules restated

PR #4 remains DRAFT; no session marks it ready or merges it; the merge target is `refactor/codex-gpt55-launch-prep` (never main directly); PR #3 is unaffected. If the owner amends templates, F5-06 applies them and the suite must be green again before the gate re-opens.
