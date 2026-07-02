# 07 - UI Guardrail and Refusal Flow Design (F5-03)

Date: 2026-07-02
Applies to: `app/src/app/(dashboard)/qa-research/page.tsx` (future M1 file). The legacy chat page is untouched.

## 1. Persistent frame elements (always visible)

| Element | Content | Source |
|---|---|---|
| Environment banner | "MOCK ONLY - SYNTHETIC DATA - NOT FOR JUDICIAL RELIANCE" in M1; "INTERNAL QA - NOT FOR JUDICIAL RELIANCE" once the preview tier exists | `environment` SSE event; absence is stop condition SC-7 |
| Target chip | `MOCK_ONLY` label plus tier | Same |
| No-production notice | Static footer line: this build cannot connect to production | environment module constant |
| As-of indicator | The as-of date every retrieval used | Response envelope |

## 2. Answer presentation (citation-required)

- Answer text renders only when at least one `citations` event delivered a verified citation object; otherwise the page shows the refusal presentation even if delta text arrived (server converts first; the page enforces defensively second, C13 narrowing rule).
- Source cards render the doc 04 field set: canonical citation (with SYNTHETIC marker in M1 fixtures), family label, scope tag (TRE evidentiary, DCS reference-only), effectivity label plus as-of, page span, verification badge (verified_retrieved full badge; verified_resolved distinct "resolved" badge; unresolved renders in the warnings list, never as a card), QA signoff status, environment tier.
- Envelope separation: `answer_support` cards under the answer; `reference_material` cards in a visually distinct, labeled section ("Reference material - not controlling authority"); reference cards never intermix with support cards.
- Audit trace: the `done` event's audit IDs render as a small "Trace" line (retrieval log ID, answer audit ID) so QA participants can quote them in findings.

## 3. Refusal presentation

- Refusal responses render inside a distinct refusal panel (not styled as an answer): refusal title from the template, explanation text, the permissible-help list as actionable links (corpus browsers, rephrase guidance), and the refusal trace ID.
- Confidence badge shows LOW with the standing warning "this is a refusal, not a legal answer" (carrying over the existing scope-guard presentation).
- Kind-specific notices: DCS guardrail-only notice (offers the reference card when one exists), TRE limited-scope notice (explains evidentiary-scope limitation), restricted/pending/effectivity blocked notices (state the material class only), excluded-title and web/general notices (restate the closed universe).
- The input box remains enabled after every refusal (no lock-in; GG-11 behavior).

## 4. Streaming states

Pre-first-event skeleton with the banner already visible; delta streaming with a "verification pending" marker on the citations area until `citations` arrives; post-`done` settle. On `error`: user-safe message, trace ID when available, no partial answer styled as complete.

## 5. Accessibility and courtroom ergonomics

Banner and scope tags must not rely on color alone (text labels always); refusal panel is screen-reader labeled; all existing chat page ergonomics (copy button, bookmarking) carry over for answers but are disabled on refusal panels (nothing to rely on).

## 6. Test hooks

ME suite (banner, chip, echo), plus page-level assertions folded into the six scenario suites via component tests where the page renders scenario envelopes (design keeps the page a pure renderer of SSE events, so envelope-driven component tests cover it without a browser).
