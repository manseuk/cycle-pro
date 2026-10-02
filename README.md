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
pnpm dev
```

This starts Supabase, synchronizes its local API URL and anonymous key into the ignored Worker `.dev.vars`, then starts the React app and Worker API. Open <http://127.0.0.1:5173>. The page checks both API and Supabase Auth reachability. Vite proxies `/api` requests to the local Worker.

To start the services separately, use:

```sh
pnpm supabase:start
# in another terminal
pnpm dev:apps
```

Supabase persists local database contents in its Docker volumes between restarts. Stop the stack with `pnpm supabase:stop`; use `pnpm supabase:reset` only when you want to reset local data and reapply migrations.

The `dev:apps` command reads the local connection values from `supabase status` each time it starts. The generated `apps/api/.dev.vars` is ignored by Git. Never commit local credentials.

## Checks

```sh
pnpm lint
pnpm typecheck
pnpm test:unit
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

Configure the repository variables `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `FRONTEND_ORIGIN` for the deployed Supabase project and Pages origin. `SUPABASE_ANON_KEY` is the public client key. These values are passed to Wrangler as Worker variables during deployment, so the health check verifies the configured Supabase Auth service.

The local Wrangler config sets `FRONTEND_ORIGIN` to `http://127.0.0.1:5173` (the Vite dev server); CI overrides it with the `FRONTEND_ORIGIN` repository variable so the production API only accepts the configured Pages hostname.

In the production Supabase project, set the minimum password length to 8 (Authentication → Policies) to match the app and `supabase/config.toml`. Supabase migration files are versioned under `supabase/migrations`; the main-branch deployment applies them before deploying the app. If the app deploy then fails, the previous app keeps running against the new schema, so every migration must stay backward compatible with the currently deployed app (add columns and tables, backfill before adding constraints; remove or rename only in a later release). Local database contents are never deployed.
