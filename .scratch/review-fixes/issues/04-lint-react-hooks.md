# 04: Add a linter with React hooks rules

**What to build:** No linter is configured; several hooks intentionally omit dependencies, which hides real mistakes.

**Blocked by:** None — fix in numeric order.

Status: ready-for-human

- [x] A lint command runs over apps/web and apps/api and is part of `pnpm check` and CI.
- [x] react-hooks rules are enabled; intentional omissions are fixed or explicitly annotated.
- [x] Lint passes on main.

## Comments

- 2026-10-02: Added oxlint (one devDependency; it doesn't need TypeScript's JS API, which TypeScript 7 changed) with the correctness category plus react-hooks rules. `pnpm lint` is part of `pnpm check` and CI. The hook findings were fixed by deriving `userId` once, keeping the existing "refetch only on user change" behaviour without suppressions. Turned off the React Compiler-style `react/purity` and `react/set-state-in-effect` rules: they flag most effects in the app and would need a separate refactor (ticket 17 is the place to revisit them). Also removed a single-item `Promise.all`.
