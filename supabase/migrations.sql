-- BrewPulse RAG Playground — Supabase schema setup
-- Run this in Supabase SQL Editor

-- Step 1: Drop existing rag schema tables if they exist
drop table if exists rag.chunks cascade;
drop table if exists rag.documents cascade;
drop function if exists rag.match_chunks cascade;

-- Step 2: Ensure pgvector is enabled (in public schema)
create extension if not exists vector;

-- Step 3: Documents table in public schema
create table if not exists public.documents (
  id          serial primary key,
  file_name   text not null unique,
  title       text not null,
  content     text not null,
  metadata    jsonb default '{}'::jsonb,
  created_at  timestamptz default now()
);

-- Step 4: Chunks table in public schema
create table if not exists public.chunks (
  id           serial primary key,
  document_id  integer references public.documents(id) on delete cascade,
  file_name    text not null unique,
  content      text not null,
  embedding    vector(1024),
  metadata     jsonb default '{}'::jsonb,
  created_at   timestamptz default now()
);

-- Step 5: RLS
alter table public.documents enable row level security;
alter table public.chunks enable row level security;

-- Step 6: IVFFlat index for cosine similarity
create index if not exists chunks_embedding_idx
  on public.chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 8);

-- Step 7: Match function
create or replace function public.match_chunks(
  query_embedding vector(1024),
  match_count     int default 5,
  min_similarity  float default 0.0
)
returns table (
  id          int,
  document_id int,
  file_name   text,
  content     text,
  metadata    jsonb,
  similarity  float
)
language sql stable
as $$
  select
    c.id,
    c.document_id,
    c.file_name,
    c.content,
    c.metadata,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.chunks c
  where 1 - (c.embedding <=> query_embedding) >= min_similarity
  order by c.embedding <=> query_embedding
  limit match_count;
$$;
