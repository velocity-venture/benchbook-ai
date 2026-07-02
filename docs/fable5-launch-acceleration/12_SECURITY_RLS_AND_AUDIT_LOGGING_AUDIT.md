# 12 - Security, RLS, and Audit Logging Audit

Date: 2026-07-01
Pass: Claude Fable 5 launch acceleration (read-only; schema files read locally, no database contact)

## 1. RLS posture (legal_authority and legal_authority_stage)

| Property | Finding | Assessment |
|---|---|---|
| RLS enabled | All 15 `legal_authority` tables and all 5 staging tables | Correct |
| Chunk text access | **No SELECT policy on `authority_chunks` at all.** Authenticated and anon roles read zero rows; text flows only through security-definer RPCs/views or service-role | Correct core control; keep forever |
| Reference metadata access | `auth.uid() is not null` SELECT policies on builds, families, units, versions, aliases | Acceptable for internal QA. Revisit before external users (metadata reveals corpus composition; see G4) |
| Per-user audit access | `auth.uid() = user_id` on retrieval_logs, answer_audit_records, refusal_records | Correct |
| Write policies | None (service-role only writes) | Correct |
| Staging tables | RLS enabled, no policies (service-role only) | Correct |
| Grants | File 009 contains no GRANT/REVOKE; relies on Supabase default role grants plus service-role bypass | Acceptable; verify object-level grants during pre-reload object verification (doc 06 P7) |

## 2. App-schema security (existing product tables)

Per-user RLS on profiles, chat sessions/messages, feedback, research patterns; anon INSERT only on waitlist; seat-limit policies on court accounts. Dual-layer rate limiting exists in the app path. Two integration-era notes:

1. The two stacks must not blur: user-facing requests authenticate through the app; legal_authority access happens server-side through gated RPCs with the user's identity carried into audit rows. No service-role key may appear in any client bundle or edge-function env reachable by user input paths beyond what Supabase SSR already requires.
2. Rate-limit behavior on this branch fails closed on RPC error in the chat route. Keep fail-closed for the QA route.

## 3. Audit logging readiness

Schema is reconstruction-grade (retrieval_logs, refusal_records with 6-kind taxonomy, answer_audit_records with model/prompt/chunk provenance, citation_verification_records per displayed citation, retention defaults 90d/1y). Nothing writes to these tables today; wiring is contract clause C11.

Requirements confirmed for the QA route implementation:

- Production mode logs query hashes only (`query_hash`), never excerpts; QA mode may log excerpts if the owner approves, flagged by environment, defaulting off.
- `answer_audit_records.trust_metadata` carries the confidence computation inputs so a displayed badge is reproducible.
- Refusal writes happen even when the model is never called (pre-generation refusals), which `log_refusal_record` supports.

## 4. Secrets and repo hygiene (verified this pass)

- Guardrail scans over the new Fable 5 folder and `scripts/launch_readiness/` found no secret-shaped strings (scan command and result recorded in doc 00).
- Existing validators enforce secret-pattern absence over all metadata artifacts; re-ran PASS.
- No connection strings, tokens, or service-role material exist anywhere in the new package. The preview project ref string (`clerihqbjyczarqkiqnb`) appears in committed docs as an identifier; it is not a credential. Target-control still treats it as approval-gated (doc 13).

## 5. Gaps to close before internal QA (tracked, not blocking this pass)

| # | Gap | Owner |
|---|---|---|
| S1 | Internal-QA participant auth tier: named accounts, no self-signup on the QA instance (Supabase email confirmation currently disabled per architecture review S1) | Owner + Codex at integration |
| S2 | Object-verification script for grants/policies as part of pre-reload gate (extend the E10 checklist to assert the absence of broad chunk policies, presence of RLS, function security-definer status) | Codex (next phase) |
| S3 | Audit retention enforcement job (expires_at exists; nothing deletes) | Deferred post-internal-QA |
| S4 | Log scrubbing review for the QA route (no juvenile or party data in console/edge logs) | Codex at integration |
