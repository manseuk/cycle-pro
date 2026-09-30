Type: grilling
Status: resolved
Blocked by: 03, 11

## Question

Which frontend, TypeScript backend, database, authentication, and deployment choices should the MVP spec recommend? Settle a cohesive architecture for a free online POC, considering the user's Supabase preference and Cloudflare Free. Docker is optional. Record the important trade-offs and operating assumptions.

## Answer

- **Browser app:** React + TypeScript + Vite, deployed as static assets on Cloudflare Pages.
- **API:** Hono + TypeScript on Cloudflare Workers. Docker is optional and is not part of the hosted POC architecture.
- **Database and login:** Supabase Postgres with Supabase Auth. Use authenticated, user-scoped database access and Row Level Security so each user can only access their own ride and training data.
- **Local development:** Run the frontend and Worker locally, with the Worker pointed at a local Supabase development stack. Its database persists between runs until explicitly reset. Supabase's local stack requires a Docker-compatible runtime; that is a local development tool, not a hosting requirement.
- **Release flow:** Cloudflare Pages publishes the configured production branch (`main`); deploy the Worker from `main` with Wrangler in CI. Version database changes as migrations and apply them to the hosted Supabase project during deployment. Keep local development records separate; deploy code and schema changes, not local database contents.
- **POC limits to validate:** Cloudflare Workers Free allows 10 ms CPU per request, so measure FIT parsing with representative rides. Supabase Free has a 500 MB database quota; choose the parsed ride detail to retain with that limit in mind. Since original FIT files are discarded after import, no persistent object storage is needed.

See the [Cloudflare hosting research](../research/cloudflare-hosting.md) and [TypeScript stack research](../research/typescript-stack.md) for source documentation and trade-offs. See [Supabase local development](https://supabase.com/docs/guides/local-development/cli-workflows) and [Cloudflare Pages Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/) for the local-to-main workflow.
