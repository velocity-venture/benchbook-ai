# 00 - Fable 5 App Integration Readiness Report (F5-02)

Date: 2026-07-02
Model: Claude Fable 5 (window closes 2026-07-07)
Branch: `refactor/codex-gpt55-launch-prep`; baseline HEAD `2a8cc66`
Posture: local-only. No remote command, no Supabase command, no database contact, no reload, no embeddings, no app/migration/loader/ingestion/PDF/corpus-source changes, no legal body text in any artifact.

## 1. Executive summary

F5-02 answers the question "what exactly must be true before the BenchBook.AI app may connect to the legal authority database" with binding, testable artifacts. The app surface was inventoried and classified (doc 01; the app remains fully disconnected, re-verified with zero legal_authority references). The existing chat path was audited into keep/replace lists with seven named defects the QA route must not inherit (doc 02). Nine contract specs (docs 03-11) fix retrieval, citations, refusals, guardrails, DCS/TRE scope, restricted/pending/effectivity handling, audit logging, UI labeling, and security access. Six machine-readable contracts and 57 mock-only harness scenarios make every clause testable before any database exists in the loop. Stop conditions (doc 14) and a phase plan (doc 15) bound the implementation: F5-03 design review next, F5-04 feature-branch build against a mock backend only, E15-B reload planning on the corpus side, with production, embeddings, display-gate opening, and live database connection all explicitly not next.

## 2. Deliverables created (all local)

- Docs 00-19 (20 files) in `docs/fable5-app-integration-readiness/`
- 6 contracts under `contracts/` (schema-like JSON, no executable code, no legal text)
- 6 mock-harness scenario files under `mock-harness/` (57 scenarios, metadata-only)
- 5 manifests under `manifests/`
- 5 dashboards under `dashboards/`
- `scripts/launch_readiness/validate_fable5_app_integration_readiness.py`

## 3. App surface inventory summary

35 classified surfaces (manifest mirror): the trust-shell modules (scope guard, citation validator, hallucination guard, coverage annotator), chat route plumbing, Supabase SSR stack, UI kit, and the 14-file test suite are Adopt or Adopt with revision; the flat-JSON retrieval core (`loadRelevantCorpus()`) is Reject; the old corpus build chain is Adopt-with-revision-then-Archive; voice input is Needs further review. The app has zero references to the legal_authority schema; all integration work is additive.

## 4. Validation record for this pass

| Command | Result |
|---|---|
| `validate_e13a_review_queues.py` | PASS |
| `validate_e14a_draft_artifacts.py` | PASS |
| `validate_e14b_candidate_artifacts.py` | PASS |
| `validate_fable5_launch_acceleration.py` | PASS |
| `validate_fable5_app_integration_readiness.py` (created this pass) | PASS |
| `validate_expanded_chunks_for_load.py --json` | NOT RUNNABLE in this cloud environment (gitignored `data/ingestion-expanded/` inputs exist only on the Mac Studio); attempted and failed on missing inputs exactly as expected; Codex re-proves on the Mac Studio (doc 17 step 2) |
| Local disposable DB dry run | NOT RUN here for the same missing-inputs reason; the E14B-recorded baseline stands |
| Guardrail secret/body-text scans over the new folders | CLEAN |

## 5. Top app integration blockers (full list in `manifests/integration_blocker_manifest.json`)

1. App database retrieval path not implemented (build gated on O7-design/O7)
2. Display gates closed (correct today; internal-QA tier needs E15 plus O2)
3. Preview reload not executed after patch review (needs E14C, patch tooling, O6)
4. QA signoff pending (439 versions)
5. Pending extraction QA non-display (4,198 chunks)
6. Refusal enforcement not yet app-integrated (doc 05 variant table unbuilt)
7. Citation enforcement not yet app-integrated (doc 04 levels unbuilt)
8. Audit logging not yet app-integrated (doc 09 write points unbuilt)
9. Target control not yet app-integrated (doc 10 pin/echo/banner/boot checks unbuilt)
10. Unknown effectivity blocked (54 rows) plus the standing postures: DCS production-answer authority prohibited, restricted Lexis non-display, embeddings not generated

## 6. Recommended next owner decision

From this packet: P1 (ratify the contract set) and P2 (approve F5-03 design phase), one sitting. Overall, O1 from the F5-01 packet (approve E14C corpus-admin review) remains the most time-critical signature in the program.

## 7. Compliance attestation for this pass

- Remote commands run: none. Supabase commands run: none. Preview reload executed: no. Corpus rows loaded: none. Embeddings generated: none. App files changed: none. Migrations changed: none. Existing loader scripts changed: none. Existing ingestion scripts changed: none. Source PDFs changed or read: none. Generated corpus source files changed: none (absent in this environment). Legal body text in artifacts: none. Secrets in artifacts: none.
- Staging/commit state at package completion: nothing staged, nothing committed by the analysis pass itself. If this cloud session ends with a persistence requirement (ephemeral container policy), the established F5-01 exception applies: commit only the package files with a clear attestation; the Codex prompt (doc 17) handles either arrival state.

## 8. Where to go next

Owner: doc 16, then `dashboards/owner_app_integration_dashboard.md`. Fable (before 2026-07-07): doc 18 (F5-03). Codex: doc 17. New sessions: doc 19.
