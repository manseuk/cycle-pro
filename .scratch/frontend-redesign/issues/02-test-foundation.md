# 02: Test foundation

Status: ready-for-agent

## Parent

[Frontend navigation and redesign spec](../../frontend-navigation/spec.md)

## What to build

Shared E2E scaffolding so later page slices can move their tests cleanly. Add one helper that registers, verifies and signs in a Cyclist and returns a signed-in page (replacing the steps copy-pasted across tests), the `@axe-core/playwright` dev dependency with a scan helper that runs a page in light and dark and fails on serious or critical violations, a phone-viewport Playwright project that runs only the shell/navigation spec, and a new shell/navigation spec covering the shell behaviour from the first slice.

## Acceptance criteria

- [ ] A shared signed-in helper exists and at least one existing test uses it.
- [ ] The axe helper scans a page in both themes and fails on serious or critical violations (dark scan becomes meaningful once the theme slice lands).
- [ ] A phone-viewport project runs only the shell/navigation spec; behaviour specs stay at desktop width.
- [ ] The shell/navigation spec covers: signed-in direct hit on a page URL, signed-out hit shows sign-in at the same URL then the page, unknown URL shows "Page not found", sign out reachable from the menu, phone menu opens, navigates and closes.
- [ ] Roles and names are used for locators, per `playwright-conventions`.

## Blocked by

01-shell-router-shared-data.md
