# MVP TypeScript stack recommendation

## Recommendation

Use a small TypeScript monorepo with a browser-only React app and a separate Node API:

| Layer | Recommendation |
| --- | --- |
| Browser app | React + TypeScript + Vite (`react-ts` starter); compile to static assets. |
| API | Hono + TypeScript on Node.js, built as a Docker image. Pin a currently maintained Node LTS image when implementation starts. |
| Authentication | Better Auth, email/password for the first release, mounted in Hono. Use cookie sessions. Configure a transactional email provider before enabling verification and password-reset flows. |
| Database | PostgreSQL, accessed with Drizzle ORM and `pg`; commit generated SQL migrations and apply them as a deployment step. |
| Local orchestration | Docker Compose for the API and PostgreSQL, with a persistent database volume and a DB health check. Serve the Vite app in the browser through the Vite dev server locally. |

This keeps the browser assets static, makes the API independently containerized as requested, and uses one language across both sides. Hono is recommended over a heavier server framework because Better Auth documents a direct Hono integration: both use standard Request/Response APIs, and Hono can mount the auth handler without an adapter. This is a fit judgment, not a claim that Hono is universally simpler or faster. [Hono on Node.js](https://hono.dev/docs/getting-started/nodejs), [Better Auth Hono integration](https://better-auth.com/docs/integrations/hono)

## Evidence and implications

- **Frontend:** Vite provides a `react-ts` starter, transforms TypeScript, and creates optimized static output in `dist`. Vite explicitly says its preview server is for local preview, not production; deploy the static output to a static host or serve it behind a production web server. Type checking should be a separate build/CI command because Vite transpilation alone does not type-check. [Vite getting started](https://vite.dev/guide/), [Vite features and TypeScript](https://vite.dev/guide/features), [Vite static deployment](https://vite.dev/guide/static-deploy.html)
- **API runtime:** Hono provides a Node.js adapter and a Node Dockerfile example. The Hono guide's sample uses Node 22; select a maintained LTS line and pin a specific image tag/digest for reproducible deployments. Node's release page is the source of truth for which major versions are LTS at implementation time. [Hono Node.js guide](https://hono.dev/docs/getting-started/nodejs), [Node.js release status](https://nodejs.org/en/about/previous-releases)
- **Authentication:** Better Auth has built-in email/password support and documents a Hono route mount. Its database stores users and sessions; it supports Drizzle as a PostgreSQL adapter. The email documentation describes bringing a transactional mail provider for verification and reset messages. [Better Auth basic usage](https://better-auth.com/docs/basic-usage), [Hono integration](https://better-auth.com/docs/integrations/hono), [Drizzle adapter](https://better-auth.com/docs/adapters/drizzle), [email flows](https://better-auth.com/docs/concepts/email)
- **Database/migrations:** Drizzle supports PostgreSQL via `node-postgres`. Its migration workflow generates SQL from the TypeScript schema and applies the committed migrations with `drizzle-kit migrate`. This makes schema changes reviewable; it does mean migrations need an explicit release step. [Drizzle PostgreSQL setup](https://orm.drizzle.team/docs/get-started-postgresql), [Drizzle migrations](https://orm.drizzle.team/docs/migrations)
- **Containers:** Docker Compose models the app as services and supports waiting for a dependency's health check before creating the dependent service. Use it for local development and a single-host MVP deployment; Compose itself does not supply production backups, secret management, TLS, or high availability. [Compose model](https://docs.docker.com/compose/intro/compose-application-model/), [startup order and health checks](https://docs.docker.com/compose/how-tos/startup-order/)

## Deployment shape (recommendation)

For local work, use `compose.yaml` for `api` and `db`; run Vite in dev mode in the browser-facing development workflow. For an initial hosted deployment, publish the Vite `dist` output to a static host and run the API container on a Docker-capable service with a managed PostgreSQL database. Put the browser and API behind one public origin, routing `/api/*` to the API, so auth cookies stay first-party and there is no need for cross-origin credentialed CORS. This routing is an architectural recommendation; choose the hosting provider later.

Keep each user-owned ride, goal, plan, and training metric row keyed by the authenticated user's stable ID, and enforce ownership in API queries. Store structured ride summaries and derived time-series metrics in PostgreSQL; keep original FIT uploads in durable file/object storage and store their storage key plus metadata in PostgreSQL. For a single-host prototype, a persistent mounted volume is viable; prefer object storage before horizontal scaling or multi-instance deployment. These storage and tenant-isolation choices are recommendations based on the stated product needs, not facts mandated by the frameworks.

## Keep out of the initial stack decision

- Do not add Redis, a job queue, Kubernetes, or a microservice split until FIT parsing or training calculations demonstrate a need for background processing or independent scaling.
- Do not make Zwift OAuth or workout upload part of this stack decision; treat the requested initial Zwift discovery/display flow as a separate integration question.
- Revisit hosting, email provider, backup/retention policy, upload limits, and whether raw FIT data should move to object storage before public launch.

