# Refusal Template Recommended Revisions (F5-05)

Date: 2026-07-02
Rule: recommendations ONLY. `app/src/lib/qa-research/refusal-templates.json` is unchanged in this phase; owner-approved revisions land in F5-06 as a reviewed data-file diff plus template version bumps (`.v2`).

## R1. `refusal.excluded_title.v1` (Adopt with revision: voice consistency)

Current sentence 2 uses first person: "I cannot answer it from the closed corpus."
Recommended: "BenchBook.AI cannot answer it from the closed corpus."
Reason: every other template speaks in the impersonal system voice; a judicial tool should not present itself as a first-person interlocutor, especially in refusals.

## R2. `refusal.prompt_injection.v1` (Adopt with revision: remove intent attribution)

Current: "This request attempts to alter the system's operating rules. BenchBook.AI's guardrails cannot be modified from the conversation."
Recommended: "This request cannot be processed because it conflicts with the system's operating rules. BenchBook.AI's guardrails cannot be modified from the conversation."
Reason: innocent phrasings can trip GP-8; the message should describe the block, not accuse the requester.

## R3. `refusal.none_found.v1` (Adopt with revision: register)

Current closing: "Try different terms or browse the corpus directly."
Recommended: "Rephrasing the question or browsing the corpus directly may locate relevant authority."
Reason: same meaning, steadier register for the bench.

## R4. `refusal.input_invalid.v1` (Adopt with revision: framing; kind change deferred)

Current title: "Request not understood."
Recommended title: "Request could not be read." (message unchanged)
Additionally recommended for F5-06 (app change, NOT made here): route malformed input under a dedicated variant statistic so `out_of_scope` counts are not polluted by malformed submissions. Requires owner sign-off because it touches the refusal taxonomy.

## O1. `refusal.future_effective.v1` (Needs owner review: forward reference)

The permissible-help key `adjust_as_of_date_guidance` references an as-of-date control the M1 page does not expose (requests default to today; the API accepts `as_of_date` but the UI has no picker). Owner options:
(a) keep the key and add the UI control in F5-06;
(b) replace the key with `open_corpus_browsers` until the control ships;
(c) accept the forward reference as-is for internal QA.
Recommendation: (b) now, (a) when the QA cohort asks for retrospective research dates.

## O2. `refusal.model_no_support.v1` (Needs owner review: undemonstrated path)

No scripted mock profile currently produces `NO_SUPPORTED_ANSWER`, so this template has never rendered in a test run (coverage gap G3). Recommendation: add a `no_support` scripted profile plus one route test in F5-06, then sign off the text against the demonstrated rendering.

## Not recommended for change

The remaining 15 templates read as appropriately conservative, honest about withheld answers, free of legal substance, and consistent with the judicial guardrail charter. No template is recommended for rejection.

## Owner sign-off block (to be completed by the owner)

| Item | Decision (approve / amend / defer) |
|---|---|
| R1 voice consistency | |
| R2 injection tone | |
| R3 none-found register | |
| R4 input-invalid framing | |
| O1 future-effective help key | |
| O2 model-no-support demonstration | |
| Remaining 15 templates as written | |
