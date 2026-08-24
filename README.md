# Happy Body

Happy Body is a calm, mobile-first personal movement guide. It helps a person understand what their body can do now, keep unknowns honest, and choose a useful next step without turning movement into a competition.

The current version includes:

- seven-step onboarding with goals, limitations, time, practice style and equipment;
- a Body Map with explicit unknown, assessed, in-progress, achieved, reassessment, temporary-limitation and pain states;
- a nuanced foundation movement check and pathway-specific self-assessments;
- a deterministic Today recommendation engine with pain, equipment, fatigue, recency, time and goal rules;
- complete Squat (9), Push-up (10) and Pull-up (11) progression ladders;
- three-tap quick practice logging plus optional details;
- Progress, Explore, Diary and Settings experiences;
- versioned `localStorage`, export/import/reset tools and safe migration from `happy-body-progress-v1`;
- optional private Supabase account sync, Google sign-in and passwordless email sign-in;
- an installable static PWA deployed on GitHub Pages.

Product behavior and the exact recommendation rules are documented in [`docs/MVP.md`](docs/MVP.md).

## Preview locally

Prerequisites: Node.js 22+ and pnpm 11.

```bash
pnpm install
pnpm run dev
```

Open the local address printed in the terminal, normally `http://localhost:3000`.

Copy `.env.example` to `.env.local` and add the Supabase project URL and publishable key to test optional cloud sync. Never place a Supabase service-role key or OAuth client secret in this static app.

## Verify

```bash
pnpm test
pnpm run lint
pnpm run build:pages
```

The static GitHub Pages output is written to `out/`.

## Publish with GitHub Pages

Every push to `main` is built and deployed by `.github/workflows/deploy-pages.yml`.

- `HAPPY_BODY_SITE_URL` should be `https://happybody.fit`.
- `HAPPY_BODY_BASE_PATH` should remain empty for the custom domain.
- `HAPPY_BODY_SUPABASE_URL` and `HAPPY_BODY_SUPABASE_PUBLISHABLE_KEY` are public browser configuration values; row-level security protects private data.
- The Google OAuth client ID is a public identifier. Its secret remains only in Supabase.

The domain remains configured in GitHub Pages and GoDaddy. The checked-in manifest and service worker support the custom-domain PWA.

## Local data and account sync

Version 2 data is stored under `happy-body-data-v2`. The app first checks for that document and otherwise safely reads the original `happy-body-progress-v1` record.

Untouched fake prototype defaults are not converted into real levels. Meaningful legacy practices, assessments and milestones are preserved and mapped onto the expanded progression ladders.

Signed-in accounts store the complete versioned document in Supabase `happy_body_state`. Row-level security restricts every record to its authenticated owner. The original normalized tables remain as a temporary compatibility fallback.
