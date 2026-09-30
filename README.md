# Cycle Pro

A browser-based training companion for road cyclists.

## Requirements

- Node.js 22.12 or newer (the repository pins 22.12.0 in `.nvmrc`)
- pnpm 12.4.2
- Docker-compatible container runtime for the local Supabase stack
- Cloudflare and Supabase accounts for deployment

## Local development

Install dependencies and start the local database services:

```sh
pnpm install
pnpm supabase:start
```

In a second terminal, run the React app and Worker API:

```sh
pnpm dev:apps
```

Open <http://127.0.0.1:5173>. The page checks the Worker API and reports whether it is reachable. Vite proxies `/api` requests to the local Worker.

Supabase persists local database contents in its Docker volumes between restarts. Stop the stack with `pnpm supabase:stop`; use `pnpm supabase:reset` only when you want to reset local data and reapply migrations.

The local Supabase URL and keys are printed by `pnpm supabase:start`. Copy `apps/api/.dev.vars.example` to the ignored `apps/api/.dev.vars`, then replace the placeholder key with the local value when a Worker feature needs Supabase credentials. Never commit local credentials.

## Checks

```sh
pnpm typecheck
pnpm test:e2e
pnpm --filter @cycle-pro/web build
```

The browser-level tests start Vite and Wrangler automatically. Install the test browser once with `pnpm exec playwright install chromium` if it is not already available.

## Deployment

The GitHub Actions workflow verifies pull requests and deploys pushes to `main`. Configure these repository secrets:

- `CLOUDFLARE_API_TOKEN` — permission to deploy Workers and Pages
- `CLOUDFLARE_ACCOUNT_ID`
- `SUPABASE_DB_URL` — production database connection string for applying migrations

Configure the repository variable `API_BASE_URL` with the deployed Worker API base URL, such as `https://cycle-pro-api.<account-subdomain>.workers.dev`. The frontend and API must be deployed to Cloudflare before setting this variable for the first production build.

The Worker accepts browser requests from `https://cycle-pro.pages.dev` by default. Update its `FRONTEND_ORIGIN` variable if the Pages hostname changes. Supabase migration files are versioned under `supabase/migrations`; the main-branch deployment applies them before deploying the app. Local database contents are never deployed.
