-- Phase E8 Supabase preview schema-only migration.
-- Preview target approved by owner: benchbook-ai. Do not apply to production.

create table if not exists legal_authority.retrieval_logs (
  retrieval_log_id uuid primary key default gen_random_uuid(),
  user_id uuid,
  chat_message_id uuid,
  corpus_build_id uuid not null references legal_authority.corpus_builds(corpus_build_id),
  query_hash text not null check (query_hash ~ '^[0-9a-f]{64}$'),
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
  expires_at timestamptz not null default now() + interval '90 days',
  created_at timestamptz not null default now()
);

comment on column legal_authority.retrieval_logs.query_excerpt is
  'Owner decision: production default is query hash only. Redacted excerpts are for local or dev QA only.';

create table if not exists legal_authority.refusal_records (
  refusal_record_id uuid primary key default gen_random_uuid(),
  user_id uuid,
  chat_message_id uuid,
  retrieval_log_id uuid references legal_authority.retrieval_logs(retrieval_log_id) on delete set null,
  corpus_build_id uuid references legal_authority.corpus_builds(corpus_build_id) on delete set null,
  refusal_kind text not null check (refusal_kind in ('out_of_scope', 'no_authority_support', 'future_effective_only', 'restricted_display_only', 'unsupported_answer', 'safety_guardrail')),
  query_hash text not null check (query_hash ~ '^[0-9a-f]{64}$'),
  query_excerpt text,
  matched_terms jsonb not null default '[]'::jsonb,
  filters jsonb not null default '{}'::jsonb,
  reason text not null,
  expires_at timestamptz not null default now() + interval '1 year',
  created_at timestamptz not null default now()
);

create table if not exists legal_authority.answer_audit_records (
  answer_audit_record_id uuid primary key default gen_random_uuid(),
  user_id uuid,
  chat_session_id uuid,
  chat_message_id uuid,
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
  refusal_record_id uuid references legal_authority.refusal_records(refusal_record_id) on delete set null,
  expires_at timestamptz not null default now() + interval '1 year',
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
