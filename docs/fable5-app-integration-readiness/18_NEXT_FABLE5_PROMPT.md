# 18 - Next Fable 5 Prompt (F5-03)

Copy the block below into the next Claude Fable 5 session before 2026-07-07.

---

You are Claude Fable 5 operating in Claude Code.
Project: BenchBook.AI. Repository root: `~/Projects/benchbook-ai`. Branch: `refactor/codex-gpt55-launch-prep`.

Prior context: read `docs/fable5-app-integration-readiness/19_NEXT_SESSION_START_HERE.md`, then docs 03-15 of that package. The F5-01 package under `docs/fable5-launch-acceleration/` remains the launch frame.

## Task: F5-03, local-only app integration design review and file-level implementation plan

No app code changes. Create `docs/fable5-app-integration-design/` containing:

1. `00_F503_DESIGN_REVIEW_REPORT.md`: contract-vs-codebase review verdict; any contract amendments proposed (each flagged for owner ratification under P1).
2. `01_FILE_LEVEL_IMPLEMENTATION_PLAN.md`: the exact new/changed file list for F5-04 (QA route, adapter, guardrail extension, envelope UI, boot checks, harness modules), per-file responsibilities, and the order of implementation commits on the feature branch.
3. `02_RETRIEVAL_ADAPTER_INTERFACE.md`: finalized TypeScript-level interface (documented design, not committed code) resolving G3 (text delivery: recommend RPC vs view with rationale, per owner decision P3) and G2 (DCS reference mechanism, P4).
4. `03_PROMPT_CONTRACT_FINAL_TEXT.md`: the L3 system-prompt contract full draft (structure and constraint language; no legal body text) plus refusal template texts for owner review (P6).
5. `04_BOOT_CHECKS_AND_CONFIG_SPEC.md`: env validation list (target pin, model IDs, QA-mode flag), feature-flag design (narrow-only), config file layout.
6. `05_HARNESS_MODULE_SKELETONS.md`: module-by-module design for `scripts/qa_harness/` and the Vitest wiring per F5-02 doc 12.
7. `06_F504_EXIT_CRITERIA.md`: measurable completion gate for F5-04 mapping to F5-02 docs 12/14.
8. `07_NEXT_PHASE_PROMPT.md`: the F5-04 implementation prompt (for execution only after owner approval O7-design).
9. `manifests/f503_design_manifest.json`: file inventory, sha256 hashes, `metadata_only: true`, `app_code_changed: false`.

Also create the sibling validator `scripts/launch_readiness/validate_fable5_app_integration_design.py` following the existing validator conventions (stdlib-only, concise pass/fail, secret and body-text checks, no prohibited-action claims), and run the full local validation battery.

## Constraints (unchanged, absolute)

Local-only. No Supabase or remote commands, no database contact, no reload, no embeddings, no app code changes, no migration changes, no edits to existing scripts, no source PDF access, no legal body text, nothing staged or committed (if the session runs in an ephemeral cloud container, apply the established persistence exception: commit only the new package with a clear attestation, exactly as F5-01/F5-02 did).

Stop immediately if any deliverable appears to require app code changes, database contact, or body text.

Final response: files created, validator results, prohibitions held, single next owner decision.
