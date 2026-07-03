# PR #4: Do Not Merge Until (F5-05)

Date: 2026-07-02. PR #4 stays DRAFT until every line below is checked. This list is the merge gate; the acceptance checklist tracks the wider review.

## Hard blockers (owner action required)

- [ ] Owner has signed the refusal-template review (the sign-off block in `refusal_template_recommended_revisions.md`): all 21 templates dispositioned (accept / amend / defer per item).
- [ ] Owner has chosen the branch policy (hold-until-F5-06 vs merge-now vs long-running); recommendation is hold until F5-06 applies approved revisions so templates merge already-reviewed.
- [ ] Owner has acknowledged the three documented gaps (G1 TRJPP assertion, G2 legacy tsc cleanup, G3 model_no_support demonstration) as accepted or scheduled for F5-06.

## Conditional blockers (only if the owner amends templates)

- [ ] F5-06 has applied the approved template revisions with `.v2` keys, updated the template-key tests, and the full suite is green again.

## Non-blockers (explicitly do NOT hold the merge for these)

- O1/E14-C corpus review, preview reload, embeddings, live adapter design: corpus-side workstreams independent of this mock-only code.
- The two pre-existing legacy typecheck errors: predate the branch and belong to a maintenance pass.
- PR #3 status: it tracks the base branch and is unaffected.

## Never conditions (these do not unlock via this list)

- PR #4 must never be marked ready or merged by an automated session; the owner performs or explicitly directs the merge.
- Merging never enables any flag, connects any database, or opens any gate; those remain separate owner decisions with their own gate chains.
