# 10 - Owner Review Packet (F5-05)

Date: 2026-07-02
For: Judge M.O. Eckel III. Everything needing your judgment from F5-04/F5-05, in one place, ~30 minutes total.

## Decision 1: Refusal templates (P6 sign-off) - ~15 min

Open `docs/fable5-mock-internal-qa/refusal-template-review/refusal_template_recommended_revisions.md` beside `app/src/lib/qa-research/refusal-templates.json`.

- 15 templates: recommended ACCEPT as written.
- 4 wording lifts (R1 system voice, R2 injection tone, R3 register, R4 input-invalid framing): approve, amend, or decline each.
- 2 decisions: O1 (the future-effective refusal offers as-of-date guidance the page does not yet expose: reword the help entry now, or build the date control in F5-06); O2 (the model_no_support text has never rendered in a test; approve after F5-06 demonstrates it, or accept on faith now).

Complete the sign-off table at the bottom of that file.

## Decision 2: PR #4 branch policy - ~2 min

PR #4 (mock-only QA path, draft) is technically green across the board (226/226, 57/57 scenarios, build/lint/validators clean). Recommendation: HOLD as draft until F5-06 applies your approved template revisions, then merge once into the launch-prep branch. Alternatives: merge now with revisions as a follow-up, or keep it long-running through the QA period.

## Decision 3: Next phase - ~2 min

- **Recommended: F5-06** (apply approved template revisions, add the three small coverage items G1/G3 and the R4 taxonomy change if approved, still 100% mock-only, on this same branch).
- **Alternative: corpus track** (O1/E14-C corpus-admin review simulation and E15-A preview reload PLANNING, local-only, on the launch-prep branch). This is the program's critical path and can run before, after, or instead of F5-06; the two tracks do not conflict.
- NOT proposed as next: live adapter, embeddings, gate changes, production anything.

## For context only (no action)

- QA verdicts: all ten phase questions answered YES with three minor gaps (G1 test assertion, G2 legacy tsc cleanup, G3 undemonstrated template); no app-code defect found; nothing changed in app code this phase.
- The mock surface can be exercised hands-on anytime: set the three QA env values locally and open /qa-research; every response is SYNTHETIC-labeled and audited.
- Preview corpus remains fully gated (0 displayable, 0 embeddings); production untouched; PR #3 remains the launch-prep tracking draft.
