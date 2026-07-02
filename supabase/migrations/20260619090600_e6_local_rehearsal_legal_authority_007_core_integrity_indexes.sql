-- Phase E2 local disposable draft only.
-- Do not copy into supabase/migrations without owner approval.

create index if not exists source_files_sha256_idx
  on legal_authority.source_files(sha256);

create index if not exists source_files_manifest_sha256_idx
  on legal_authority.source_files(source_manifest_sha256);

create index if not exists source_file_memberships_path_trgm_idx
  on legal_authority.source_file_memberships using gin (source_path gin_trgm_ops);

create unique index if not exists source_file_memberships_unique_path_idx
  on legal_authority.source_file_memberships(
    source_file_id,
    source_path,
    coalesce(corpus_build_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

create index if not exists source_file_memberships_dcs_chapter_idx
  on legal_authority.source_file_memberships(dcs_chapter);

create unique index if not exists authority_units_family_norm_citation_uidx
  on legal_authority.authority_units(authority_family_id, normalized_citation)
  where normalized_citation is not null;

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

create index if not exists authority_versions_unit_status_idx
  on legal_authority.authority_versions(authority_unit_id, version_status);

create index if not exists authority_versions_effective_idx
  on legal_authority.authority_versions(valid_from, valid_to, version_status);

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

create index if not exists authority_chunks_black_letter_eligible_idx
  on legal_authority.authority_chunks(black_letter_eligible);

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
