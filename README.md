# Our Lady of Lourdes Catholic Church Website

Next.js + TypeScript parish website for Our Lady of Lourdes Catholic Church, Maryland, Enugu.

## Local development

1. Copy `.env.example` to `.env.local`.
2. Add your admin and Supabase values.
3. Install dependencies with `pnpm install`.
4. Start the site with `pnpm dev`.

## Hostinger deployment

This project is prepared for Hostinger's built-in GitHub deployment flow.

Use these values in Hostinger:

- `Package manager`: `pnpm`
- `Root directory`: `/`
- `Build command`: `pnpm build`
- `Output directory`: leave blank if Hostinger allows it, otherwise use `.next`

After the repository is connected in Hostinger, turn on automatic redeploy there so each push updates the live site.

Setup steps are in [docs/hostinger-deploy.md](docs/hostinger-deploy.md).

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
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_STORAGE_BUCKET`
4. Connect the repository to Netlify and deploy.

### Important note

The public site can read the bundled starter content without Supabase, but admin edits, news publishing, image uploads, and document uploads on Netlify should use Supabase. This repository now blocks Netlify production writes if Supabase is missing so you do not end up with a broken live admin.

## Content storage

- Local development fallback: `data/site-content.json`
- Netlify production storage: Supabase tables and storage bucket

More setup notes are in `supabase/README.md`.
