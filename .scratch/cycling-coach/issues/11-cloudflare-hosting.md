Type: research
Status: resolved

## Question

Can Cloudflare's current Free plan host the MVP with a browser frontend, TypeScript backend, Supabase PostgreSQL, and parsed ride data stored in the database while original FIT files are discarded after import? Verify relevant quotas/pricing/runtime constraints from current official documentation, and identify what should be considered in the architecture decision. Docker is optional. Separate documented facts from inference.

## Answer

Cloudflare Free is a plausible online POC host if the TypeScript backend runs as a Worker rather than a Docker container. Cloudflare supports Workers-to-Supabase Postgres connections through Hyperdrive; its current Free allowances include 100,000 Worker requests/day and 100,000 Hyperdrive statements/day. Supabase Free includes a 500 MB database quota and can pause inactive projects after seven days. Worker CPU is limited to 10 ms per request, so parsing representative FIT files must be measured before committing. Since raw files will be discarded after import, R2 is optional rather than required. See the [Cloudflare hosting report](../research/cloudflare-hosting.md) for citations and alternative deployment shapes.
