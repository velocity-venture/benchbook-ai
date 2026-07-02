# 16 - Owner Decision Packet (F5-02)

Date: 2026-07-02
For: Judge M.O. Eckel III

This packet contains only the NEW decisions raised by the app-integration readiness work. The F5-01 packet (O1-O8) stands unchanged; O1 (approve E14C review) remains the single most time-critical signature.

## P1. Ratify the integration contract set (RECOMMENDED: ratify)

Docs 03-11 of this package define the retrieval, citation, refusal, guardrail, scope, audit, UI, and security contracts. Ratifying makes them the binding spec for F5-04 code. Any later contract change requires a written amendment and harness re-run.

## P2. Approve F5-03 as the next execution phase (RECOMMENDED: approve)

Local-only design review producing the file-level implementation plan. No app code changes. This is the design gate before any O7 build approval and can run inside the remaining Fable 5 window.

## P3. Text-delivery mechanism preference (G3) (DECISION CAN BE DELEGATED TO F5-03 REVIEW)

Options: (a) new text-bearing security-definer RPC mirroring the existing gate predicates (preferred by this pass: single audited surface, no view-grant surface area), or (b) authenticated selects against `v_current_displayable_chunks` filtered by returned chunk ids. F5-03 will recommend concretely; you may pre-approve (a) or wait.

## P4. DCS reference surface mechanism (G2) (DELEGATE TO F5-03)

Purpose-built internal-QA reference RPC (preferred) vs gated view access. Same delegation shape as P3.

## P5. QA-mode excerpt logging (RECOMMENDED: approve, default off)

Doc 09 permits query excerpts in audit logs only in QA mode under an owner flag, default off, purge-first retention. Approving the flag's existence now avoids a later amendment; it ships off.

## P6. Refusal template review (RECOMMENDED: schedule)

Doc 05 fixes refusal template keys; the user-facing template texts need your review before F5-04 ships them. One sitting; templates arrive with the F5-03 package.

## Standing decisions re-affirmed (no action)

Production untouched; embeddings deferred; DCS reference-only; restricted Lexis non-display; display gates closed until E15 plus O2; Titles 39/40/55 and web retrieval excluded.

## The one decision to make today

Still O1 from the F5-01 packet. From this packet: P1 and P2 together (one signature line each) keep the integration track moving inside the Fable window.
