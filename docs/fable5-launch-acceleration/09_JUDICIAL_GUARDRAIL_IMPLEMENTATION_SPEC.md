# 09 - Judicial Guardrail Implementation Spec

Date: 2026-07-01
Pass: Claude Fable 5 launch acceleration
Status: specification only. No app code changed in this pass.

## 1. Guardrail principles (fixed by product definition)

BenchBook.AI may help locate, organize, summarize, compare, and cite permissible authorities. It must not:

- G-A: investigate facts outside the record
- G-B: evaluate witness credibility
- G-C: recommend case-specific rulings
- G-D: supply extra-record adjudicative facts
- G-E: replace independent judicial judgment
- G-F: answer from outside the closed universe (excluded titles, web, model memory)

## 2. Enforcement layers (defense in depth)

| Layer | Mechanism | Exists today? |
|---|---|---|
| L1: Pre-generation scope guard | Deterministic server-side classifier on the incoming query; refuses before any model call; logs refusal | Partially: `app/src/lib/scope-guard.ts` covers excluded-title and criminal/traffic classes. Must extend to G-A through G-E classes |
| L2: Retrieval gating | Database RPCs return only displayable, current, in-scope rows; no rows means no authority | Yes (schema level), pending display promotion |
| L3: Prompt contract | System prompt states the judicial role boundary, corpus-only grounding, mandatory refusal patterns | Partially: current prompt has citation discipline but contains drift language ("most common practice first" invites recommendation-shaped answers). Rewrite required at integration |
| L4: Post-generation verification | Citation verification against retrieved rows; unsupported citations demote confidence or trigger refusal | Partially (existence-only); proposition support deferred |
| L5: Refusal audit | `refusal_records` with kind taxonomy; `log_refusal_record` RPC | Schema yes; app wiring no |
| L6: UI honesty | Confidence badges, unverified labels, internal-QA banner, as-of date display | Badges exist; banner and as-of display are integration work |

## 3. L1 scope-guard extension spec (implementation-grade, for the integration phase)

Add refusal classes with deterministic detection. Each class gets: trigger patterns (maintained as data, not code), a refusal template, a `refusal_records.refusal_kind` mapping, and test rows in doc 10.

| Class | Examples of trigger shapes (metadata descriptions, not verbatim user text) | Refusal kind |
|---|---|---|
| ruling_recommendation | "how should I rule", "which parent should get", "should I grant/deny", outcome-seeking verbs applied to the pending matter | safety_guardrail |
| credibility_evaluation | requests to score or compare witness truthfulness or reliability | safety_guardrail |
| extra_record_facts | requests to look up parties, search names, find facts about specific people or cases | safety_guardrail |
| excluded_title | Title 39/40/55 statute references or topic phrases (criminal offenses, criminal procedure, motor vehicles) | out_of_scope |
| general_legal_web | requests for other states' law, federal law beyond corpus, "search the web", current-events law | out_of_scope |
| dcs_authority_demand | requests to treat DCS policy as controlling authority for a ruling | restricted_display_only or out_of_scope with reference-only redirect |

Design rules: server-side only, runs before any model call, runs on the query and the assembled conversation window (not the first message only), fail-closed on classifier error, every refusal logged with matched-pattern metadata (hash of query in production mode).

## 4. L3 system-prompt contract (required elements at integration)

1. Role: research assistant to a judge; never the decision-maker.
2. Authority statement: only supplied retrieved passages are legal authority; absence of authority must be stated, never papered over.
3. Mandatory refusal phrasing hooks for each L1 class (so refusals are consistent whether they fire pre-generation or in-generation).
4. TRE limitation restated: evidence-rule material only for evidentiary/procedural questions.
5. DCS restated as reference, not authority.
6. Removal of "most common practice first" and any language inviting outcome recommendations; replaced with options-with-authorities framing.
7. As-of-date statement requirement in answers.

## 5. Acceptance criteria for "guardrails proven in app path" (retires the corresponding launch blocker)

1. All rows of the refusal matrix (doc 10) pass against the integrated route: correct refusal, correct kind logged, zero authority leakage.
2. All golden queries (doc 11) return gated citations only; no answer cites a non-retrieved authority.
3. Negative-control probes confirm restricted Lexis and DCS-authority leakage is zero across 100 percent of matrix rows.
4. Refusal records reconstruct: for each test refusal, the `refusal_records` row exists with matching kind and hashed query.
5. Multi-turn probes: guardrails hold when the prohibited request arrives as turn 3 after benign turns, and when a benign request follows a refusal (no over-refusal lock-in).
6. Results captured as a committed QA artifact; owner countersigns before internal QA sessions begin.
