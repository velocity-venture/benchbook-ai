-- Phase E2 local disposable draft only.
-- Do not copy into supabase/migrations without owner approval.

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
    or metadata->>'identity_status' in ('unresolved', 'document_anchored')
  )
);

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
  qa_signoff_required boolean not null default false,
  qa_signed_off_at timestamptz,
  qa_signed_off_by uuid,
  version_text_hash text check (version_text_hash is null or version_text_hash ~ '^[0-9a-f]{64}$'),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint authority_versions_valid_range_check check (valid_to is null or valid_from is null or valid_to > valid_from),
  constraint authority_versions_future_date_check check (
    (version_status <> 'future_effective') or valid_from is not null or requires_effectivity_qa
  )
);

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
  black_letter_eligible boolean not null default false,
  tsv tsvector generated always as (to_tsvector('english', coalesce(text, ''))) stored,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint authority_chunks_display_gate_check check (
    (production_display_status = 'restricted_pending_license_review' and retrieval_display_gate in ('restricted_pending_license_review', 'internal_qa_only', 'deny_until_approved'))
    or production_display_status <> 'restricted_pending_license_review'
  )
);

comment on column legal_authority.authority_chunks.black_letter_eligible is
  'True only for future approved black-letter-only retrieval candidates after display and effectivity gates pass.';
