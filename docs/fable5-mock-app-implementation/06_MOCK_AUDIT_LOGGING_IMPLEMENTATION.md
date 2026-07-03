# 06 - Mock Audit Logging Implementation (F5-04 / M1)

Date: 2026-07-02

## Architecture

`AuditLogger` interface (logRetrieval, logRefusal, logAnswer, logCitationVerification) with an M1 factory registry containing only the in-memory mock sink. Ordered-write semantics live in the ROUTE: the retrieval log is awaited before any generation or streaming; refusal records are written at emission; the answer audit and citation records are written before the answer envelope is emitted. No persistence, no database, no network, no secrets.

## Record chain per outcome (all proven by the MA suite)

| Outcome | Records, in order |
|---|---|
| Answer | retrieval_logs, answer_audit_records, citation_verification_records (MA-01) |
| Pre-retrieval refusal | refusal_records only (MA-02) |
| Retrieval-gate refusal | retrieval_logs (flagged refused_before_generation), refusal_records (MA-03) |
| Post-generation conversion | retrieval_logs, refusal_records, answer_audit_records with answer_suppressed=true, answer hash retained, refusal_record_id linked (MA-04) |

## Content rules enforced structurally at the sink boundary

The mock sink THROWS `AuditContentRuleError` on: any field named in the prohibited body-text set (text, chunk_text, body, excerpt, passage, gated_chunk_passage, query_text, etc., recursively), any string over 240 characters (passage-length cap), a non-sha256 `query_hash`, or a non-sha256 `answer_hash`. Violations therefore fail tests structurally rather than by convention. Queries travel as sha256 hashes only; fixture passages never reach the sink (asserted in MA-01).

## Trace model and reconstruction

`request_id` joins every record; the sink assigns per-record ids (SYNRL/SYNRF/SYNAA/SYNCV prefixes) with monotonic sequence numbers. The `done` SSE event carries the id set, and the page renders the trace line. MA-06 reconstructs a full answer from sink rows alone: query hash, retrieved chunk ids, prompt package hash, `SYSTEM_PROMPT_VERSION`, answer hash, citation levels, environment target.

## Fail-closed rules

A retrieval-log write failure blocks the answer entirely (user-safe `audit_write_failure` refusal, MA-07); an answer-audit write failure equally converts (no unaudited answer is ever streamed). Excerpt logging (`QA_MODE_EXCERPT_LOGGING`) defaults off per P5; enabling it surfaces a boot alert.
