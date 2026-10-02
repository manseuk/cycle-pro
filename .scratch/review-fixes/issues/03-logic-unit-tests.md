# 03: Add small unit tests for training logic

**What to build:** calculateTrainingLoad, buildDailySuggestion, and isLikelyDuplicate have no direct tests; only e2e covers them indirectly.

**Blocked by:** None — fix in numeric order.

Status: ready-for-human

- [x] One small test file per module (or one shared file) runs with a single command and in CI.
- [x] Covers FTP-by-date selection, CTL/ATL/TSB progression, suggestion abstention paths, and duplicate tolerance edges.
- [x] No new test framework if Node's built-in test runner suffices.

## Comments

- 2026-10-02: Added `tests/unit/training-logic.test.ts` (8 tests) using Node's built-in runner with native type stripping, so there are no new dependencies. Duplicate detection moved to `apps/api/src/duplicates.ts` so it can be tested without loading the Worker. `pnpm test:unit` runs in `pnpm test` and CI. The root package.json is now `"type": "module"` to silence Node's module-type warning.
