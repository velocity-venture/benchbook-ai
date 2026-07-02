# Existing Supabase Impact Review

## Current Schema Summary

Existing migrations define:

- user profiles
- cases, hearings, documents, case notes, and compliance scaffolding
- chat sessions and messages
- chat feedback
- waitlist
- research query and pattern tracking
- rate limits
- court account and seat guardrail tables
- `chat_messages.trust_metadata`

No existing migration defines a legal authority corpus database.

## Compatibility Finding

The Phase D legal authority design can be additive. It should not require changes to current product tables during the design phase.

Future integration will likely need app changes, but those are outside Phase D. The most likely future app changes are:

- replace flat JSON corpus loading with retrieval RPC calls
- write retrieval logs
- write answer audit records
- write citation verification records
- write refusal records
- attach `corpus_build_id` to chat answers
- stop relying on `chat_messages.sources` as the only source audit

## Existing Tables To Keep

| Table or feature | Recommendation |
|---|---|
| `profiles` | keep and reuse for user ownership and approvals |
| `chat_sessions` | keep |
| `chat_messages` | keep, eventually add or associate corpus build and answer audit |
| `chat_feedback` | keep |
| `research_queries` | keep, but do not treat as retrieval audit |
| `rate_limits` | keep |
| `waitlist` | keep |
| `court_accounts`, `court_account_members` | keep, not directly related to corpus load |

## Gaps Filled By Phase D Schema

| Gap | Phase D table |
|---|---|
| source file hash and path traceability | `source_files`, `source_file_memberships` |
| legal authority hierarchy | `authority_families`, `authority_units` |
| current and future versions | `authority_versions` |
| chunk-level source spans | `authority_chunks` |
| exact citation lookup | `citation_aliases` |
| warning audit | `extraction_warnings`, `chunk_warnings` |
| FTS and future semantic retrieval | `authority_chunks.tsv`, `authority_chunks.embedding` |
| retrieval audit | `retrieval_logs` |
| answer audit | `answer_audit_records` |
| citation verification persistence | `citation_verification_records` |
| unsupported-answer refusals | `refusal_records` |

## RLS Impact

The current schema uses strict user-scoped RLS for user data. Legal authority data is shared corpus data, not user-owned data. The safest pattern is:

- no broad app access to raw `authority_chunks`
- production app reads through views or SECURITY DEFINER RPCs
- restricted chunks are visible only to service role or internal QA role
- user-specific audit rows are user-scoped
- service role can write build, retrieval, and audit rows

## Migration Impact

No existing migration needs to be edited. A future implementation should create a new migration after the design is approved.

Recommended future migration sequence:

1. enable extensions and create `legal_authority` schema
2. create enum types and base tables
3. create indexes and views
4. create RLS policies
5. create retrieval RPCs
6. create staging schema and dry-run loader separately

## Risk Notes

- `chat_messages.trust_metadata` exists but is not enough for legal audit. Keep it as UI metadata, not the source of truth.
- `research_queries.response_sources` is not a retrieval log. It does not prove what text was retrieved.
- Existing seed demo data should remain dev-only and should not be part of corpus loading.
- Future integration should avoid direct raw table queries from the chat route.

