# 09 - Audit Logging and Traceability Spec

Date: 2026-07-02
Phase: F5-02. Machine mirror: `contracts/audit_log_object_contract.json`. Schema targets already exist (F5-01 doc 12 section 3); this spec fixes write points and content rules.

## 1. Write points in the request lifecycle

| Event | Table | When | Required content |
|---|---|---|---|
| Every retrieval attempt | retrieval_logs | Before the response streams | user_id, corpus_build_id, query_hash (hash-only in production mode; excerpt only in QA mode under owner flag), retrieval_mode, as_of_date, filters (family, scope intent), detected_citations, candidate and returned chunk id arrays, scores, refused_before_generation flag |
| Every refusal (all stages) | refusal_records via `log_refusal_record` | At refusal emission, including pre-model refusals | refusal_kind, reason template key, query_hash, matched-term metadata (hashed in production mode), links to retrieval_log when one exists |
| Every answer | answer_audit_records | After stream completion | model provider/name/parameters, prompt_package_hash, system_prompt_version, retrieved_chunk_ids, displayed_citation_alias_ids, answer_hash, trust_metadata (confidence inputs), unsupported_proposition_count (0 or null until proposition checking exists), refusal_record_id when converted |
| Every displayed citation | citation_verification_records | With answer persistence | citation_text, normalized_citation, alias id, exists_in_corpus, current_as_of_date, display_allowed, supporting_chunk_ids, warnings |
| Guardrail decision | retrieval_logs.filters extension or answer_audit trust_metadata | With its stage | the doc 06 decision object (hashed matches) |

## 2. Reconstruction requirement (the acceptance test for this spec)

For any answer or refusal shown to a QA user, an auditor holding only database rows must reconstruct: what was asked (hash; QA-mode excerpt if flagged), what the guardrails decided and why, what was retrieved (exact chunk ids and versions), what the model was told (prompt hash plus system prompt version), what was answered (answer hash), which citations were displayed with what verification levels, and which environment served it. The mock harness includes a reconstruction drill (MA-06) that walks these joins on fixture data.

## 3. Content rules

1. Production mode: query hashes only; no excerpts; no juvenile or party names in any log field; guardrail matched terms stored hashed.
2. QA mode (owner-flagged, internal-QA tier only): excerpts permitted for QA triage; flag defaults off; excerpt fields carry the QA-mode marker so retention jobs can purge them first.
3. No legal chunk text is ever written to logs; chunk ids and hashes only.
4. Console/edge logs: no query content, no citation text, ids and hashes only (S4 scrubbing rule).
5. Retention: expires_at defaults stand (90d retrieval, 1y refusal/answer); enforcement job remains deferred post-internal-QA (S3) and is listed in the blocker manifest as audit wiring, not retention.

## 4. Identity and write mechanics

Audit writes happen server-side with the authenticated user's id carried explicitly. Write path options (settled in F5-03 design): security-definer RPCs per table (preferred, mirrors `log_refusal_record`) vs constrained insert policies. User-facing SELECT stays per-user via existing RLS policies.

## 5. Failure behavior

Audit write failure on the answer path fails closed: the answer does not stream if the retrieval log cannot be written; an answer already streamed when a post-write fails triggers a defect alert and QA-session flag. Audit writes are never silently dropped.

## 6. Test hooks

`mock_audit_log_scenarios.json` MA-01 through MA-06: answer with full chain, pre-model refusal chain, retrieval-gate refusal chain, citation-failure conversion chain, gated-class refusal rows, and the reconstruction drill.
