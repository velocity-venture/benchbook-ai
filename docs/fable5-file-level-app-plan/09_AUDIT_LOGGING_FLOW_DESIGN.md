# 09 - Audit Logging Flow Design (F5-03)

Date: 2026-07-02
Contract source: F5-02 doc 09 plus `audit_log_object_contract.json`.

## 1. M1 architecture

`AuditLogger` interface (C13) with the mock sink (C14) as the only M1 binding. The interface is written so the F5-05 real binding (security-definer RPC writes per F5-02 doc 09 section 4) drops in without route changes. Ordered-write semantics live in the ROUTE, not the logger: the route awaits `logRetrieval` before streaming begins (fail-closed MA-07 behavior), calls `logRefusal` at refusal emission, `logAnswer` after stream completion, and `logCitationVerification` with answer persistence.

## 2. Mock sink behavior

- Captures entries in an ordered in-memory array exposed to tests (`entries()`), with per-entry monotonic sequence numbers.
- Enforces the content rules at the sink boundary: rejects (throws) any entry containing a field named like the prohibited body-text set, any passage-length string over the configured cap, or an unhashed query in production mode. This makes content-rule violations fail tests structurally rather than by convention.
- `failMode` construction option throws on a chosen method to drive MA-07 (fail-closed) and defect-alert paths.
- Console output limited to hash-only single-line summaries (S4 rule), verified by a capture test.

## 3. Trace ID model

`request_id` (client-generated uuid) joins everything; the sink assigns `retrieval_log_id`, `refusal_record_id`, `answer_audit_record_id` per entry (uuids in M1). The `done` SSE event carries the ID set; the page renders the trace line (doc 07). The reconstruction drill (MA-06) walks the in-memory rows in M1 and the fixture-tier database rows in T2, using the same assertion module.

## 4. Mode handling

`production_mode` flag in the audit context: M1 tests run both modes; production mode asserts hash-only queries and hashed matched-terms; QA mode (excerpt logging) stays behind `QA_MODE_EXCERPT_LOGGING`, default off (P5), and even when on, the sink marks excerpt fields with the purge-first marker.

## 5. Test coverage (mirror: `test-plan/mock_audit_log_tests.json`)

MA-01..MA-07 plus: sink content-rule rejection tests, both-mode content tests, trace-ID propagation to the `done` event, and the audit-presence test required by the F5-03 objectives (every answer and every refusal scenario asserts its audit object exists with correct linkage).
