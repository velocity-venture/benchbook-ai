# 06 - Contract Validation Design (F5-03)

Date: 2026-07-02

How M1 proves, continuously, that the implementation matches the six F5-02 contracts.

## 1. Type-level enforcement

`lib/qa-research/types.ts` is hand-written to mirror the contracts, and a dedicated test (`qa-route-static-safety.test.ts`, contract-shape section) loads each contract JSON from the synced scenario directory and asserts that every `required_fields` entry exists as a non-optional property produced by the corresponding builder function. Drift between contract JSON and types fails CI.

## 2. Runtime envelope validation in tests

Each scenario suite validates full response envelopes, not spot fields:

- retrieval responses: all required fields present; `gate_attestation` all-true on success paths; `gated_chunk_passage` present at runtime but ABSENT from every audit entry the mock logger captured.
- citation objects: field-complete per contract; verification level correctness per scenario; no model-generated citation strings (asserted by comparing against fixture canonical citations).
- refusal objects: kind within the six-kind schema enum; variant per the doc 05 table; template key resolves in `refusal-templates.json`; permissible_help non-empty.
- guardrail decisions: checks_run ordering matches the GP/GQ/GA series definition; fail-closed on injected classifier error.
- audit entries: exact write order per scenario expectations (MA suite); hash-only content in production-mode entries.

## 3. Scenario synchronization (single source of truth)

The six F5-02 mock-harness JSONs remain canonical under `docs/fable5-app-integration-readiness/mock-harness/`. M1 copies them into `app/src/__tests__/qa-research/scenarios/` (test-runner locality, edge-safe imports) and `scenario-sync.test.ts` asserts SHA-256 equality file by file against the docs copies. Editing scenarios in either place without syncing fails CI; scenario changes are therefore reviewable doc changes.

## 4. Negative-space validation (what must NOT exist)

The static-safety suite (mirror: `test-plan/no_general_fallback_tests.json` and `excluded_scope_tests.json`) proves by source inspection of the new module graph plus route:

- no import of `legal-corpus-data.json`, `tca-data.ts`, `trjpp-data.ts`, `dcs-data.ts`
- no import from `@supabase/*` anywhere under `lib/qa-research/`
- no string matching database URL schemes or service-role naming
- no embeddings API usage
- no `loadRelevantCorpus` reference
- excluded-title patterns present in guardrail data and firing (behavioral tests in the RF suite)

## 5. Amendment discipline

Contracts were drafted pending owner ratification (P1). If F5-04 implementation discovers a needed contract change, the change lands FIRST in the F5-02 contract JSON plus spec doc (with owner sign-off per the amendment rule), THEN in `types.ts` and scenarios. The sync tests make the ordering enforceable.
