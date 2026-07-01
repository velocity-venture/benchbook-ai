# 03 - Legal RAG Database and Retrieval Audit

Date: 2026-07-01
Pass: Claude Fable 5 launch acceleration (read-only; no database contact in this pass)

Evidence base: `supabase/migrations_preview/*.sql` (read locally), Phase E8-E13B recorded results, E14B dry-run baseline. No remote query was executed during this pass.

## 1. Schema fitness for a closed-universe legal RAG

The `legal_authority` schema is well matched to the product's trust requirements:

| Requirement | Mechanism | Assessment |
|---|---|---|
| Provenance | `corpus_builds` (manifest and chunk JSONL SHA-256), `source_files.sha256`, `source_file_memberships` for DCS duplicate paths | Strong. Every chunk traces to a hashed source file and build. |
| Authority identity | `authority_units` with canonical/normalized citation, hierarchy, identity check constraint | Strong, with 38 known unresolved-identity rows queued. |
| Versioning and effectivity | `authority_versions` (valid_from/valid_to, version_status enum incl. `future_effective` and `unknown_effectivity`, supersedes chain, QA-signoff flags) | Strong. 15 unknown-effectivity and 16 future-effective versions correctly quarantined. |
| Display gating | `production_display_status` (NOT NULL, no default), `approval_status` default `pending_extraction_qa`, `retrieval_display_gate` default `deny_until_approved`, `black_letter_eligible` default false | Deny-by-default at the column level. Correct. |
| Scope control | `answer_scope` enum: `general_answer_authority`, `guardrail_reference_only` (DCS), `limited_evidentiary_procedural` (TRE), `internal_qa_only`, `not_answer_authority` | Correct and seeded per family. |
| Retrieval surface | `v_current_displayable_chunks`, `v_black_letter_current_chunks`, `v_internal_qa_restricted_chunks`; security-definer RPCs `lookup_citation_alias(p_normalized_alias, p_as_of_date)` and `search_displayable_chunks(p_query, p_as_of_date, p_family_codes, p_limit)` (cap 50) | Correct: gates enforced inside the functions, not left to the caller. |
| Refusal and audit | `retrieval_logs`, `refusal_records` (6 refusal kinds), `answer_audit_records`, `citation_verification_records`, `log_refusal_record()` RPC | Designed for answer reconstruction. Not yet exercised by any app. |
| Access control | RLS enabled on all 20 tables; SELECT policies only on reference tables (`auth.uid() is not null`) and per-user audit rows; **no policy at all on `authority_chunks`** | Correct posture: chunk text reachable only via gated RPCs/views or service-role. |

## 2. Retrieval architecture status

What exists today, verified in E13B (read-only):

- Exact citation lookup: implemented (`lookup_citation_alias`), 3,598 aliases loaded, 0 collisions, returns 0 rows (gates closed). Correct.
- Full-text search: implemented (`search_displayable_chunks` over generated `tsv` with GIN index), returns 0 rows (gates closed). Correct.
- Semantic retrieval: **not implemented by design.** `embedding vector(1536)` is a nullable placeholder, unpopulated, unindexed (HNSW example commented out). Embedding generation is a prohibited action pending separate approval.
- Hybrid rerank: not implemented; depends on embeddings.

Assessment: for an internal QA launch, exact-citation plus FTS is sufficient and is the safer starting point, because both paths are fully auditable and deterministic. Embeddings should remain deferred until after internal QA demonstrates the gated paths behave correctly (see doc 08 and the deferred section of the blocker manifest). Semantic recall gaps during internal QA should be logged as QA findings, not fixed by rushing embeddings.

## 3. Gaps and defects found (implementation-practical)

| # | Finding | Severity | Where it lands |
|---|---|---|---|
| G1 | `search_displayable_chunks` has no `answer_scope` parameter or filter: a displayable TRE chunk would be returned for a non-evidentiary query once gates open. Today it is masked by 0-displayable. The app contract (doc 07) must pass family filters and enforce TRE limited scope at the app layer, or an RPC revision must add scope filtering before display gates open. | High (future) | Blocker `judicial_guardrail_app_path`; owner decision O3 |
| G2 | No RPC exists for guardrail/reference retrieval (DCS reference-only surfacing to internal QA users). Internal QA can use `v_internal_qa_restricted_chunks` via service-role tooling, but a purpose-built internal-QA RPC with audit logging would be safer than service-role access. Design-only item for the integration phase. | Medium | Doc 07 contract item C10 |
| G3 | `lookup_citation_alias` returns `text_sha256` but not the text; displayable text delivery path (view vs RPC) for the app is not yet specified anywhere. Must be settled in the integration design. | Medium | Doc 07 contract item C2 |
| G4 | Reference tables (`authority_units`, `authority_versions`, `citation_aliases`) are readable by any authenticated user. Metadata-only, so acceptable for internal QA; revisit before external users because unit titles and citation structures reveal corpus composition. | Low | Doc 12 |
| G5 | `retrieval_logs.query_excerpt` exists; production posture must be hash-only per column comment. The app contract must never write excerpts in production mode. | Low | Doc 07 contract item C11; doc 12 |
| G6 | Migration-history ledger does not record the preview schema (applied via `db query --file`). Object-verification is the adopted stance; ledger repair needs a separate owner-approved action. | Medium | Blocker `migration_history_caveat`; doc 06 |

## 4. Preview corpus content posture (recorded, not re-queried)

6,590 chunks across 5 families: dcs_policies_procedures 2,014 (all guardrail/reference), tca_title_36 and tca_title_37 (statutes), tenn_rules_juvenile_practice_procedure, tenn_rules_evidence 533 (all limited-scope). Display-status split: 4,198 `pending_extraction_qa`, 2,392 `restricted_pending_license_review`; production-eligible 0. All zero-display gate probes passed family-by-family and scope-by-scope in E13B.

## 5. What must be true before retrieval can serve an internal QA user

1. E14B candidate patches reviewed and applied (identity 38, effectivity 54, QA signoff 439) through an approved reload (E15), after which some black-letter rows can be promoted to `approved_for_internal_qa` display status per owner decision.
2. An internal-QA display tier decision: the current enums support `approved_for_internal_qa` approval status and `internal_qa_only` display status; the reload plan must specify exactly which rows enter which tier. This is an owner decision (O2), not a technical gap.
3. The app-side contract of doc 07 implemented against the RPC surface, with scope enforcement compensating for G1 until an RPC revision is approved.
4. Golden-query and refusal harness (docs 10, 11) passing against the reloaded preview.
