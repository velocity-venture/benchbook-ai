# 08 - Restricted, Pending, and Effectivity Handling Spec

Date: 2026-07-02
Phase: F5-02

## 1. Restricted Lexis material (2,392 chunks)

1. Database gates already exclude these rows from every displayable surface; the app adds zero code paths that could reach them (no raw selects, no service-role, no internal-QA view access from the user route).
2. If a query targets restricted material classes (annotations, commentary, case notes under a statute), the refusal RF-08 pattern applies: kind `restricted_display_only`, naming only the material class, never row metadata.
3. Any restricted row appearing in a retrieval result is a GQ-1 gate-attestation failure: internal-error refusal plus defect alert plus QA-route freeze evaluation (SC-5).
4. License review may later promote specific classes; that arrives as database metadata change plus owner approval, never as app-side logic.

## 2. Pending extraction QA material (4,198 chunks today; shrinks as E14C review executes)

Same enforcement shape as restricted: database-gated, app never compensates. Refusal variant `pending_qa_only` states the material has not passed QA review. The app must not name counts or internal queue states to end users.

## 3. Unknown effectivity (15 versions / 39 chunks)

Database-gated exclusion. Refusal variant `unknown_effectivity`. No app override.

## 4. Future-effective law (16 versions)

1. Every retrieval passes explicit `as_of_date`; RPC filters exclude future-effective versions.
2. GQ-4 re-verifies each returned row's window contains the as-of date.
3. The owner-approved template may state that a future-effective version exists (metadata-level statement, no text) when the current version is displayed; rendering future text before its date is a leakage event.
4. As-of display: every answer states the as-of date used (C14). The internal-QA UI may allow named QA users to set a historical as-of date for testing; it must never allow a future date beyond today.

## 5. QA signoff (439 versions pending)

Internal-QA display tier requires signed-off versions per owner decision O2. The app trusts the database tier; it renders `qa_signoff_status` on source cards (doc 04) and adds no signoff logic of its own.

## 6. Effectivity labeling rules (UI)

Source cards show: effective label (from version), version status (`current` only in answers), as-of date used, and a superseded-version notice when the alias resolves to a superseded version for a historical as-of query. No answer may mix versions of the same unit across different as-of bases in one response.

## 7. Test hooks

Mock scenarios RF-08 through RF-11 (restricted, pending, unknown, future), MR-09 (as-of conformity), GG-07 (GQ-4), MA-05 (audit rows for gated refusals). Fixture-tier synthetic corpus must include one row of each gated class so these paths execute end to end without real legal text.
