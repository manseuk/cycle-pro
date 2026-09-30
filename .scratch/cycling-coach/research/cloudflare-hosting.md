# Cloudflare Free hosting fit

**Checked:** 2026-09-29 against current first-party docs. Limits and prices can change.

## Answer

Cloudflare Free can host a browser TypeScript frontend and a lightweight TypeScript API, use Supabase Postgres, and store FIT uploads in R2. It does **not** meet the requirement that the backend itself run in Docker: Cloudflare Containers are available on Workers Paid, not Free. A practical free-tier prototype therefore replaces the Dockerized API with a Cloudflare Worker. If Docker is a firm deployment constraint, choose a separate container host or budget for a paid container service; keep Supabase as the database if desired.

## Facts from provider docs

- **Browser frontend:** Cloudflare Pages supports Vite builds and deploys static output. Free Pages allows up to 500 builds/month, 20,000 files, and 25 MiB per file. [Pages Vite guide](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/) · [Pages limits](https://developers.cloudflare.com/pages/platform/limits/)
- **TypeScript API without a container:** Workers run JavaScript/TypeScript on V8 and provide partial Node.js compatibility; compatibility is not equivalent to a general Node runtime. Free Workers allow 100,000 requests/day, 128 MB memory, and 10 ms CPU per request. Requests have up to 100 MB body size on the Free Cloudflare account plan. CPU-heavy parsing can exceed 10 ms; Cloudflare specifically calls out heavy parsing workloads as often taking 10–20 ms. [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) · [Node.js compatibility](https://developers.cloudflare.com/workers/runtime-apis/nodejs/)
- **Docker:** Cloudflare Containers run container images but are explicitly available on Workers Paid. The paid Workers plan starts at $5/month; container CPU/memory/disk are metered with included allowances. Thus Docker backend + Cloudflare Free is not a supported combination. [Containers overview](https://developers.cloudflare.com/containers/) · [Containers pricing](https://developers.cloudflare.com/containers/platform/pricing/) · [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- **Supabase Postgres:** Cloudflare Hyperdrive explicitly documents connecting Workers to Supabase Postgres, recommends the direct database connection string, and provides connection pooling. Hyperdrive is available on Free with 100,000 database statements/day; statements include reads, writes, and schema changes. [Hyperdrive Supabase guide](https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/postgres-database-providers/supabase/) · [Hyperdrive pricing](https://developers.cloudflare.com/hyperdrive/platform/pricing/)
- **R2 FIT storage:** R2 can be bound directly to a Worker. Standard storage includes 10 GB-month, 1 million Class A operations/month, and 10 million Class B operations/month, with no egress charge; overages are billed. R2 supports objects up to 5 TiB. [R2 Workers API](https://developers.cloudflare.com/r2/get-started/workers-api/) · [R2 pricing](https://developers.cloudflare.com/r2/pricing/) · [R2 limits](https://developers.cloudflare.com/r2/platform/limits/)
- **Uploads:** Worker request bodies are limited to 100 MB on Free, sufficient for typical FIT uploads in principle. A better design is direct-to-R2 upload or streaming to avoid routing file bytes through the API; authenticate/authorize the upload and keep bucket access private. [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) · [R2 Workers API](https://developers.cloudflare.com/r2/get-started/workers-api/)
- **Supabase free quotas:** Free includes 500 MB database size per project, 1 GB file storage, 50,000 MAU, and 5 GB egress (pricing page also lists 5 GB cached egress); inactive Free projects can pause after seven days. Supabase Storage Free uploads are capped at 50 MB per file, so R2 is more spacious for retained FIT originals. [Supabase billing](https://supabase.com/docs/guides/platform/billing-on-supabase) · [Supabase file limits](https://supabase.com/docs/guides/storage/uploads/file-limits) · [Free project pausing](https://supabase.com/docs/guides/platform/free-project-pausing)

## Inference for this app

- Calendar queries, auth checks, goal CRUD, and small aggregate reads are plausible Worker workloads within Free limits at small scale. Measure real requests and watch the 100k/day and 10ms CPU ceilings.
- FIT parsing and deriving ride samples/training-load metrics may not reliably fit the 10 ms CPU budget, especially for larger files or many records. The research does not establish a benchmark for a chosen parser. Prototype the specific parser with representative rides before committing to a Worker-only backend. Alternatives are asynchronous/background processing or a paid/container backend.
- FIT is binary and normally modest in size; direct R2 storage separates original files from the constrained Postgres quota. Store metadata and derived summaries in Supabase; keep R2 object keys private and scoped to user ownership.
- “Free tier” is suitable for an experiment, not a dependable production promise: both providers impose quotas, and Supabase Free can pause inactive projects. Plan for paid usage or an upgrade path if real users rely on the service.

## Architecture options

1. **All free, no Docker:** Vite/React static app on Pages; TypeScript API on Workers; Supabase Postgres via Hyperdrive; private R2 for FIT files. Validate FIT parsing CPU and auth integration early.
2. **Docker required:** Keep the same browser app and Supabase database, but run the API on a container platform. Cloudflare Containers require Workers Paid, so this option is not all-free on Cloudflare. Cloudflare can still serve the frontend and R2 files.

This research answers hosting feasibility only; it does not select authentication, prescribe background-job mechanics, or establish privacy/security configuration.
