# 10: Loading and error states

Status: ready-for-agent

## Parent

[Frontend navigation and redesign spec](../../frontend-navigation/spec.md)

## What to build

Shared data fails independently and never blocks the shell. A page that needs failed data shows an inline error with a Retry button where that content would go; other pages work normally. Loading and success messages use `role="status"`; failure messages, including failed saves and the Retry prompts, use `role="alert"`. The shell shows "Loading your account…" only while the session is checked; each page then shows its own inline loading text (existing wording, no spinners or skeletons), and `/rides/:id` shows its loading text before the ride or "Ride not found".

## Acceptance criteria

- [ ] Forcing a failure of one data source (e.g. rides) shows an inline error with Retry on the pages that need it, and other pages keep working.
- [ ] Retry reloads the data and clears the error on success.
- [ ] Failure messages have `role="alert"`; loading and success messages have `role="status"`.
- [ ] The shell blocks only on the session check.
- [ ] E2E tests cover at least one failure-and-retry path; the axe scan passes.

## Blocked by

04-rides-and-ride-detail.md, 05-goals-page.md, 06-zwift-options-page.md, 07-training-load-page.md, 08-calendar-page.md, 09-today-composition.md
