-- Phase E8 Supabase preview schema-only migration.
-- Preview target approved by owner: benchbook-ai. Do not apply to production.

do $$
begin
  create type legal_authority.source_type as enum ('statute', 'rule', 'dcs_policy', 'metadata', 'unknown');
exception when duplicate_object then null;
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
exception when duplicate_object then null;
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
exception when duplicate_object then null;
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
exception when duplicate_object then null;
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
exception when duplicate_object then null;
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
exception when duplicate_object then null;
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
exception when duplicate_object then null;
end $$;

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

insert into legal_authority.authority_families (
  family_code,
  display_name,
  default_source_type,
  default_corpus_designation,
  default_answer_scope,
  rank_weight
) values
  ('tca_title_36', 'Tennessee Code Annotated Title 36', 'statute', 'core_v1_candidate', 'general_answer_authority', 1.00),
  ('tca_title_37', 'Tennessee Code Annotated Title 37', 'statute', 'core_v1_candidate', 'general_answer_authority', 1.00),
  ('tenn_rules_juvenile_practice_procedure', 'Tennessee Rules of Juvenile Practice and Procedure', 'rule', 'core_v1_candidate', 'general_answer_authority', 0.95),
  ('tenn_rules_evidence', 'Tennessee Rules of Evidence', 'rule', 'evidence_guardrail_and_limited_answer_candidate', 'limited_evidentiary_procedural', 0.65),
  ('dcs_policies_procedures', 'Tennessee DCS Policies and Procedures', 'dcs_policy', 'staged_dcs_candidate', 'guardrail_reference_only', 0.55)
on conflict (family_code) do update set
  display_name = excluded.display_name,
  default_source_type = excluded.default_source_type,
  default_corpus_designation = excluded.default_corpus_designation,
  default_answer_scope = excluded.default_answer_scope,
  rank_weight = excluded.rank_weight;
