# 11: Fix README FRONTEND_ORIGIN drift

**What to build:** README says the local Wrangler config defaults to https://cycle-pro.pages.dev; apps/api/wrangler.toml uses http://127.0.0.1:5173.

**Blocked by:** None — fix in numeric order.

Status: ready-for-human

- [x] README matches the actual local and deployed FRONTEND_ORIGIN behaviour.

## Comments

- 2026-10-02: README now says the local Wrangler `FRONTEND_ORIGIN` is `http://127.0.0.1:5173` and CI overrides it with the repository variable. The Checks section now lists lint and unit tests.
