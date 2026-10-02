# 18: Remove ambiguous status locators from e2e

**What to build:** Multiple elements use role=status, so bare getByRole('status') assertions collide and flake.

**Blocked by:** None — fix in numeric order.

Status: ready-for-human

- [x] No e2e assertion uses an unscoped getByRole('status').
- [x] The suite passes on three consecutive runs.

## Comments

- 2026-10-02: Replaced every bare `getByRole('status')` with a text locator for the exact message, and the ambiguous goal-name text assertion with a heading locator (it also matched the Ramp Test explanation). Passed 120/120 (12 tests × 10 repeats).
