# 11: Cleanup and sign-off

Status: ready-for-human

## Parent

[Frontend navigation and redesign spec](../../frontend-navigation/spec.md)

## What to build

Finish the redesign. Delete the old `styles.css` and any leftover legacy markup once every page has moved, fix any AA contrast failures the axe scan surfaces in either theme (muted greys and chart colours in particular), and do the manual keyboard and screen-reader pass that automation can't judge. Verify the two open items from the spec: wouter's gzipped bundle size and whether the optional `public/_redirects` safeguard is worth adding (do not add a `404.html`). A person signs off the visual result against variant B on phone and desktop in both themes.

## Acceptance criteria

- [ ] `styles.css` is deleted and nothing references it.
- [ ] The axe scan passes on every page in light and dark with no contrast failures.
- [ ] A keyboard-only and screen-reader pass of the menu, route changes, calendar and forms finds no blockers.
- [ ] Bundle size and the `_redirects` question are checked and the outcome recorded.
- [ ] The user has signed off the look on phone and desktop in both themes.

## Blocked by

01-shell-router-shared-data.md through 10-loading-and-error-states.md
