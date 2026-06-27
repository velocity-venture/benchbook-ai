-- Phase E2 local disposable draft only.
-- Do not copy into supabase/migrations without owner approval.

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

alter table legal_authority_stage.raw_source_manifest enable row level security;
alter table legal_authority_stage.raw_expanded_chunks enable row level security;
alter table legal_authority_stage.raw_extraction_warnings enable row level security;
alter table legal_authority_stage.raw_deduplication_groups enable row level security;
alter table legal_authority_stage.load_errors enable row level security;

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

-- No broad raw authority_chunks read policy is drafted. Production app access
-- should use SECURITY DEFINER RPCs that enforce gates and as-of date filters.
