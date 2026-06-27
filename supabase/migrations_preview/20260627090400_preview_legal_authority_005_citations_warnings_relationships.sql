-- Phase E8 Supabase preview schema-only migration.
-- Preview target approved by owner: benchbook-ai. Do not apply to production.

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
