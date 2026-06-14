-- Phase D draft schema for BenchBook.AI legal authority database.
-- Design artifact only. Do not apply as a migration from this path.
-- No embeddings are generated here. The pgvector column is a placeholder.

create schema if not exists legal_authority;

create extension if not exists vector;
create extension if not exists pg_trgm;

-- Optional helper for generated UUIDs in environments where it is not already enabled.
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Controlled values
-- ---------------------------------------------------------------------------

do $$
begin
  create type legal_authority.source_type as enum ('statute', 'rule', 'dcs_policy', 'metadata', 'unknown');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type legal_authority.approval_status as enum (
    'pending_extraction_qa',
    'approved_for_internal_qa',
    'approved_for_production',
    'rejected',
    'not_required_metadata'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type legal_authority.validation_status as enum (
    'pending',
    'passed',
    'passed_with_warnings',
    'failed',
    'waived'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type legal_authority.production_display_status as enum (
    'pending_extraction_qa',
    'displayable_black_letter',
    'displayable_policy_text',
    'restricted_pending_license_review',
    'internal_qa_only',
    'excluded_from_production'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type legal_authority.version_status as enum (
    'current',
    'future_effective',
    'superseded',
    'expired',
    'unknown_effectivity'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type legal_authority.answer_scope as enum (
    'general_answer_authority',
    'guardrail_reference_only',
    'limited_evidentiary_procedural',
    'internal_qa_only',
    'not_answer_authority'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type legal_authority.retrieval_mode as enum (
    'exact_citation',
    'full_text',
    'semantic',
    'hybrid',
    'black_letter_only',
    'qa_internal'
  );
exception
  when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Corpus builds and source files
-- ---------------------------------------------------------------------------

create table if not exists legal_authority.corpus_builds (
  corpus_build_id uuid primary key default gen_random_uuid(),
  build_version text not null unique,
  build_label text,
  manifest_sha256 text not null check (manifest_sha256 ~ '^[0-9a-f]{64}$'),
  chunk_jsonl_sha256 text check (chunk_jsonl_sha256 is null or chunk_jsonl_sha256 ~ '^[0-9a-f]{64}$'),
  extraction_pipeline_version text not null,
  source_selection jsonb not null default '{}'::jsonb,
  chunk_summary jsonb not null default '{}'::jsonb,
  approval_status legal_authority.approval_status not null default 'pending_extraction_qa',
  validation_status legal_authority.validation_status not null default 'pending',
  built_at timestamptz,
  loaded_at timestamptz,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

comment on table legal_authority.corpus_builds is
  'Immutable record of a selected corpus build. Retrieval and answer audit rows must point to one corpus build.';

create table if not exists legal_authority.authority_families (
  authority_family_id uuid primary key default gen_random_uuid(),
  family_code text not null unique,
  display_name text not null,
  jurisdiction text not null default 'Tennessee',
  default_source_type legal_authority.source_type not null,
  default_corpus_designation text not null,
  default_answer_scope legal_authority.answer_scope not null default 'general_answer_authority',
  rank_weight numeric(8,4) not null default 1.0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on column legal_authority.authority_families.default_answer_scope is
  'TRE should be limited_evidentiary_procedural. This preserves the guardrail/reference distinction.';

create table if not exists legal_authority.source_files (
  source_file_id uuid primary key default gen_random_uuid(),
  source_manifest_sha256 text not null check (source_manifest_sha256 ~ '^[0-9a-f]{64}$'),
  sha256 text not null check (sha256 ~ '^[0-9a-f]{64}$'),
  primary_source_path text not null,
  filename text not null,
  extension text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  source_type legal_authority.source_type not null,
  authority_family_id uuid references legal_authority.authority_families(authority_family_id),
  authority_range_label text,
  approval_status legal_authority.approval_status not null default 'pending_extraction_qa',
  corpus_designation text,
  storage_status text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (sha256)
);

comment on table legal_authority.source_files is
  'Unique source PDFs or source files by SHA-256. Source path aliases are stored separately.';

create table if not exists legal_authority.source_file_memberships (
  source_file_membership_id uuid primary key default gen_random_uuid(),
  source_file_id uuid not null references legal_authority.source_files(source_file_id) on delete cascade,
  source_path text not null,
  path_role text not null check (path_role in ('primary', 'alias', 'manifest_path')),
  dcs_chapter text,
  document_type text,
  corpus_build_id uuid references legal_authority.corpus_builds(corpus_build_id) on delete set null,
  is_selected_for_build boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table legal_authority.source_file_memberships is
  'Preserves DCS duplicate alias paths and many-to-many chapter membership without duplicating chunks.';

-- ---------------------------------------------------------------------------
-- Legal authority hierarchy and versions
-- ---------------------------------------------------------------------------

create table if not exists legal_authority.authority_units (
  authority_unit_id uuid primary key default gen_random_uuid(),
  authority_family_id uuid not null references legal_authority.authority_families(authority_family_id),
  source_type legal_authority.source_type not null,
  canonical_citation text,
  normalized_citation text,
  title text,
  chapter text,
  part text,
  section text,
  subsection text,
  rule_number text,
  policy_number text,
  policy_chapter text,
  document_type text,
  parent_authority_unit_id uuid references legal_authority.authority_units(authority_unit_id) on delete set null,
  hierarchy_path text[] not null default array[]::text[],
  corpus_designation text not null,
  answer_scope legal_authority.answer_scope not null default 'general_answer_authority',
  sort_key text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint authority_units_identity_check check (
    canonical_citation is not null
    or policy_number is not null
    or rule_number is not null
    or section is not null
  )
);

create unique index if not exists authority_units_family_norm_citation_uidx
  on legal_authority.authority_units(authority_family_id, normalized_citation)
  where normalized_citation is not null;

comment on table legal_authority.authority_units is
  'Stable legal unit, independent of current or future-effective versions.';

create table if not exists legal_authority.authority_versions (
  authority_version_id uuid primary key default gen_random_uuid(),
  authority_unit_id uuid not null references legal_authority.authority_units(authority_unit_id) on delete cascade,
  source_file_id uuid not null references legal_authority.source_files(source_file_id),
  corpus_build_id uuid not null references legal_authority.corpus_builds(corpus_build_id),
  source_version_label text,
  authority_version_label text,
  effective_label text,
  valid_from date,
  valid_to date,
  version_status legal_authority.version_status not null default 'unknown_effectivity',
  supersedes_authority_version_id uuid references legal_authority.authority_versions(authority_version_id) on delete set null,
  superseded_by_authority_version_id uuid references legal_authority.authority_versions(authority_version_id) on delete set null,
  has_effective_date_warning boolean not null default false,
  requires_effectivity_qa boolean not null default false,
  version_text_hash text check (version_text_hash is null or version_text_hash ~ '^[0-9a-f]{64}$'),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint authority_versions_valid_range_check check (valid_to is null or valid_from is null or valid_to > valid_from),
  constraint authority_versions_future_date_check check (
    (version_status <> 'future_effective') or valid_from is not null or requires_effectivity_qa
  )
);

create index if not exists authority_versions_unit_status_idx
  on legal_authority.authority_versions(authority_unit_id, version_status);

create index if not exists authority_versions_effective_idx
  on legal_authority.authority_versions(valid_from, valid_to, version_status);

comment on table legal_authority.authority_versions is
  'Current, future-effective, expired, and superseded text are separate rows. Never merge effective variants.';

comment on column legal_authority.authority_versions.valid_from is
  'As-of retrieval must require valid_from <= as_of_date unless valid_from is null and QA has approved unknown effectivity.';

comment on column legal_authority.authority_versions.valid_to is
  'Exclusive end date. A row is current on date D when D >= valid_from and (valid_to is null or D < valid_to).';

-- ---------------------------------------------------------------------------
-- Chunks, citations, relationships, and warnings
-- ---------------------------------------------------------------------------

create table if not exists legal_authority.authority_chunks (
  authority_chunk_id uuid primary key default gen_random_uuid(),
  source_chunk_id text not null unique,
  authority_version_id uuid not null references legal_authority.authority_versions(authority_version_id) on delete cascade,
  authority_unit_id uuid not null references legal_authority.authority_units(authority_unit_id) on delete cascade,
  source_file_id uuid not null references legal_authority.source_files(source_file_id),
  corpus_build_id uuid not null references legal_authority.corpus_builds(corpus_build_id),
  chunk_type text not null,
  text text not null,
  text_sha256 text not null check (text_sha256 ~ '^[0-9a-f]{64}$'),
  page_start integer check (page_start is null or page_start >= 1),
  page_end integer check (page_end is null or page_end >= page_start),
  char_start integer check (char_start is null or char_start >= 0),
  char_end integer check (char_end is null or char_start is null or char_end >= char_start),
  production_display_status legal_authority.production_display_status not null,
  retrieval_display_gate text not null default 'deny_until_approved',
  approval_status legal_authority.approval_status not null default 'pending_extraction_qa',
  validation_status legal_authority.validation_status not null default 'pending',
  answer_scope legal_authority.answer_scope not null default 'general_answer_authority',
  tsv tsvector generated always as (to_tsvector('english', coalesce(text, ''))) stored,
  embedding vector(1536),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint authority_chunks_display_gate_check check (
    (production_display_status = 'restricted_pending_license_review' and retrieval_display_gate in ('restricted_pending_license_review', 'internal_qa_only', 'deny_until_approved'))
    or production_display_status <> 'restricted_pending_license_review'
  )
);

comment on table legal_authority.authority_chunks is
  'Retrieval units with full traceability to source file, authority version, page span, extraction build, and text hash.';

comment on column legal_authority.authority_chunks.production_display_status is
  'Hard display gate. Restricted material must not be returned by production answer queries.';

comment on column legal_authority.authority_chunks.embedding is
  'Placeholder for future pgvector embeddings. Do not populate until an approved embedding generation phase.';

create table if not exists legal_authority.citation_aliases (
  citation_alias_id uuid primary key default gen_random_uuid(),
  authority_unit_id uuid not null references legal_authority.authority_units(authority_unit_id) on delete cascade,
  authority_version_id uuid references legal_authority.authority_versions(authority_version_id) on delete cascade,
  authority_chunk_id uuid references legal_authority.authority_chunks(authority_chunk_id) on delete cascade,
  alias_text text not null,
  normalized_alias text not null,
  alias_kind text not null default 'user_common',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table legal_authority.citation_aliases is
  'Deterministic exact citation lookup. Use before FTS or vector search.';

create table if not exists legal_authority.chunk_relationships (
  chunk_relationship_id uuid primary key default gen_random_uuid(),
  from_authority_chunk_id uuid not null references legal_authority.authority_chunks(authority_chunk_id) on delete cascade,
  to_authority_chunk_id uuid references legal_authority.authority_chunks(authority_chunk_id) on delete cascade,
  to_authority_unit_id uuid references legal_authority.authority_units(authority_unit_id) on delete cascade,
  relationship_type text not null,
  confidence numeric(6,5) check (confidence is null or (confidence >= 0 and confidence <= 1)),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint chunk_relationships_target_check check (
    to_authority_chunk_id is not null or to_authority_unit_id is not null
  )
);

create table if not exists legal_authority.extraction_warnings (
  extraction_warning_id uuid primary key default gen_random_uuid(),
  corpus_build_id uuid references legal_authority.corpus_builds(corpus_build_id) on delete cascade,
  source_file_id uuid references legal_authority.source_files(source_file_id) on delete cascade,
  warning_code text not null,
  warning_detail text,
  severity text not null default 'warning' check (severity in ('info', 'warning', 'error', 'blocker')),
  page integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists legal_authority.chunk_warnings (
  chunk_warning_id uuid primary key default gen_random_uuid(),
  authority_chunk_id uuid not null references legal_authority.authority_chunks(authority_chunk_id) on delete cascade,
  warning_code text not null,
  warning_detail text,
  severity text not null default 'warning' check (severity in ('info', 'warning', 'error', 'blocker')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Retrieval and answer audit
-- ---------------------------------------------------------------------------

create table if not exists legal_authority.retrieval_logs (
  retrieval_log_id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  chat_message_id uuid references public.chat_messages(id) on delete set null,
  corpus_build_id uuid not null references legal_authority.corpus_builds(corpus_build_id),
  query_hash text not null,
  query_excerpt text,
  retrieval_mode legal_authority.retrieval_mode not null,
  as_of_date date not null,
  filters jsonb not null default '{}'::jsonb,
  detected_citations jsonb not null default '[]'::jsonb,
  candidate_chunk_ids uuid[] not null default array[]::uuid[],
  returned_chunk_ids uuid[] not null default array[]::uuid[],
  scores jsonb not null default '{}'::jsonb,
  rerank_features jsonb not null default '{}'::jsonb,
  refused_before_generation boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table legal_authority.retrieval_logs is
  'Audit row for every retrieval attempt, including refusals before generation.';

create table if not exists legal_authority.answer_audit_records (
  answer_audit_record_id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  chat_session_id uuid references public.chat_sessions(id) on delete set null,
  chat_message_id uuid references public.chat_messages(id) on delete set null,
  retrieval_log_id uuid references legal_authority.retrieval_logs(retrieval_log_id) on delete set null,
  corpus_build_id uuid not null references legal_authority.corpus_builds(corpus_build_id),
  model_provider text,
  model_name text,
  model_parameters jsonb not null default '{}'::jsonb,
  prompt_package_hash text,
  system_prompt_version text,
  retrieved_chunk_ids uuid[] not null default array[]::uuid[],
  displayed_citation_alias_ids uuid[] not null default array[]::uuid[],
  answer_hash text,
  trust_metadata jsonb not null default '{}'::jsonb,
  validation_status legal_authority.validation_status not null default 'pending',
  unsupported_proposition_count integer not null default 0 check (unsupported_proposition_count >= 0),
  refusal_record_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists legal_authority.citation_verification_records (
  citation_verification_record_id uuid primary key default gen_random_uuid(),
  answer_audit_record_id uuid references legal_authority.answer_audit_records(answer_audit_record_id) on delete cascade,
  retrieval_log_id uuid references legal_authority.retrieval_logs(retrieval_log_id) on delete set null,
  citation_text text not null,
  normalized_citation text,
  citation_alias_id uuid references legal_authority.citation_aliases(citation_alias_id) on delete set null,
  exists_in_corpus boolean not null default false,
  current_as_of_date boolean,
  display_allowed boolean not null default false,
  proposition_supported boolean,
  supporting_chunk_ids uuid[] not null default array[]::uuid[],
  warnings jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists legal_authority.refusal_records (
  refusal_record_id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  chat_message_id uuid references public.chat_messages(id) on delete set null,
  retrieval_log_id uuid references legal_authority.retrieval_logs(retrieval_log_id) on delete set null,
  corpus_build_id uuid references legal_authority.corpus_builds(corpus_build_id) on delete set null,
  refusal_kind text not null check (refusal_kind in ('out_of_scope', 'no_authority_support', 'future_effective_only', 'restricted_display_only', 'unsupported_answer', 'safety_guardrail')),
  query_hash text not null,
  query_excerpt text,
  matched_terms jsonb not null default '[]'::jsonb,
  filters jsonb not null default '{}'::jsonb,
  reason text not null,
  created_at timestamptz not null default now()
);

alter table legal_authority.answer_audit_records
  add constraint answer_audit_refusal_fk
  foreign key (refusal_record_id)
  references legal_authority.refusal_records(refusal_record_id)
  on delete set null;

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists source_files_sha256_idx
  on legal_authority.source_files(sha256);

create index if not exists source_files_manifest_sha256_idx
  on legal_authority.source_files(source_manifest_sha256);

create index if not exists source_file_memberships_path_idx
  on legal_authority.source_file_memberships using gin (source_path gin_trgm_ops);

create unique index if not exists source_file_memberships_unique_path_idx
  on legal_authority.source_file_memberships(
    source_file_id,
    source_path,
    coalesce(corpus_build_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

create index if not exists source_file_memberships_dcs_chapter_idx
  on legal_authority.source_file_memberships(dcs_chapter);

create index if not exists authority_units_family_idx
  on legal_authority.authority_units(authority_family_id);

create index if not exists authority_units_policy_idx
  on legal_authority.authority_units(policy_number, policy_chapter);

create index if not exists authority_units_rule_idx
  on legal_authority.authority_units(rule_number);

create index if not exists authority_units_section_idx
  on legal_authority.authority_units(section);

create index if not exists authority_units_corpus_designation_idx
  on legal_authority.authority_units(corpus_designation);

create index if not exists authority_chunks_unit_type_idx
  on legal_authority.authority_chunks(authority_unit_id, chunk_type);

create index if not exists authority_chunks_version_idx
  on legal_authority.authority_chunks(authority_version_id);

create index if not exists authority_chunks_source_hash_idx
  on legal_authority.authority_chunks(source_file_id, text_sha256);

create index if not exists authority_chunks_display_status_idx
  on legal_authority.authority_chunks(production_display_status);

create index if not exists authority_chunks_approval_status_idx
  on legal_authority.authority_chunks(approval_status);

create index if not exists authority_chunks_answer_scope_idx
  on legal_authority.authority_chunks(answer_scope);

create index if not exists authority_chunks_tsv_idx
  on legal_authority.authority_chunks using gin (tsv);

-- Create this after embeddings are approved and populated.
-- create index authority_chunks_embedding_hnsw_idx
--   on legal_authority.authority_chunks using hnsw (embedding vector_cosine_ops)
--   with (m = 16, ef_construction = 64);

create index if not exists citation_aliases_normalized_idx
  on legal_authority.citation_aliases(normalized_alias);

create unique index if not exists citation_aliases_unique_target_idx
  on legal_authority.citation_aliases(
    normalized_alias,
    coalesce(authority_version_id, '00000000-0000-0000-0000-000000000000'::uuid),
    coalesce(authority_chunk_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

create index if not exists citation_aliases_trgm_idx
  on legal_authority.citation_aliases using gin (alias_text gin_trgm_ops);

create index if not exists chunk_warnings_code_idx
  on legal_authority.chunk_warnings(warning_code);

create index if not exists extraction_warnings_code_idx
  on legal_authority.extraction_warnings(warning_code);

create index if not exists retrieval_logs_user_created_idx
  on legal_authority.retrieval_logs(user_id, created_at desc);

create index if not exists retrieval_logs_build_mode_idx
  on legal_authority.retrieval_logs(corpus_build_id, retrieval_mode);

create index if not exists answer_audit_user_created_idx
  on legal_authority.answer_audit_records(user_id, created_at desc);

create index if not exists citation_verification_normalized_idx
  on legal_authority.citation_verification_records(normalized_citation);

create index if not exists refusal_records_kind_created_idx
  on legal_authority.refusal_records(refusal_kind, created_at desc);

-- ---------------------------------------------------------------------------
-- Production-safe views
-- ---------------------------------------------------------------------------

create or replace view legal_authority.v_current_displayable_chunks as
select
  c.*,
  v.valid_from,
  v.valid_to,
  v.version_status,
  u.canonical_citation,
  u.normalized_citation,
  u.corpus_designation,
  f.family_code as authority_family
from legal_authority.authority_chunks c
join legal_authority.authority_versions v on v.authority_version_id = c.authority_version_id
join legal_authority.authority_units u on u.authority_unit_id = c.authority_unit_id
join legal_authority.authority_families f on f.authority_family_id = u.authority_family_id
where c.approval_status = 'approved_for_production'
  and c.production_display_status in ('displayable_black_letter', 'displayable_policy_text')
  and v.version_status = 'current';

create or replace view legal_authority.v_black_letter_current_chunks as
select *
from legal_authority.v_current_displayable_chunks
where chunk_type = 'black_letter_text';

create or replace view legal_authority.v_internal_qa_restricted_chunks as
select
  c.*,
  v.version_status,
  u.canonical_citation
from legal_authority.authority_chunks c
join legal_authority.authority_versions v on v.authority_version_id = c.authority_version_id
join legal_authority.authority_units u on u.authority_unit_id = c.authority_unit_id
where c.production_display_status in ('restricted_pending_license_review', 'internal_qa_only');

-- ---------------------------------------------------------------------------
-- RLS posture draft
-- ---------------------------------------------------------------------------

alter table legal_authority.corpus_builds enable row level security;
alter table legal_authority.source_files enable row level security;
alter table legal_authority.source_file_memberships enable row level security;
alter table legal_authority.authority_families enable row level security;
alter table legal_authority.authority_units enable row level security;
alter table legal_authority.authority_versions enable row level security;
alter table legal_authority.authority_chunks enable row level security;
alter table legal_authority.citation_aliases enable row level security;
alter table legal_authority.chunk_relationships enable row level security;
alter table legal_authority.extraction_warnings enable row level security;
alter table legal_authority.chunk_warnings enable row level security;
alter table legal_authority.retrieval_logs enable row level security;
alter table legal_authority.answer_audit_records enable row level security;
alter table legal_authority.citation_verification_records enable row level security;
alter table legal_authority.refusal_records enable row level security;

-- Draft read policies. Production should prefer RPCs or views that enforce
-- display gates and as-of-date filters.
create policy legal_authority_read_builds
  on legal_authority.corpus_builds
  for select using (auth.uid() is not null);

create policy legal_authority_read_families
  on legal_authority.authority_families
  for select using (auth.uid() is not null);

create policy legal_authority_read_units
  on legal_authority.authority_units
  for select using (auth.uid() is not null);

create policy legal_authority_read_versions
  on legal_authority.authority_versions
  for select using (auth.uid() is not null);

create policy legal_authority_read_citation_aliases
  on legal_authority.citation_aliases
  for select using (auth.uid() is not null);

create policy legal_authority_user_retrieval_logs
  on legal_authority.retrieval_logs
  for select using (auth.uid() = user_id);

create policy legal_authority_user_answer_audits
  on legal_authority.answer_audit_records
  for select using (auth.uid() = user_id);

create policy legal_authority_user_refusals
  on legal_authority.refusal_records
  for select using (auth.uid() = user_id);

-- No broad raw authority_chunks policy is drafted here on purpose.
-- App queries should read production-safe views or SECURITY DEFINER RPCs.
