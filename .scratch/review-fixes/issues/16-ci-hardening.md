# 16: Pin CI actions and document migration ordering

**What to build:** GitHub Actions are pinned to tags, and migrations deploy before the app, leaving the schema ahead if app deploy fails.

**Blocked by:** None — fix in numeric order.

Status: ready-for-human

- [x] Actions are pinned to commit SHAs (with tag comments).
- [x] The README states that migrations must remain backward compatible with the previously deployed app.

## Comments

- 2026-10-02: checkout, setup-node, and pnpm/action-setup are pinned to the commit SHAs their `v4` tags currently resolve to, with `# v4` comments. README states the backward-compatible migration rule (which ticket 02's backfill-then-constrain migration follows).
