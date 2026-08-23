# Happy Body

A mobile-first static web app and installable PWA that helps people understand their current movement level, find a useful next step and record progress. It works without an account and offers optional passwordless sign-in for private multi-device syncing.

The prototype includes Squat, Push-up and Pull-up pathways. Product assumptions, the screen map and the extensible data model are documented in [`docs/MVP.md`](docs/MVP.md).

## Preview locally

Prerequisites: Node.js 22+ and pnpm 11.

```bash
pnpm install
pnpm run dev
```

Open the local address printed in the terminal, normally `http://localhost:3000`.

Copy `.env.example` to `.env.local` and add the Supabase project URL and publishable key to test cloud sync locally. Never use a Supabase secret or service-role key in this static app.

## Build the static GitHub Pages version

```bash
pnpm run build:pages
```

The static site is written to `out/`. You can preview that folder with any static file server.

## Publish with GitHub Pages

1. Create an empty GitHub repository and push this project to its `main` branch.
2. In **Settings → Pages**, choose **GitHub Actions** as the source.
3. The included workflow builds and publishes every push to `main`.
4. For a temporary `username.github.io/repository` address, create a repository Actions variable named `HAPPY_BODY_BASE_PATH` with the value `/repository`.
5. For the final custom domain, leave `HAPPY_BODY_BASE_PATH` empty and set `HAPPY_BODY_SITE_URL` to the full `https://` domain.
6. To enable account sync, add `HAPPY_BODY_SUPABASE_URL` and `HAPPY_BODY_SUPABASE_PUBLISHABLE_KEY` as repository Actions variables. These values are intentionally public in a browser app; data access is protected by Supabase row-level security.

## Connect a GoDaddy domain

After the first Pages deployment, enter the chosen domain in GitHub under **Settings → Pages → Custom domain**. GitHub will show the exact DNS records to add in GoDaddy. Add those records, wait for DNS verification, and enable **Enforce HTTPS**.

If using the root domain, GitHub normally requests `A`/`AAAA` records. If using `www`, it normally requests a `CNAME`. Follow the values GitHub displays for the repository rather than copying old DNS values from a tutorial.

## Local data and account sync

Progress is always cached under `happy-body-progress-v1` in browser `localStorage`, so the app continues to work offline. A user can optionally request a passwordless email link; after sign-in, practices, assessments, pathway levels and milestones sync to Supabase. Existing local progress is migrated on first sign-in and later offline changes retry automatically.

The database definition is versioned in `supabase/migrations/`. Every progress table has row-level security tied to the signed-in user. The browser receives only the publishable key; privileged Supabase keys must never be exposed or committed.
