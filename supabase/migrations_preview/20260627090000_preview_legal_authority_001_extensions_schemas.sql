-- Phase E8 Supabase preview schema-only migration.
-- Preview target approved by owner: benchbook-ai.
-- Do not apply to benchbook-ai-prod or any production database.

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

comment on schema legal_authority is
  'BenchBook.AI preview legal authority schema. PDFs remain archival source-of-record.';

comment on schema legal_authority_stage is
  'BenchBook.AI preview staging schema for schema-only legal authority rehearsal. No corpus rows loaded in E8.';
