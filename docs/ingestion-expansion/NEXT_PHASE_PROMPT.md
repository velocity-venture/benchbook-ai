# Next-Phase Prompt (Phase D — authority database schema & load design)

**Gate:** Phase C expansion extraction QA is complete with verdict "proceed".
Phase D below is **design first, load second** — the load step needs its own
explicit authorization plus a database target decision (local vs hosted
PostgreSQL) and resolution of the LexisNexis display-policy question for
restricted chunk types.

## Proposed prompt (copy-paste when ready)

```
You are Claude Code working in /Users/m3_ai_factory/Projects/benchbook-ai.

Phase C expansion is complete (docs/ingestion-expansion/, 2026-06-12):
6,587 structure-chunked authority chunks across Title 36, Title 37, TRJPP,
TRE, and DCS staged chapters, all pending_extraction_qa, with version-variant
statutes flagged and Lexis editorial material display-restricted.

This run is Phase D Part 1: DESIGN ONLY for the PostgreSQL legal authority
database. NOT AUTHORIZED: executing any load, creating any database,
generating embeddings, app-code changes, staging/committing.

TASKS:
1. docs/authority-db/SCHEMA_DESIGN.md — tables for sources (keyed by
   manifest sha256), authority_units (sections/rules/policies, with
   version partitioning: version_label, effective_start/effective_end,
   is_current; current/future July 1 2026 pairs must never co-retrieve),
   chunks (keyed by chunk_id, with chunk_type, corpus_designation,
   approval_status, production_display_status as enforced columns),
   document_chapter_memberships (many-to-many from the dedup alias report),
   and full-text search strategy (tsvector over black-letter/policy chunks
   only; restricted types excluded from any answer-surface index).
2. docs/authority-db/LOAD_PLAN.md — idempotent load from
   data/ingestion-expanded/EXPANDED_AUTHORITY_CHUNKS.jsonl with hash
   re-verification gates, approval/designation gates enforced as database
   constraints, and a dry-run validation mode.
3. docs/authority-db/QA_QUERY_SUITE.md — acceptance queries the Judge's
   team can run: per-authority counts, version-pair isolation checks,
   display-gate checks, TRE labeling checks, citation lookup smoke tests.
4. Recommend (do not execute) the pgvector strategy for Phase E, including
   which chunk types are embeddable (black-letter + policy only).

STOP AND ASK IF: any design decision requires resolving the Lexis display
policy, the 2026-07-01 version switchover policy, or production hosting
choices — list them as decision items instead of assuming.
```

## Open items the Judge/team must resolve before Phase D Part 2 (the load)

1. Database target: local PostgreSQL vs hosted (and credentials handling).
2. LexisNexis display policy for `restricted_pending_license_review` types
   (annotation/case-note/advisory-comment).
3. Version switchover: serve `[Effective until July 1, 2026]` text now and
   flip on 2026-07-01, or model both with effective-date query logic from
   day one (recommended).
4. The encrypted Clients Rights Handbook: authorize the `cryptography`
   dependency, or obtain an unencrypted copy, or defer that document.
5. Extraction-QA sign-off moving chunks from pending_extraction_qa to an
   approved state (per authority family, with spot-check protocol).

## Still deferred beyond Phase D

Phase E (pgvector), Phase F (citation validation integration), Phase G
(guardrails), Phase H (QA harness), Phase I (UI/copy). The two known
app-code defects (context overflow; invalid default model IDs — architecture
review doc 05 §C) remain open until app-code changes are authorized.
