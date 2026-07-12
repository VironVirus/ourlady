-- St Camillus de Lellis Chaplaincy
-- Fresh Supabase setup for content, news, document uploads, and public media.
-- Run this in the SQL editor of a NEW Supabase project.

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

create table if not exists public.attendance_requests (
  id text primary key,
  title text not null,
  date_text text not null default '',
  location text not null default '',
  note text not null default '',
  opens_at text,
  closes_at text,
  token text not null unique,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.attendance_records (
  id text primary key,
  request_id text not null references public.attendance_requests (id) on delete cascade,
  full_name text not null,
  department text not null default '',
  level_text text not null default '',
  identifier text not null,
  checked_in_at timestamptz not null default timezone('utc', now()),
  unique (request_id, identifier)
);

create table if not exists public.confession_schedules (
  id text primary key,
  title text not null,
  date_text text not null default '',
  location text not null default '',
  note text not null default '',
  start_time text not null default '',
  end_time text not null default '',
  slot_minutes integer not null default 10,
  max_per_slot integer not null default 1,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.confession_reservations (
  id text primary key,
  schedule_id text not null references public.confession_schedules (id) on delete cascade,
  full_name text not null,
  department text not null default '',
  level_text text not null default '',
  identifier text not null,
  time_slot text not null,
  note text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  unique (schedule_id, identifier)
);

create table if not exists public.missal_entries (
  id text primary key,
  entry_type text not null default 'daily',
  language text not null default 'English',
  date_text text not null default '',
  title text not null,
  celebration text not null default '',
  is_published boolean not null default true,
  sections jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.hymn_plans (
  id text primary key,
  date_text text not null default '',
  title text not null,
  note text not null default '',
  is_published boolean not null default true,
  hymns jsonb not null default '[]'::jsonb,
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
drop trigger if exists set_attendance_requests_updated_at on public.attendance_requests;
drop trigger if exists set_confession_schedules_updated_at on public.confession_schedules;
drop trigger if exists set_missal_entries_updated_at on public.missal_entries;
drop trigger if exists set_hymn_plans_updated_at on public.hymn_plans;

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

create trigger set_attendance_requests_updated_at
before update on public.attendance_requests
for each row
execute function public.set_updated_at();

create trigger set_confession_schedules_updated_at
before update on public.confession_schedules
for each row
execute function public.set_updated_at();

create trigger set_missal_entries_updated_at
before update on public.missal_entries
for each row
execute function public.set_updated_at();

create trigger set_hymn_plans_updated_at
before update on public.hymn_plans
for each row
execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('st-camillus-media', 'st-camillus-media', true)
on conflict (id) do update
set public = excluded.public;
