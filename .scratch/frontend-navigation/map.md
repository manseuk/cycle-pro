## Destination

A build-ready spec for redesigning the Cycle Pro frontend: a navigation menu with a page per logical function, real URLs, and one chosen modern, mobile-first visual direction with a light/dark switch. This map plans the spec; it does not build it. The consolidated spec is [spec.md](spec.md); all planned decisions are resolved.

## Notes

- Layout and restyle only. Behaviour, data and the domain model are unchanged; new features are handled separately.
- Page map is settled: see Navigation and page contents.
- Each page gets a real URL (client-side router plus Cloudflare Pages SPA fallback).
- Auth screens (sign in, register, reset) use their own layout with no menu; the navigation shell wraps signed-in pages only.
- Look is new (no existing site as reference), modern, mobile-first, with a user-selectable light/dark mode. The user prefers light.
- Current state: React 19 + Vite, no router, plain `apps/web/src/styles.css`, single `App.tsx` plus four section components. E2E tests in `tests/e2e` will need migrating.
- Consult `docs/agents/issue-tracker.md`, `docs/agents/domain.md`, `GLOSSARY.md`.

## Decisions so far

- [Router and hosting](issues/02-router-and-hosting.md): wouter plus `React.lazy` per page; Pages already serves the SPA fallback (no `404.html`), so no hosting change.

- [Visual direction](issues/01-visual-direction.md): variant B "Performance board" (bold type, big numbers, ruled rows, lime accent, full-screen menu on phones, top tabs on desktop); prototype on branch `prototype/visual-direction`.
- [Navigation and page contents](issues/03-navigation-and-page-contents.md): variant B nav with sign out always reachable; Today / Calendar / Rides / Ride detail (`/rides/:id`) / Training load / Goals / Zwift options / Account; time zone moves to Account; new-user next-step prompts on Today.
- [Theme behaviour](issues/04-theme-behaviour.md): follow the system until the user picks; pick stored in the browser only; top-bar quick toggle plus Account Appearance (System/Light/Dark); inline script prevents a flash.
- [Shared state across pages](issues/05-shared-state-across-pages.md): one signed-in provider for session/goal/rides/time zone/planned workouts/Zwift options; `App.tsx` becomes a shell with one component per page owning its forms; signed-out deep links render the auth layout at the same URL; ride-not-found and page-not-found states.
- [Styling approach](issues/06-styling-approach.md): plain CSS with custom-property tokens (prototype palette, system fonts), `data-theme` light/dark, split into tokens/base/shell plus per-page CSS, old `styles.css` deleted; WCAG AA contrast required.
- [E2E migration](issues/07-e2e-migration.md): split the one spec into per-page specs with a shared signed-in helper; role/name selectors replace the four class selectors; new checks for deep links, not-found, next-step prompts, theme and phone-width menu; one phone-viewport project for the shell spec only.
- [Accessibility](issues/08-accessibility.md): native `<dialog>` for the phone menu; focus to `h1`, title update, skip link, landmarks and `aria-current` on route change; axe scan of every page in both themes in the E2E suite.
- [Loading and error states](issues/09-loading-and-error-states.md): shared data fails independently with per-page inline errors and Retry; status for loading/success, alert for failures; shell blocks only on the session check.

## Not yet specified


## Out of scope

- New features, and any domain or data-model changes (including new ride-detail features; the ride page is only created as a home for them).
