# 17 - Next Claude Fable 5 Prompt

Copy the block below into the next Claude Fable 5 session. Recommended timing: 2026-07-02, inside the Fable 5 availability window.

---

You are Claude Fable 5 operating in Claude Code.
Project: BenchBook.AI. Repository root: `~/Projects/benchbook-ai`. Branch: `refactor/codex-gpt55-launch-prep`.

Prior context: the 2026-07-01 Fable 5 pass produced `docs/fable5-launch-acceleration/` (read `18_NEXT_SESSION_START_HERE.md` first, then `00_FABLE5_LAUNCH_ACCELERATION_REPORT.md`, `07_APP_INTEGRATION_DEFERRAL_AND_REQUIRED_CONTRACT.md`, `09_JUDICIAL_GUARDRAIL_IMPLEMENTATION_SPEC.md`, `10_REFUSAL_AND_NO_AUTHORITY_TEST_MATRIX.md`, `11_GOLDEN_QUERY_AND_CITATION_QA_PLAN.md`, `03_LEGAL_RAG_DATABASE_AND_RETRIEVAL_AUDIT.md`).

## Task: app-integration readiness design and QA harness plan (design only, no app code changes)

Create `docs/fable5-app-integration-design/` containing implementation-grade design artifacts:

1. `00_APP_INTEGRATION_DESIGN_REPORT.md`: executive design summary.
2. `01_QA_ROUTE_ARCHITECTURE.md`: the dedicated internal-QA answer route (recommended `/api/qa-research`), request lifecycle end to end: auth tier, scope guard (L1), retrieval calls (`lookup_citation_alias`, `search_displayable_chunks`), as-of-date handling, TRE scope filtering at the app layer (decision O3 option a), prompt assembly from retrieved spans only, streaming, post-generation citation verification, audit writes (C11), response envelope with trust metadata. Resolve gaps G1 and G3 from doc 03 at the design level.
3. `02_RETRIEVAL_ADAPTER_CONTRACT.md`: TypeScript-level interface definitions (documented as design, not committed code) for the RPC adapter, including error taxonomy, timeouts, zero-row semantics mapping to refusal C4, and the rule that no adapter method can bypass gates.
4. `03_PROMPT_CONTRACT_DRAFT.md`: the L3 system-prompt contract per doc 09 section 4, with the judicial-role boundary, corpus-only grounding, refusal hooks, TRE/DCS clauses, as-of-date statement. Metadata and structure only; no legal body text.
5. `04_QA_HARNESS_ARCHITECTURE.md`: three-tier harness (mock, fixture, preview-manual) implementing docs 10 and 11: module layout under `app/src/__tests__/` and `scripts/qa_harness/`, the synthetic fixture corpus design (obviously-fake authority numbering, loaded via the existing local disposable dry-run tooling), golden-query CSV schema, scoring and burndown reporting, CI wiring plan.
6. `05_AUDIT_WIRING_DESIGN.md`: exact write points for retrieval_logs, refusal_records, answer_audit_records, citation_verification_records; hash-only production mode; reconstruction procedure.
7. `06_INTEGRATION_TEST_EXIT_CRITERIA.md`: the measurable exit gate mapping to guardrail acceptance (doc 09 section 5) and scorecard categories 20-22.
8. `07_NEXT_PHASE_PROMPT.md`: the prompt for the implementation session (Codex or approved agent) that will write the actual code once owner decision O7 is signed.
9. `manifests/app_integration_design_manifest.json`: file inventory with sha256 hashes, `metadata_only: true`, `app_code_changed: false`.

Also extend `scripts/launch_readiness/validate_fable5_launch_acceleration.py` conventions with a sibling validator for the new folder (`validate_fable5_app_integration_design.py`): required files exist, manifest parses, no secrets, no body-text columns, no file claims app code was changed.

## Constraints (unchanged, absolute)

Local-only. No Supabase or remote commands, no database contact, no reload, no embeddings, no app code changes, no migration changes, no edits to existing scripts, no source PDF access, no legal body text in any artifact, nothing staged or committed. Design may quote schema identifiers and function signatures; it may not quote statute or policy text.

Stop immediately if any deliverable appears to require app code changes, database contact, or body text.

Final response must include: files created, validator results, confirmation that all prohibitions held, and the single next owner decision you recommend.
