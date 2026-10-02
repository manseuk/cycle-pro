# 01: Shell, router and shared data

Status: ready-for-agent

## Parent

[Frontend navigation and redesign spec](../../frontend-navigation/spec.md)

## What to build

Signed-in users get the new application shell with real URLs. A small `App.tsx` shell checks the session, provides one signed-in provider (session, goal, rides, calendar time zone, planned workouts, saved Zwift options, with the existing refresh callbacks) and routes with wouter and `React.lazy` per page. Design tokens and base/shell CSS are introduced in the plain-CSS structure from the spec (`tokens.css`, `base.css`, `shell.css`, per-page CSS), in the light theme for now. Navigation is top tabs on desktop and a MENU button opening a full-screen numbered native `<dialog>` on phones, listing only the pages that exist so far; later slices add their own entries. Today holds all the existing content unchanged for now. Account at `/account` has email, sign out and delete account. Sign out is also reachable from the menu and the top bar. Signed-out users see the auth layout (no menu) at whatever URL they opened, and the real page appears once signed in. An unknown URL shows "Page not found" inside the signed-in layout. Route changes move focus to the page `h1`, update the document title, and the shell has a skip link, landmarks and `aria-current="page"` on the active item.

## Acceptance criteria

- [ ] Opening `/` signed in shows Today with all existing content working as before.
- [ ] `/account` shows email, sign out and delete account; sign out is also in the phone menu and the desktop top bar.
- [ ] Opening `/account` signed out shows the auth layout at `/account`, then the Account page after signing in.
- [ ] An unknown URL shows "Page not found" inside the signed-in layout.
- [ ] At phone width the MENU button opens a native `<dialog>` (focus trapped, Escape closes, focus returns to the button, choosing a page closes it and focuses the new `h1`); desktop shows top tabs.
- [ ] Document title updates per page; skip link is the first focusable item; header, labelled `nav` and `main` landmarks exist; the active item has `aria-current="page"`.
- [ ] Shared data lives in the provider; form drafts and messages stay in the page that uses them; existing cross-page behaviour (check-in recalculates suggestion, accepting a workout updates the calendar) is unchanged.
- [ ] `pnpm check` passes; existing E2E tests still pass or are minimally adjusted.

## Blocked by

None - can start immediately
