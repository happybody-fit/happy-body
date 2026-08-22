# Happy Body

A mobile-first static web app and installable PWA that helps people understand their current movement level, find a useful next step and record progress without creating an account.

The prototype includes Squat, Push-up and Pull-up pathways. Product assumptions, the screen map and the extensible data model are documented in [`docs/MVP.md`](docs/MVP.md).

## Preview locally

Prerequisites: Node.js 22+ and pnpm 11.

```bash
pnpm install
pnpm run dev
```

Open the local address printed in the terminal, normally `http://localhost:3000`.

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

## Connect a GoDaddy domain

After the first Pages deployment, enter the chosen domain in GitHub under **Settings → Pages → Custom domain**. GitHub will show the exact DNS records to add in GoDaddy. Add those records, wait for DNS verification, and enable **Enforce HTTPS**.

If using the root domain, GitHub normally requests `A`/`AAAA` records. If using `www`, it normally requests a `CNAME`. Follow the values GitHub displays for the repository rather than copying old DNS values from a tutorial.

## Local data and future accounts

Progress is stored under `happy-body-progress-v1` in browser `localStorage`. Clearing browser data or changing device removes access to that local history. A future Supabase or Firebase integration can implement the repository interface in `lib/storage.ts` while leaving the screens and pathway data intact.
