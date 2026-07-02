-- Phase E2 local disposable draft only.
-- Do not copy into supabase/migrations without owner approval.

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
where chunk_type = 'black_letter_text'
  and black_letter_eligible = true;

create or replace view legal_authority.v_internal_qa_restricted_chunks as
select
  c.*,
  v.version_status,
  u.canonical_citation,
  f.family_code as authority_family
from legal_authority.authority_chunks c
join legal_authority.authority_versions v on v.authority_version_id = c.authority_version_id
join legal_authority.authority_units u on u.authority_unit_id = c.authority_unit_id
join legal_authority.authority_families f on f.authority_family_id = u.authority_family_id
where c.production_display_status in ('restricted_pending_license_review', 'internal_qa_only')
   or c.approval_status <> 'approved_for_production';

create or replace function legal_authority.lookup_citation_alias(
  p_normalized_alias text,
  p_as_of_date date default current_date
)
returns table (
  authority_chunk_id uuid,
  authority_unit_id uuid,
  authority_version_id uuid,
  canonical_citation text,
  authority_family text,
  chunk_type text,
  page_start integer,
  page_end integer,
  text_sha256 text
)
language sql
stable
security definer
set search_path = legal_authority, public
as $$
  select
    c.authority_chunk_id,
    c.authority_unit_id,
    c.authority_version_id,
    u.canonical_citation,
    f.family_code,
    c.chunk_type,
    c.page_start,
    c.page_end,
    c.text_sha256
  from legal_authority.citation_aliases a
  join legal_authority.authority_units u on u.authority_unit_id = a.authority_unit_id
  join legal_authority.authority_families f on f.authority_family_id = u.authority_family_id
  join legal_authority.authority_versions v on v.authority_unit_id = u.authority_unit_id
  join legal_authority.authority_chunks c on c.authority_version_id = v.authority_version_id
  where a.normalized_alias = p_normalized_alias
    and c.approval_status = 'approved_for_production'
    and c.production_display_status in ('displayable_black_letter', 'displayable_policy_text')
    and v.valid_from <= p_as_of_date
    and (v.valid_to is null or p_as_of_date < v.valid_to);
$$;

create or replace function legal_authority.search_displayable_chunks(
  p_query text,
  p_as_of_date date default current_date,
  p_family_codes text[] default null,
  p_limit integer default 20
)
returns table (
  authority_chunk_id uuid,
  authority_unit_id uuid,
  authority_version_id uuid,
  canonical_citation text,
  authority_family text,
  chunk_type text,
  rank real,
  page_start integer,
  page_end integer,
  text_sha256 text
)
language sql
stable
security definer
set search_path = legal_authority, public
as $$
  select
    c.authority_chunk_id,
    c.authority_unit_id,
    c.authority_version_id,
    u.canonical_citation,
    f.family_code,
    c.chunk_type,
    ts_rank_cd(c.tsv, websearch_to_tsquery('english', p_query)) as rank,
    c.page_start,
    c.page_end,
    c.text_sha256
  from legal_authority.authority_chunks c
  join legal_authority.authority_versions v on v.authority_version_id = c.authority_version_id
  join legal_authority.authority_units u on u.authority_unit_id = c.authority_unit_id
  join legal_authority.authority_families f on f.authority_family_id = u.authority_family_id
  where c.approval_status = 'approved_for_production'
    and c.production_display_status in ('displayable_black_letter', 'displayable_policy_text')
    and v.valid_from <= p_as_of_date
    and (v.valid_to is null or p_as_of_date < v.valid_to)
    and (p_family_codes is null or f.family_code = any(p_family_codes))
    and c.tsv @@ websearch_to_tsquery('english', p_query)
  order by rank desc
  limit greatest(1, least(coalesce(p_limit, 20), 50));
$$;

create or replace function legal_authority.log_refusal_record(
  p_corpus_build_id uuid,
  p_query_hash text,
  p_refusal_kind text,
  p_reason text,
  p_filters jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = legal_authority, public
as $$
declare
  v_refusal_id uuid;
begin
  insert into legal_authority.refusal_records (
    corpus_build_id,
    query_hash,
    refusal_kind,
    reason,
    filters
  ) values (
    p_corpus_build_id,
    p_query_hash,
    p_refusal_kind,
    p_reason,
    coalesce(p_filters, '{}'::jsonb)
  )
  returning refusal_record_id into v_refusal_id;

  return v_refusal_id;
end;
$$;
