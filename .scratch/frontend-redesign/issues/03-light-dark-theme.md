# 03: Light and dark theme

Status: ready-for-agent

## Parent

[Frontend navigation and redesign spec](../../frontend-navigation/spec.md)

## What to build

Users can use the app in light or dark. It follows the operating-system setting until the user picks explicitly; the pick is stored in this browser only (`localStorage`, no database change). A quick toggle sits in the top bar and on the auth screens; Account has an Appearance setting (System / Light / Dark radio group) so "System" can be restored. A small inline script in `index.html` applies the theme before first render, and the active theme drives `theme-color` and `color-scheme`. The toggle is a button whose accessible name states the action ("Switch to dark theme") and updates with state. Dark token values come from the prototype palette (branch `prototype/visual-direction`); any animation respects `prefers-reduced-motion`.

## Acceptance criteria

- [ ] With no saved pick the page follows the emulated system colour scheme.
- [ ] The top-bar toggle switches theme and the pick persists across reload; it also works on the sign-in screen.
- [ ] Account's Appearance radio group offers System, Light and Dark, and choosing System removes the saved pick.
- [ ] No flash of the wrong theme on load.
- [ ] `theme-color` and `color-scheme` follow the active theme.
- [ ] E2E tests cover system-follow, persistence and restoring System; the axe scan passes in both themes for the pages that exist.

## Blocked by

01-shell-router-shared-data.md
