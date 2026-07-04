create extension if not exists pgcrypto;

create table if not exists public.site_content (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.news_posts (
  id text primary key,
  slug text not null unique,
  label text not null default 'News',
  title text not null,
  excerpt text not null default '',
  content text not null default '',
  date_text text not null default '',
  location text not null default '',
  image_url text,
  is_published boolean not null default true,
  like_count integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.uploaded_documents (
  id text primary key,
  slug text not null unique,
  title text not null,
  category text not null default 'Bulletin',
  summary text not null default '',
  date_text text not null default '',
  file_url text not null,
  cover_image text,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.site_content (id, payload)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;

create or replace function public.set_site_content_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_site_content_updated_at on public.site_content;
drop trigger if exists set_news_posts_updated_at on public.news_posts;
drop trigger if exists set_uploaded_documents_updated_at on public.uploaded_documents;

create trigger set_site_content_updated_at
before update on public.site_content
for each row
execute function public.set_site_content_updated_at();

create trigger set_news_posts_updated_at
before update on public.news_posts
for each row
execute function public.set_updated_at();

create trigger set_uploaded_documents_updated_at
before update on public.uploaded_documents
for each row
execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('church-media', 'church-media', true)
on conflict (id) do update
set public = excluded.public;
