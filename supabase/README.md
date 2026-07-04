# Supabase Setup

This project can run in two modes:

- Local fallback: content is read from `data/site-content.json`
- Netlify-ready mode: content and uploads are stored in Supabase

## What to set

Add these environment variables locally and in Netlify:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`

The default storage bucket name is `church-media`.

## What to create in Supabase

1. Run `supabase/schema.sql` in the Supabase SQL editor.
2. Confirm these tables exist:
   - `site_content`
   - `news_posts`
   - `uploaded_documents`
3. Confirm the `church-media` storage bucket exists and is public.

## What this enables

- Persistent admin content storage on Netlify
- News stories with full public links
- Image uploads for news stories
- Document uploads for bulletins and special events
- Public image and file URLs served from Supabase storage
