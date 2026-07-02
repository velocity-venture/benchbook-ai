# 02 - Closed-Universe Architecture Audit

Date: 2026-07-01
Pass: Claude Fable 5 launch acceleration

This audit classifies every major repository area with a launch-practical eye. Classifications: Adopt, Adopt with revision, Archive, Reject, Needs further review (NFR). It builds on the 2026-06-10 architecture review (`docs/architecture-review/11_COMPONENT_CLASSIFICATION_TABLE.md`) and updates it for everything Phases A through E14B changed.

## 1. The two-stack reality

The repository currently contains two parallel systems:

- **Stack A (shipping app):** Next.js 14 edge app answering from a build-time flat-JSON corpus (`app/src/lib/legal-corpus-data.json`, TNCODE Release 76, 2021). It has a strong trust shell (scope guard, citation validator, hallucination guard, coverage annotator, confidence UI) wrapped around a disqualified evidence base. Its default model IDs are invalid and its context-stuffing retrieval cannot work at production scale. It has zero references to the new schema.
- **Stack B (closed-universe pipeline):** source manifest, PDF ingestion, `legal_authority` schema with deny-by-default gates, preview corpus (6,590 chunks, 0 displayable), metadata remediation queues and candidate artifacts. It has never been connected to any app.

The internal QA launch path is: remediate Stack B metadata, reload preview with approved patches, then connect a QA-labeled app path to Stack B under the contract in doc 07. Stack A's trust shell is the right code to carry over; Stack A's corpus and retrieval are already formally rejected.

## 2. Classification table (updated for E14B state)

### Closed-universe pipeline (Stack B)

| Area | Path | Classification | Rationale and required action |
|---|---|---|---|
| Source-of-record manifest | `data/source-manifest/` + `scripts/source_manifest/build_source_manifest.py` | **Adopt** | 677 hashed rows, classification fields, dup groups. The provenance backbone. Keep regenerating only from the Mac Studio source folder. |
| Expanded ingestion | `scripts/ingestion/run_expanded_ingestion.py` | **Adopt** | Manifest-driven, hash-verified, marks Lexis-restricted and pending-QA statuses at extraction time. Do not modify during this pass window. |
| Pilot ingestion | `scripts/ingestion_pilot/` | **Archive** | Superseded by expanded ingestion. Keep for provenance history only. |
| Chunk static validator | `scripts/database_load/validate_expanded_chunks_for_load.py` | **Adopt** | The single most load-bearing QA script. Runs only on the Mac Studio (inputs gitignored). |
| Local dry-run loader | `scripts/database_load/dry_run_load_legal_authority.py` | **Adopt** | Strictly local by construction (refuses non-local hosts). Proven E4-E14B. |
| Preview SQL builder | `scripts/database_load/build_preview_corpus_load_sql.py` | **Adopt with revision** | Correctly refuses to write body-text SQL into the repo. Revision needed later: E15 reload must regenerate SQL from patched metadata, and the baked-in expected counts must be updated by the patch outcome. Not in this pass. |
| Metadata QA validators | `scripts/metadata_qa/*.py` | **Adopt** | Pure-stdlib, no network, body-text prohibitions enforced. All three pass at HEAD. |
| E13A queues / E14A templates / E14B candidates | `docs/preview-corpus-e13*`, `docs/preview-corpus-e14*` | **Adopt** | Validated, metadata-only, counts reconcile end to end (8,275 candidate rows). This is the work queue for the corpus admin. |
| Draft migrations | `supabase/migrations_draft/` | **Adopt** | Local dry-run input set. Leave untouched. |
| Preview migrations | `supabase/migrations_preview/` | **Adopt** | Applied to preview in E8. Leave untouched; see migration-history caveat (doc 06). |
| E6 rehearsal migrations inside `supabase/migrations/` | `supabase/migrations/20260619*` | **Needs further review** | Their placement in the default migrations directory is the root of the migration-history hazard: any future `supabase db push` would try to apply them. They must be fenced (moved or explicitly excluded) before anyone runs a push. Owner decision; do not move files in this pass. |
| Authority schema design docs | `docs/database-design/` | **Adopt** | Matches implemented schema. |
| Phase E documentation chain | `docs/preview-*`, `docs/database-*`, `docs/migration-readiness/`, `docs/local-migration-rehearsal/` | **Adopt** | The audit trail is a launch asset. Index needed eventually, not now. |

### Shipping app (Stack A)

| Area | Path | Classification | Rationale |
|---|---|---|---|
| Trust pipeline modules | `app/src/lib/{scope-guard,citation-validator,hallucination-guard,corpus-coverage}.ts` | **Adopt with revision** | The architecture to keep. Revision: re-point evidence base from flat JSON to `legal_authority` RPCs; extend refusal classes per doc 09. No app changes in this pass. |
| Chat route plumbing | `app/src/app/api/chat/route.ts` (auth, validation, SSE, rate limiting) | **Adopt with revision** | Solid plumbing. Known defects to fix at integration time: invalid default model IDs, fail-open vs fail-closed rate-limit inconsistency between branches, context-stuffing retrieval (rejected). |
| Flat-JSON corpus | `app/src/lib/legal-corpus-data.json` | **Reject** (as authority) | 2021 snapshot, formally disqualified 2026-06-10. Demo-only until replaced. |
| Context-stuffing retrieval | `loadRelevantCorpus()` in chat route | **Reject** | Exceeds context limits, unauditable, misses authorities. Replaced by RPC retrieval at integration. |
| Old corpus build chain | `scripts/prebuild-corpus.js`, `scripts/validate-corpus.js`, `legal-corpus/` | **Adopt with revision, then Archive** | Still the shipping build input, so it cannot be deleted yet. Its silent stale-preserve fallback remains a staleness machine; retire the whole chain at app integration. |
| Test suite | `app/src/__tests__/` | **Adopt** | Strong. Extend with golden-query and refusal tests per docs 10 and 11. |
| Supabase app schema (auth, chat, rate limit, seats, trust metadata) | `supabase/migrations/2026020*-20260501*` | **Adopt** | RLS-correct and orthogonal to the authority schema. |
| Case-management tables | `cases`, `hearings`, `documents`, etc. | **Deferred / NFR** | Out of V1 closed universe. Exclude from any internal QA surface. |
| Legacy RAG stack | `scripts/ingest_local.py`, `scripts/search_server.py`, `scripts/deploy_rag.sh`, `scripts/deploy_infra.sh`, `benchbook-ai-infra/` | **Archive** | OpenAI/Pinecone era. Never run again; contradicts pgvector/Postgres target. |
| Deploy scripts | `scripts/deploy-production.sh`, `deploy_supabase.sh`, `setup_supabase.sh` | **Adopt with revision** | App-stack only. Must gain target-control guards (doc 13) before any use during the integration era. |
| Historical root docs | `COMPLETION_PLAN.md`, `PHASE1_COMPLETE.md`, `OVERNIGHT-LOG.md`, etc. | **Archive** | Stale era; mislead future agents. Move under `docs/history/` in a later approved cleanup. |
| Controlling briefs | `CODEX-SOURCE-OF-TRUTH.md`, `CODEX-BRIEF.md` | **Adopt with revision** | Still controlling for product scope, but written before the corpus rebuild: they do not yet name TRE limited scope, DCS guardrail-only, or the legal_authority pipeline. Owner should amend rather than let drift stand. |

## 3. Skeptical findings (things prior work has not said out loud)

1. **The two stacks share nothing but Supabase auth.** No code path exists from the app to the new corpus. That is correct for safety today, and it also means "app integration" is a real build, not a wiring task. Doc 07 sizes the contract.
2. **The E6 rehearsal migrations sitting in `supabase/migrations/` are a loaded trap.** Any casual `supabase db push` from the app-deploy playbooks would attempt to apply legal_authority DDL wherever the CLI is linked. The prohibition list protects this pass; a file-level fence is required before integration-era work (owner decision O5 in doc 15).
3. **`black_letter_eligible` semantics vs Lexis licensing needs a written owner ruling.** Statute text from Lexis-exported PDFs is displayed as black letter only if the license review concludes black-letter text is unrestricted. The schema supports either outcome; no doc records the ruling yet (owner decision O4).
4. **The old app corpus remains live in the shipping build.** Until integration, every deploy of Stack A re-ships 2021 law behind the trust UI. The interim mitigations (demo-only labeling) are documented but not enforced by code. Listed as risk R7 in the risk section of doc 08.
5. **Stack A's chat history trims via prompt-time selection; the golden-query harness (doc 11) must therefore test the DB-backed path directly, not through Stack A behavior.**

## 4. Verdict

The closed-universe architecture is sound and consistently enforced at the database layer: deny-by-default column values, gate-filtering views and security-definer RPCs, no raw chunk read policy, audit tables designed for reconstruction. Nothing in the schema blocks internal QA launch. The launch blockers are metadata states (identity, effectivity, QA signoff, extraction QA), owner decisions, and the absence of the app-side integration and QA harness. Those are enumerated in `manifests/launch_blocker_manifest.json` and sequenced in doc 14.
