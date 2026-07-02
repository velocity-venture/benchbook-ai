# 04 — Database and Schema Review (Phase 3)

**Date:** 2026-06-10 · Source: `supabase/migrations/` (7 files), `supabase/seed-demo-data.sql`, `supabase/config.toml`, app query sites.

## A. Current schema inventory

**Actively used by the app:** `profiles`, `chat_sessions`, `chat_messages` (incl. `sources` JSONB and `trust_metadata` JSONB), `chat_feedback`, `research_queries`, `research_patterns` (+ RPC `update_user_research_patterns`), `rate_limits` (+ RPCs `check_rate_limit`, `cleanup_rate_limits`), `waitlist`.

**Defined but never queried (dead):** `cases`, `hearings`, `documents`, `document_templates` (8 seeded templates), `case_notes`, `compliance_deadlines`, `document_views`, `court_accounts`, `court_account_members`.

**RLS:** strict `auth.uid()`-scoped policies on every user table; `chat_messages` correctly gated through session ownership subqueries; seat limits (solo=1, court≤4, enterprise≥5) enforced in SQL on `court_account_members` INSERT; `rate_limits` has RLS enabled with no policies (RPC-only access — acceptable); `document_templates` readable by any authenticated user; `waitlist` anonymous-INSERT by design. No dangerous policies found.

## B. Requirement-by-requirement gap table

| Required capability | Present? | Where / gap |
|---|---|---|
| authorities | ❌ | No legal-authority tables of any kind; corpus is a bundled JSON file |
| authority versions | ❌ | — |
| source files + checksums | ❌ | — |
| legal hierarchy (title/chapter/part/section/subsection) | ❌ | — |
| rule set / rule / commentary / history | ❌ | — |
| DCS policy chapter/effective/revision dates | ❌ | — |
| chunks + source spans | ❌ | — |
| citation aliases / normalization | ❌ (regex-only in app code) | `citation-validator.ts` normalizes formats in-memory; nothing persisted |
| full-text search (tsvector/GIN) | ❌ | — |
| vector search (pgvector) | ❌ | pgvector never enabled; dead pipeline used Pinecone |
| retrieval logs | ⚠ partial | `research_queries.response_sources` JSONB stores cited sources per query; no retrieved-span logging (nothing is retrieved) |
| answer audit records | ⚠ partial | `chat_messages` stores content + `sources`; no model/params/corpus version |
| citation verification results | ⚠ ephemeral | Computed per-request, streamed to client; **not persisted** |
| user questions & answers | ✅ | `chat_sessions`/`chat_messages`, RLS-correct |
| refusal records | ❌ | Scope refusals are streamed but never logged anywhere |
| trust metadata | ⚠ schema only | `chat_messages.trust_metadata` (migration 20260501) **is never written by any server code** — confirmed dead column receiving `{}` |
| corpus build version per answer | ❌ | No corpus version exists to record |

## C. Legacy / out-of-scope tables — dispositions

| Table(s) | Finding | Classification |
|---|---|---|
| `cases`, `hearings`, `case_notes`, `compliance_deadlines` | Case-management scaffolding; zero app references; conflicts with closed-universe V1 positioning ("not a case management system" — privacy policy) | **Future** (keep migrations, do not surface) or **Archive** if Judge prefers a clean V1 schema; do not seed in prod |
| `documents`, `document_templates` | Order-drafting templates incl. "Findings of Fact" — drafting that decides facts is an explicit guardrail violation if ever surfaced as-is | **Needs further review** before any future use; **exclude from V1** |
| `document_views` | Tracking table, no writers | **Future** (harmless) |
| `court_accounts`, `court_account_members` | Commercial seats, SQL-enforced; no onboarding flow | **Launch** (keep — sound and inert until billing) |
| `waitlist` | Pre-launch capture, anonymous insert | **Launch** |
| `research_queries`/`research_patterns` | Personal research analytics (not case-pattern analysis) | **Launch**, but see doc 09 copy notes |
| `supabase/seed-demo-data.sql` | Fictional juvenile cases with child initials/allegations, seeded to first auth user | **Adopt with revision**: dev-only guard; never run in prod; consider renaming fields to obviously-fake values |

## D. Recommended production schema (additive; lives beside existing chat tables)

```sql
-- Source of record
source_files(id, sha256, filename, drive_source, authority_type, version_label,
             date_downloaded, effective_date, approval_status, approved_use,
             approved_by, approved_at)

-- Authorities and structure
authorities(id, authority_type,            -- statute|rule|dcs_policy|evidence_rule
            jurisdiction, citation_root,    -- '37-1-129', 'TRJPP 205', 'DCS 14.6'
            canonical_citation, title, chapter, part, section, subsection,
            rule_number, policy_number, policy_chapter,
            parent_id, hierarchy_path, sort_key)
authority_versions(id, authority_id, source_file_id, version_hash,
                   effective_date, revision_date, is_current)

-- Text
chunks(id, authority_version_id, chunk_type,   -- black_letter_text|advisory_comment|history|annotation|case_note|policy_procedure|definition|cross_reference
       text, page_start, page_end, char_start, char_end,
       tsv tsvector GENERATED,                  -- + GIN index
       embedding vector(<dim>))                 -- + pgvector index (semantic only)

citation_aliases(id, authority_id, alias_text, alias_kind)  -- 'T.C.A. § 37-1-129(a)', 'Tenn. Code Ann. ...'

-- Audit
corpus_builds(id, manifest_hash, built_at, notes)
retrieval_logs(id, message_id, corpus_build_id, query, strategy, chunk_ids int[], scores jsonb, created_at)
answer_verifications(id, message_id, citation, exists_in_corpus bool, proposition_supported bool|null,
                     supporting_chunk_ids int[], confidence, warnings jsonb)
refusal_events(id, user_id, message_id|null, refusal_kind,   -- scope|no_support|guardrail
               matched_terms jsonb, query_excerpt, created_at)
```

Plus: write `trust_metadata` server-side at last (or supersede it with `answer_verifications`); add `corpus_build_id` to `chat_messages`; enable `pgvector` and `pg_trgm`/FTS in a migration; RLS — corpus tables readable by all authenticated users (public law), audit tables user-scoped or service-role-only.

**Key design rule honored:** relational tables are the legal database; FTS handles exact citation/phrase retrieval; pgvector is auxiliary recall only.

## E. Classification summary

Existing chat/auth/rate-limit schema: **Adopt**. `trust_metadata` column: **Adopt with revision** (actually write it, or replace). Research-pattern tables: **Adopt** (launch). Case-management tables: **Future/NFR**, excluded from V1 surface. Demo seed: **Adopt with revision** (dev-only). Authority/RAG schema: **does not exist — build in Phase D**.
