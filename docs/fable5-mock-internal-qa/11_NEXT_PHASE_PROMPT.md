# 11 - Next Phase Prompt (post-F5-05)

Date: 2026-07-02. Execute ONLY after the owner completes the review packet (doc 10): template sign-off, PR #4 policy, phase selection. Neither option below touches live databases, embeddings, display gates, or production; do not propose those as immediate next steps.

## Recommended next: F5-06 (apply approved revisions + PR #4 readiness cleanup, mock-only)

---

You are working in the BenchBook.AI repository on branch `feature/qa-research-mock-only`.

Owner sign-off from `docs/fable5-mock-internal-qa/refusal-template-review/refusal_template_recommended_revisions.md` is complete (attach the completed table). Execute F5-06: apply the APPROVED items only, still 100% mock-only. All F5-04/F5-05 strict prohibitions remain in force verbatim (no Supabase commands or connections, no live databases, no embeddings, no display gates, no migration/loader/ingestion/PDF/corpus-source edits, no legal body text, no secrets, PR #3 and PR #4 remain draft, no merges by the session).

Authorized changes, exhaustively:
1. `app/src/lib/qa-research/refusal-templates.json`: apply owner-APPROVED wording revisions as new `.v2` template keys (keep `.v1` keys until the route references are updated in the same commit); update route/tests referencing revised keys.
2. Tests only: add the explicit TRJPP-family success assertion (G1); add a `no_support` scripted profile to the mock model client plus one route test demonstrating `model_no_support` (G3; this touches mock-model-client.ts, a mock test fixture module, per owner approval of O2).
3. If R4's taxonomy change was approved: implement the input-invalid accounting change per the owner's chosen shape.
4. Docs: `docs/fable5-mock-template-revisions/` completion report + manifest; extend the F5-05 validator or add an F5-06 validator.

Gates at every commit: full suite green (existing + new), lint clean, `npx next build` green, guardrail diff scan clean, no diff outside the list above (SC-11). Commit to `feature/qa-research-mock-only` with message `Apply owner-approved refusal template revisions`; push; keep PR #4 draft; refresh the PR body noting the revisions landed.

---

## Alternative: corpus track (O1/E14-C review simulation + E15-A reload planning)

---

You are working in the BenchBook.AI repository. Switch to branch `refactor/codex-gpt55-launch-prep` (do NOT touch the feature branch). Execute the O1/E14-C corpus-admin review simulation and E15-A preview reload PLANNING phase, local-only and metadata-only, per `docs/fable5-launch-acceleration/` docs 14-16 and the F5-01 owner decision packet (O1 remains the critical path). Absolute prohibitions unchanged: no database contact of any kind, no reload EXECUTION (planning artifacts only), no loader/ingestion/migration/PDF/corpus-source modifications, no embeddings, no display-gate changes, no legal body text, no secrets. Outputs: review-simulation artifacts and a reload-readiness packet under `docs/`, a local validator, full validation battery, commit to the launch-prep branch, push, PR #3 stays draft.

---

## Sequencing note

The two options are independent tracks on different branches. If the owner wants maximum program velocity, the corpus track is the critical path; F5-06 is a small, fast cleanup that closes out PR #4. Doing F5-06 first (hours) and then the corpus track is the recommended order.
