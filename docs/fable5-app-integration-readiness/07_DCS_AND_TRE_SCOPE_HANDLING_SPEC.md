# 07 - DCS and TRE Scope Handling Spec

Date: 2026-07-02
Phase: F5-02

## 1. Fixed facts the app must respect

| Family | Corpus rows | answer_scope (seeded) | Launch posture |
|---|---:|---|---|
| dcs_policies_procedures | 2,014 chunks | guardrail_reference_only | Reference cards only; production-answer authority prohibited; 1,146 document-anchored chunks additionally unmapped |
| tenn_rules_evidence (TRE) | 533 chunks | limited_evidentiary_procedural | Answer authority ONLY for evidentiary/procedural questions |

## 2. TRE handling (compensates for RPC gap G1 until owner decision O3's RPC revision lands)

1. GP-9 classification labels each request's `answer_scope_intent`. Evidentiary intent requires explicit evidentiary/procedural topic signals (admissibility, objections, hearsay, offers of proof, expert proof, judicial notice, privileges, burdens applied to evidence questions). Ambiguity resolves to non-evidentiary.
2. Family filter behavior: tenn_rules_evidence is included in `family_filter` only when intent is evidentiary_procedural. For general queries the family is excluded at request time, so TRE rows cannot even be returned.
3. Defense in depth: GQ-2 re-checks results and drops any TRE row present without evidentiary intent (protects against classifier drift and future RPC changes).
4. Rendering: TRE citations always carry the evidentiary-scope tag (doc 04). A TRE-supported answer states its evidentiary framing.
5. Reference use: for non-evidentiary queries where the user explicitly asks what TRE says, the reference envelope (section 4) may surface TRE metadata cards without answer authority, per owner-approved template.

## 3. DCS handling

1. DCS rows never enter the answer envelope. GQ-2 diverts any DCS row to the reference envelope.
2. Reference cards render policy identifiers and metadata with the fixed label "DCS reference material, not controlling authority" and never merge into answer prose.
3. GP-8 patterns catch requests demanding DCS-as-authority; response explains the reference-only posture and offers the reference card plus any statute/rule authority that does govern the topic.
4. The 1,146 document-anchored chunks remain guardrail-only regardless of any future per-row mapping approvals; mapping changes arrive only through owner-approved metadata patches, never app logic.
5. DCS reference retrieval mechanism: pending G2 resolution (purpose-built internal-QA RPC vs gated view). The F5-03 design must pick one; service-role access from the request path is prohibited either way.

## 4. Envelope separation (the structural rule)

The response carries two disjoint containers: `answer_support[]` (citations with answer authority: statutes, juvenile rules, in-scope TRE) and `reference_material[]` (DCS cards, out-of-intent TRE cards). UI renders them in visually distinct sections. Anything in `reference_material` is excluded from confidence computation inputs and from the mandatory-citation requirement of doc 04 (an answer supported only by reference material is a refusal or a pure reference response, never a cited legal answer).

## 5. Test hooks

Mock scenarios: MR-04/MR-05 (TRE in/out of scope), MR-06 (DCS reference lookup), RF-07 (DCS authority demand), MC-06/MC-07 (scope tags), GG-06 (GQ-2 divert). Golden blocks GB4/GB5 (F5-01 doc 11) exercise the same rules against the reloaded preview later.
