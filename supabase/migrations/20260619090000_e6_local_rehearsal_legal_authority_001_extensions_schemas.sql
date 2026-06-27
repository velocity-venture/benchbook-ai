-- Phase E2 local disposable draft only.
-- Do not copy into supabase/migrations without owner approval.

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

do $$
begin
  begin
    create extension if not exists vector;
  exception
    when undefined_file then
      raise notice 'pgvector extension is not available locally. Embedding column and vector indexes are deferred.';
    when insufficient_privilege then
      raise notice 'pgvector extension could not be enabled with current local privileges. Embedding column and vector indexes are deferred.';
    when others then
      raise notice 'pgvector extension could not be enabled locally. Embedding column and vector indexes are deferred. SQLSTATE: %', sqlstate;
  end;
end $$;

create schema if not exists legal_authority;
create schema if not exists legal_authority_stage;

-- Local disposable databases do not have Supabase auth helpers. This stub lets
-- RLS policy drafts parse locally. Do not use this stub in production Supabase.
create schema if not exists auth;

create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select null::uuid;
$$;

comment on schema legal_authority is
  'BenchBook.AI local dry-run legal authority schema. PDFs remain archival source-of-record.';

comment on schema legal_authority_stage is
  'BenchBook.AI local dry-run staging schema for metadata and ignored derivative corpus JSONL.';
