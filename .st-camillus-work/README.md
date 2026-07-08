# St Camillus de Lellis Chaplaincy Website

Next.js + TypeScript chaplaincy website for St Camillus de Lellis Chaplaincy, Maryland, College of Health Sciences, Okofia, Nnewi, Anambra State.

## Local development

1. Copy `.env.example` to `.env.local`.
2. Add your admin values. Supabase can stay blank until the new St Camillus project is ready.
3. Install dependencies with `pnpm install`.
4. Start the site with `pnpm dev`.

## Netlify deployment

This project is prepared for Netlify's current Next.js runtime.

- `netlify.toml` sets:
  - `NODE_VERSION=22`
  - `PNPM_FLAGS=--shamefully-hoist`
  - `NETLIFY_NEXT_SKEW_PROTECTION=true`
- `.node-version` keeps local and Netlify Node versions aligned.
- The project uses Netlify's built-in OpenNext support. Do not pin the old `@netlify/plugin-nextjs` plugin unless you intentionally want to opt out of automatic adapter updates.

### Before the first deploy

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. In Netlify, add these environment variables:
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `ADMIN_SECRET`
   - `NEXT_PUBLIC_ST_CAMILLUS_SUPABASE_URL`
   - `ST_CAMILLUS_SUPABASE_SERVICE_ROLE_KEY`
   - `ST_CAMILLUS_SUPABASE_STORAGE_BUCKET`
4. Connect the repository to Netlify and deploy.

### Important note

This St Camillus copy is intentionally disconnected from the older shared Supabase project. The public site can still read the bundled local content, but admin edits, news publishing, image uploads, and document uploads on Netlify should use a fresh St Camillus Supabase project. This repository blocks Netlify production writes if that new Supabase setup is missing so you do not end up with a broken live admin.

## Content storage

- Local development fallback: `data/site-content.json`
- Netlify production storage: Supabase tables and storage bucket

More setup notes are in `supabase/README.md`.
