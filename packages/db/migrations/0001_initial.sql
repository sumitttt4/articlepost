-- Run in Supabase SQL Editor. Configure Clerk as a third-party auth provider first.
create extension if not exists vector with schema extensions;

create table public.publications (
 id uuid primary key default gen_random_uuid(), user_id text not null,
 platform text not null check(platform in ('substack','medium','devto','hashnode','ghost')),
 publication_url text not null, rss_url text, session_connected boolean not null default false,
 created_at timestamptz not null default now(), unique(user_id,publication_url)
);
-- Do not put plaintext platform API keys or session cookies in client-accessible tables.
-- Use a server-side secret store / Supabase Vault for future API integrations.
create table public.articles (
 id uuid primary key default gen_random_uuid(), user_id text not null,
 title text not null, subtitle text, raw_markdown text not null default '',
 paywall_index integer check(paywall_index >= 0), seo_title text, seo_slug text,
 seo_description text, target_keyword text, seo_score integer not null default 0 check(seo_score between 0 and 100),
 canonical_url text, google_indexed boolean not null default false,
 status text not null default 'draft' check(status in ('draft','queued','published','canonical_waiting')),
 embedding extensions.vector(1536), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.article_destinations (
 id uuid primary key default gen_random_uuid(), article_id uuid not null references public.articles(id) on delete cascade,
 platform text not null check(platform in ('substack_article','medium','linkedin_article','substack_note','devto')),
 adapted_title text, adapted_body text, tags text[], canonical_override text,
 scheduled_for timestamptz, published_url text,
 status text not null default 'pending' check(status in ('pending','waiting_for_canonical_index','published','failed'))
);
create table public.archive_entries (
 id uuid primary key default gen_random_uuid(),user_id text not null,title text not null,
 url text not null,source_feed text,content text not null default '',embedding extensions.vector(1536),
 created_at timestamptz not null default now(),unique(user_id,url)
);
create index articles_user_idx on public.articles(user_id);
create index publications_user_idx on public.publications(user_id);
create index destinations_article_idx on public.article_destinations(article_id);
create index archive_user_idx on public.archive_entries(user_id);
create index archive_embedding_idx on public.archive_entries using hnsw(embedding extensions.vector_cosine_ops);

alter table public.publications enable row level security;
alter table public.articles enable row level security;
alter table public.article_destinations enable row level security;
alter table public.archive_entries enable row level security;
create policy publications_owner on public.publications for all to authenticated using(user_id=(select auth.jwt()->>'sub')) with check(user_id=(select auth.jwt()->>'sub'));
create policy articles_owner on public.articles for all to authenticated using(user_id=(select auth.jwt()->>'sub')) with check(user_id=(select auth.jwt()->>'sub'));
create policy archive_owner on public.archive_entries for all to authenticated using(user_id=(select auth.jwt()->>'sub')) with check(user_id=(select auth.jwt()->>'sub'));
create policy destinations_owner on public.article_destinations for all to authenticated
 using(exists(select 1 from public.articles a where a.id=article_id and a.user_id=(select auth.jwt()->>'sub')))
 with check(exists(select 1 from public.articles a where a.id=article_id and a.user_id=(select auth.jwt()->>'sub')));

create function public.touch_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now();return new;end; $$;
create trigger articles_updated before update on public.articles for each row execute function public.touch_updated_at();

-- SECURITY INVOKER keeps row-level security in force, including when called via RPC.
create function public.match_archive(query_embedding extensions.vector(1536),match_count integer default 5)
 returns table(id uuid,title text,url text,similarity float)
 language sql stable security invoker set search_path='' as $$
 select a.id,a.title,a.url,1-(a.embedding operator(extensions.<=>) query_embedding) as similarity
 from public.archive_entries a
 where a.user_id=(select auth.jwt()->>'sub') and a.embedding is not null
 order by a.embedding operator(extensions.<=>) query_embedding
 limit least(greatest(match_count,1),20);
 $$;
revoke all on function public.match_archive(extensions.vector,integer) from public,anon;
grant execute on function public.match_archive(extensions.vector,integer) to authenticated;
