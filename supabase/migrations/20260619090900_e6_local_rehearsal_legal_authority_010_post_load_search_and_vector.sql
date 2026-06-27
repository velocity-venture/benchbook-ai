-- Phase E2 local disposable draft only.
-- Do not copy into supabase/migrations without owner approval.

create index if not exists authority_chunks_tsv_idx
  on legal_authority.authority_chunks using gin (tsv);

do $$
begin
  if exists (
    select 1
    from pg_type
    where typname = 'vector'
  ) then
    if not exists (
      select 1
      from information_schema.columns
      where table_schema = 'legal_authority'
        and table_name = 'authority_chunks'
        and column_name = 'embedding'
    ) then
      execute 'alter table legal_authority.authority_chunks add column embedding vector(1536)';
      comment on column legal_authority.authority_chunks.embedding is
        'Nullable placeholder. Do not populate until embedding generation is separately approved.';
    end if;
  else
    raise notice 'pgvector type is unavailable locally. Embedding column remains deferred.';
  end if;
end $$;

-- Vector indexes are intentionally deferred until embeddings are approved and populated.
-- Example future index:
-- create index authority_chunks_embedding_hnsw_idx
--   on legal_authority.authority_chunks using hnsw (embedding vector_cosine_ops)
--   with (m = 16, ef_construction = 64);
