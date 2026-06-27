-- Phase E8 Supabase preview schema-only migration.
-- Preview target approved by owner: benchbook-ai. Do not apply to production.

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
  approved_by uuid,
  approved_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

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

create table if not exists legal_authority_stage.raw_source_manifest (
  stage_row_id bigserial primary key,
  load_batch_id uuid not null,
  source_line_number integer not null,
  raw_json jsonb not null,
  validation_status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (load_batch_id, source_line_number)
);

create table if not exists legal_authority_stage.raw_expanded_chunks (
  stage_row_id bigserial primary key,
  load_batch_id uuid not null,
  source_line_number integer not null,
  raw_json jsonb not null,
  validation_status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (load_batch_id, source_line_number)
);

create table if not exists legal_authority_stage.raw_extraction_warnings (
  stage_row_id bigserial primary key,
  load_batch_id uuid not null,
  source_line_number integer not null,
  raw_json jsonb not null,
  validation_status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (load_batch_id, source_line_number)
);

create table if not exists legal_authority_stage.raw_deduplication_groups (
  stage_row_id bigserial primary key,
  load_batch_id uuid not null,
  source_line_number integer not null,
  raw_json jsonb not null,
  validation_status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (load_batch_id, source_line_number)
);

create table if not exists legal_authority_stage.load_errors (
  load_error_id bigserial primary key,
  load_batch_id uuid not null,
  source_name text not null,
  source_line_number integer,
  error_code text not null,
  error_detail text,
  severity text not null default 'error' check (severity in ('info', 'warning', 'error', 'blocker')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
