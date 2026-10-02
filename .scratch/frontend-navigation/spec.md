# Frontend navigation and redesign: spec

Status: ready to build

Consolidates the decisions on the map ([map.md](map.md)); each section links the ticket that holds the detail. This is a **layout and restyle only**: behaviour, data and the domain model do not change, and new features are handled separately.

## Goal

Replace the single-page Cycle Pro frontend with a navigation menu and one page per logical function, each with a real URL, in one modern, mobile-first visual style (variant B, "Performance board") with a light/dark theme.

## Current state

- React 19 + Vite, no router, one plain stylesheet (`apps/web/src/styles.css`, 264 lines, hard-coded colours, 65 class names).
- `App.tsx` (515 lines) holds auth, goal, ride import and list, time zone, planned workouts and Zwift options, and renders four section components (`DailySuggestionSection`, `TrainingLoadSection`, `TrainingCalendar`, `SavedZwiftOptionsSection`).
- Deployed to Cloudflare Pages (`apps/web/wrangler.toml`, no `404.html`).
- One E2E spec, `tests/e2e/private-cyclist-accounts.spec.ts` (12 tests).

## Pages and URLs

([Navigation and page contents](issues/03-navigation-and-page-contents.md))

Every page has a real URL. Today is the landing page.

| Page | Contents |
|---|---|
| **Today** | Workout suggestion, recovery check-in, headline CTL/ATL/TSB/FTP numbers, goal summary, latest rides. For a new user, next-step prompts link to the right page: set a goal (Goals), import a first ride (Rides), add FTP (Training load); each disappears once done. |
| **Calendar** | Month and list views of rides, planned workouts and saved Zwift options. Ride entries link to the ride's own page. |
| **Rides** | FIT import, import results, compact table of rides. Each row opens the ride page. |
| **Ride detail** (`/rides/:id`) | All metrics, notes, delete. Built as a home for later features (not in scope here). |
| **Training load** | CTL/ATL trend chart and FTP history with FTP entry. |
| **Goals** | View and edit the primary active goal. |
| **Zwift options** | Saved options and the add form. |
| **Account** | Email, sign out, delete account, calendar time zone setting, Appearance (theme) setting. |

- The time zone setting moves from Rides to Account. Rides and Calendar show a small "times shown in <zone>" note linking to it.
- The existing Training load section is divided: the recovery check-in goes with the suggestion on Today, the trend chart and FTP history go to Training load.
- Auth screens (sign in, register, reset, new password) use their own layout with no menu; the navigation shell wraps signed-in pages only.
- **Signed-out deep links:** the URL stays as is and the auth layout renders in its place; the real page appears once signed in. No redirect code.
- `/rides/:id` waits for the provider's first load, then shows the ride or "Ride not found" with a link to Rides. An unknown URL shows "Page not found" inside the signed-in layout.

## Navigation

([Visual direction](issues/01-visual-direction.md), [Navigation and page contents](issues/03-navigation-and-page-contents.md), [Accessibility](issues/08-accessibility.md))

- **Phones:** a MENU button opens a full-screen numbered menu built as a native `<dialog>` opened with `showModal()` (focus trap, Escape and inert background from the browser). The button carries `aria-expanded`; focus returns to it on close. Choosing a page closes the menu and moves focus to the new page's heading.
- **Desktop:** horizontal top tabs.
- **Sign out** is always reachable: in the phone menu and at the right end of the desktop top bar. **Delete account** stays on the Account page only.
- The active item carries `aria-current="page"`.

## Routing and hosting

([Router and hosting](issues/02-router-and-hosting.md); [research report](research/router-and-hosting.md))

- Use **wouter** with `React.lazy` per page. Fall back to React Router declarative mode only if typed routes or loaders become necessary (React Router 8.4.0 needs Node >= 22.22; the repo pins 22.18).
- Hosting needs no change: a Cloudflare **Pages** project without a `404.html` serves the single-page-app fallback, so deep links already work. Do not add a `404.html`. (A move to Workers assets would need `not_found_handling = "single-page-application"`.)
- Unverified in the research: gzipped bundle sizes and the optional `_redirects` safeguard.

## Visual direction and styling

([Visual direction](issues/01-visual-direction.md), [Styling approach](issues/06-styling-approach.md))

- **Variant B, "Performance board":** bold uppercase headings, big tabular numbers, ruled rows instead of cards, hard-edged calendar cells. Light is black on off-white with lime highlights; dark is near-black with a lime accent.
- Mobile-first. Light and dark must both be fully supported.
- **Prototype reference:** branch `prototype/visual-direction`, files `apps/web/prototype.html` and `apps/web/src/prototype/` (run with `pnpm proto:ui` on that branch). It is throwaway: rewrite properly, do not promote.
- **Approach:** plain CSS with custom properties as design tokens. No styling library or component library.
- **Structure:** `tokens.css` (colour, type, spacing variables and both themes), `base.css` (reset, typography, shared controls, tables, calendar grid), `shell.css` (top bar, phone menu, desktop tabs, layout), plus one small CSS file per page imported by that page's component. `styles.css` is deleted once the last page has moved over; class names are free to change.
- **Tokens:** start from the prototype's palette (`--bg`, `--surface`, `--ink`, `--mute`, `--line`, `--accent`, `--on`, `--c1` to `--c3`, light and dark sets) with a system font stack and no web fonts.
- **Contrast:** WCAG AA for text and controls in both themes is an acceptance requirement; failing values are adjusted in the build.
- Any animation respects `prefers-reduced-motion`.

## Theme

([Theme behaviour](issues/04-theme-behaviour.md))

- Follows the operating-system light/dark setting until the user picks explicitly; an explicit pick wins thereafter.
- The pick is stored in this browser only (`localStorage`); no database or migration change.
- Controls: a quick light/dark toggle in the top bar (also on the sign-in screens) and an Appearance setting on the Account page (System / Light / Dark, a labelled radio group) so "System" can be restored.
- A small inline script in `index.html` applies the theme before first render, so there is no flash of the wrong theme. The active theme also drives `theme-color` and `color-scheme` so form controls, scrollbars and the mobile address bar match.
- The toggle is a button whose accessible name states the action ("Switch to dark theme") and updates with state.

## State and code structure

([Shared state across pages](issues/05-shared-state-across-pages.md))

- **One signed-in provider** (React context), loaded once after sign-in, holds session, goal, rides, calendar time zone, planned workouts and saved Zwift options, with the existing refresh callbacks. No data-fetching library.
- Section-local data (daily suggestion, recovery check-in, FTP rows) stays inside the sections. Form drafts, messages and busy flags stay in the page that uses them.
- `App.tsx` becomes a small shell: auth check, provider, router and menu, rendering the signed-out or signed-in layout.
- One component per page owns its forms and save/delete logic and writes results back to the provider (e.g. `setGoal`, `refreshRides`). `TrainingCalendar`, `DailySuggestionSection`, `TrainingLoadSection` and `SavedZwiftOptionsSection` stay mostly as they are.
- Cross-page behaviour is unchanged: saving a recovery check-in recalculates the suggestion; accepting a workout updates the calendar; saving or deleting a Zwift option refreshes the saved list. Changing FTP does not regenerate today's suggestion, same as now.

## Loading and errors

([Loading and error states](issues/09-loading-and-error-states.md))

- Shared data fails independently and never blocks the shell. A page that needs failed data shows an inline error with a **Retry** button where that content would go; other pages work normally.
- Loading and success messages use `role="status"`. Failure messages, including failed saves and the Retry prompts, use `role="alert"`.
- The shell shows "Loading your account…" only while the session is checked; then the layout appears at once and each page shows its own inline loading text (existing wording, no spinners or skeletons).

## Accessibility

([Accessibility](issues/08-accessibility.md))

- On every route change, focus moves to the page's `h1` and the document title updates (e.g. "Rides — Cycle Pro").
- A "Skip to main content" link is the first focusable item. Header, a labelled `nav` and `main` are real landmarks.
- The calendar keeps its existing button-per-day cells with descriptive labels and `aria-pressed`.
- `@axe-core/playwright` is added as a dev dependency; the shell/navigation spec scans every page in light and dark and fails on serious or critical violations (includes contrast). A manual keyboard and screen-reader pass stays on the pre-sign-off list.

## Testing

([E2E migration](issues/07-e2e-migration.md))

- Split `private-cyclist-accounts.spec.ts` into per-page specs: auth, goals, rides, calendar, training load and recovery, suggestion, Zwift, plus a new shell/navigation spec. The repeated register, verify-email and sign-in steps move into one shared helper returning a signed-in page. Specs navigate straight to the page under test; behaviour assertions are unchanged.
- Selectors: the three `.goal-card` lookups become table rows found by role and name (`getByRole('row', { name })`); the `.calendar-ride-detail` check becomes "clicking the ride lands on `/rides/:id` and its heading is visible". Prefer roles and names (`playwright-conventions`); add a test id only where no sensible role exists.
- New checks: signed-in direct hit on `/calendar`; signed-out hit on `/rides` shows sign-in at the same URL then the page after sign-in; unknown ride id shows "Ride not found"; unknown URL shows "Page not found"; Today next-step prompts and their disappearance; theme follows the emulated system colour scheme, an explicit toggle persists across reload, Account's Appearance restores "System"; sign out reachable from the menu; time zone setting present on Account; phone-width menu opens, navigates and closes.
- Config: add one phone-viewport Playwright project that runs only the shell/navigation spec; behaviour specs stay at desktop width.

## Out of scope

- New features, and any domain or data-model changes, including new ride-detail features (the ride page is only created as a home for them).
- Storing the theme on the account, a data-fetching library, and a styling or component library.

## Open items to verify during the build

- Gzipped bundle size of wouter and the optional `public/_redirects` safeguard (not confirmed from primary sources).
- AA contrast of the muted greys and chart colours in both themes (the axe scan is the gate).
