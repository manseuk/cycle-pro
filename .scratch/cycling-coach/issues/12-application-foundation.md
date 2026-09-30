# 12: Application foundation and local workflow

**What to build:** A developer can run the Cycling Coach application locally against persistent services, see that the API is available, and deploy the application through the agreed `main` workflow.

**Blocked by:** None (can start immediately).

**Status:** ready-for-human

- [x] A React, TypeScript, and Vite browser app and a Hono, TypeScript Worker API run locally.
- [x] Local development connects to a persistent local Supabase stack; restarting services does not erase records unless the stack is explicitly reset.
- [x] The browser app can confirm API availability through a user-visible or developer-visible health check.
- [x] Supabase schema changes can be applied as versioned migrations.
- [x] Deployment configuration supports publishing the frontend from `main` and deploying the Worker with Wrangler in CI.
- [x] Local database contents are not part of deployment.
- [x] The project has a documented command path to start local services and run its chosen automated checks.
