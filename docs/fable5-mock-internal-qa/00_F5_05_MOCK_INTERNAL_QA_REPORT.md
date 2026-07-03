# F5-05 Report: Mock-Only Internal QA, Refusal-Template Review, PR #4 Acceptance Packet

Date: 2026-07-02
Phase: F5-05 (no-code QA phase over the F5-04 mock-only path)
Branch: `feature/qa-research-mock-only`, base HEAD `c3eef92`
App implementation code changed in this phase: NONE.

## 1. The ten phase questions, answered

1. **Are all mock-only refusal paths owner-reviewable and appropriately conservative?** YES. All 21 templates inventoried with stage usage, kinds, help actions, and test evidence; refusal paths refuse before retrieval where applicable, suppress whole drafts post-generation, resolve zero-authority to the most restrictive class, and never lock the next query (docs 03/06, `mock_refusal_exercise.json`).
2. **Are the template texts suitable for a judicial internal QA system?** LARGELY YES: 15 of 21 accepted as written, 4 minor wording lifts recommended (voice consistency, injection tone, register, input-invalid framing), 2 owner decisions (future-effective help key, undemonstrated model_no_support path). Zero rejects. Recommendations are docs-only; the JSON is untouched (doc 03).
3. **Does the mock surface cover the golden-query categories?** YES: 20/20 categories executed through the real route pipeline via the F5-04 suites; 19 PASS, 1 PASS_WITH_GAP (G1: TRJPP success is exercised in MR-03's fixture set but lacks an explicit per-family assertion) (doc 04).
4. **Does every non-refusal answer require citation metadata?** YES, doubly: the route converts citationless/unverifiable generations to refusals, and the page refuses to render answer text without a verified citation (doc 05).
5. **Does every refusal include reason, stage, and permissible next action?** YES: kind+variant+owner-reviewed message, stage enum, and non-empty permissible-help are asserted per refusal (doc 05/`mock_refusal_exercise.json`).
6. **Does every request generate an audit object?** YES: chains verified for answer, pre-retrieval refusal, zero-result refusal, conversion, and gated-class outcomes; audit failures fail closed; requests are reconstructable from sink rows alone (doc 05).
7. **Does the surface clearly disclose MOCK_ONLY and no-production status?** YES, at three layers: first SSE event (banner+chip+notice), transport header, and page frame (doc 07).
8. **What must be reviewed before PR #4 can be considered for merge?** The owner items in `pr-acceptance/pr4_required_owner_reviews.md`: template sign-off, completion evidence, M-2 demonstrations, branch policy (doc 08).
9. **What remains blocked before live adapter design or preview reload?** The full blocker set in doc 09/`remaining_blocker_manifest.json`: O1/E14-C corpus review outstanding, live adapter blocked behind O6+O2/O4+O7+P1/P2, reload blocked, embeddings blocked, gates closed, production untouched, plus G1-G3 and the template/PR-policy decisions.
10. **What should the owner decide next?** Sign the template review, choose the PR #4 branch policy, and pick the next phase: recommended F5-06 (apply approved revisions + readiness cleanup, still mock-only); alternative O1/E14-C simulation + E15-A reload planning on the launch-prep branch (docs 10/11).

## 2. What this phase produced

13 docs, 3 refusal-template review artifacts (inventory, owner review matrix covering all 21 templates, recommended revisions with sign-off block), 6 synthetic exercise artifacts, 4 PR-acceptance artifacts, 5 manifests, 4 dashboards, and `scripts/launch_readiness/validate_f5_05_mock_internal_qa.py`. All metadata-only; no legal body text; no app code changes.

## 3. QA findings register (all minor; none blocks mock-only QA use)

| # | Finding | Class | Disposition |
|---|---|---|---|
| G1 | TRJPP-family success exercised but not explicitly asserted | test coverage | F5-06 one-line test addition |
| G2 | Two pre-existing legacy typecheck errors (outside F5-04/05 files) | legacy hygiene | maintenance pass, owner-scheduled |
| G3 | `model_no_support` template never demonstrated (no scripted profile) | coverage + template review | F5-06 scripted profile + test, then sign-off |
| R1-R4 | Four template wording lifts | wording | F5-06 data-file diff after owner approval |
| O1-O2 | Future-effective help key forward-reference; input-invalid taxonomy preference | owner decision | decided in template sign-off |

## 4. PR #4 classification

**Ready for owner review and technical review. NOT ready for merge** until the refusal-template owner review is signed and the branch policy is decided (default recommendation: hold as draft until F5-06 applies approved revisions, then merge once). PR #4 remains draft; PR #3 untouched.

## 5. Verification in this phase

Full suite 226/226 green at phase start on this HEAD; all six prior validators PASS; F5-05 validator PASS; lint clean; `next build` PASS; guardrail secret scan, body-text field check, and em-dash check clean over the F5-05 folder. No Supabase command, no database contact, no reload, no rows loaded, no embeddings, no gate change, no forbidden file touched.
