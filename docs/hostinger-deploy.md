# Hostinger Deployment

This repository is meant to use Hostinger's built-in GitHub deployment.

## 1. Deployment form values

In Hostinger, use:

- `Package manager`: `pnpm`
- `Root directory`: `/`
- `Build command`: `pnpm build`
- `Output directory`: leave blank if allowed, otherwise `.next`

This is a real Next.js app, so do not use `out` as the output directory.

## 2. Production environment variables

Add these values in Hostinger before the first deploy:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SECRET`
- `NEXT_PUBLIC_SITE_URL=https://ollpenugu.com`
- `SITE_URL=https://ollpenugu.com`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET=church-media`

## 3. Automatic redeploys

After the repository is connected:

1. make sure the branch is `main`
2. enable Hostinger's automatic redeploy option if it appears
3. use Hostinger's built-in redeploy button when you want to trigger a manual refresh

## 4. First-time checklist

Before going live, make sure:

- `ollpenugu.com` is attached to the Hostinger app
- SSL is enabled
- Supabase schema is already applied
- all production environment variables are saved
- GitHub is connected to the correct repository and branch

## 5. If deployment fails

Check these first:

- package manager is really `pnpm`
- root directory is exactly `/`
- build command is exactly `pnpm build`
- output directory is blank or `.next`
- required environment variables are filled in

If you want, the next step can be to compare Hostinger's build log with this setup and correct the exact failing line.
