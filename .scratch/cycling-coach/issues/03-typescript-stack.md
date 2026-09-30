Type: research
Status: resolved

## Question

Given a browser frontend and a TypeScript backend running in Docker, what simple MVP stack choices fit this application for frontend framework, API/runtime, persistence, authentication, and deployment? Compare a small number of plausible options using current official documentation, and recommend a cohesive stack with trade-offs. Do not implement it.

## Answer

Recommended starting point: React + Vite browser app; Hono TypeScript/Node API in Docker; Better Auth email/password; PostgreSQL with Drizzle; Docker Compose for local API/database orchestration. Keep FIT originals in durable file storage and enforce ownership by authenticated user ID. Hosting, email delivery, backups, upload limits, and deployment details remain decisions for the architecture ticket. See the [TypeScript stack research report](../research/typescript-stack.md) for citations and trade-offs.
