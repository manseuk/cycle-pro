Type: grilling
Status: resolved

## Question

What accessibility requirements does the spec set for the new shell and pages? Cover: the full-screen phone menu (focus management, Escape to close, scroll lock, `aria-expanded`), skip link, current-page indication (`aria-current`), focus handling on route change, keyboard use of the calendar, the theme toggle's accessible name and state, and how the WCAG AA contrast requirement is verified in both themes (tooling, and whether it runs in CI).

## Answer

- **Phone menu:** a native `<dialog>` opened with `showModal()` (focus trap, Escape to close and inert background from the browser). The MENU button carries `aria-expanded`; focus returns to it on close. Choosing a page closes the menu and moves focus to the new page's heading.
- **Page changes:** focus moves to the page's `h1` on every route change; the document title updates (e.g. "Rides — Cycle Pro"); a "Skip to main content" link is the first focusable item; header, a labelled `nav` and `main` are real landmarks; the active menu/tab item carries `aria-current="page"`.
- **Verification:** `@axe-core/playwright` as a dev dependency. The shell/navigation spec scans every page in light and dark and fails on serious or critical violations (includes colour contrast), so it runs wherever the E2E suite runs. A manual keyboard and screen-reader pass stays on the pre-sign-off list.
- **Proposed by the agent, confirmed in summary:** the calendar keeps its existing button-per-day cells with descriptive labels and `aria-pressed` (the prototype's `role="grid"` is not carried over); the theme toggle is a button whose accessible name states the action ("Switch to dark theme") and updates with state, and Account's Appearance is a labelled radio group; any animation respects `prefers-reduced-motion`.
