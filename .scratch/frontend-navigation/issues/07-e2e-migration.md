Type: grilling
Status: resolved

## Question

How do the Playwright tests in `tests/e2e` migrate to the new pages and URLs? Some selectors depend on classes that will change (`.goal-card`, `.calendar-ride-detail`); most use roles and labels. Decide: which selectors move to roles/labels/test ids (see the `playwright-conventions` skill), whether specs split per page, how sign-in and deep-link navigation are handled in helpers, and which new checks are needed (direct hit on `/calendar`, signed-out deep link, ride-not-found, theme persistence, phone-width menu).

## Answer

- **Spec organisation:** split the single 604-line `tests/e2e/private-cyclist-accounts.spec.ts` (12 tests) into per-page specs: auth, goals, rides, calendar, training load and recovery, suggestion, Zwift, plus a new shell/navigation spec. The register, verify-email and sign-in steps currently repeated in most tests move into one shared helper returning a signed-in page. Specs navigate straight to the page under test. Behaviour assertions are unchanged; only navigation steps and selectors change.
- **Selectors:** the three `.goal-card` lookups become table rows found by role and name (`getByRole('row', { name })`). The `.calendar-ride-detail` check becomes "clicking the ride lands on `/rides/:id` and its heading is visible". Roles and names are preferred per `playwright-conventions`; add a test id only where no sensible role exists.
- **New checks:** signed-in direct hit on `/calendar`; signed-out hit on `/rides` shows sign-in at the same URL then the page after sign-in; unknown ride id shows "Ride not found"; unknown URL shows "Page not found"; Today next-step prompts for a new user and their disappearance once done; theme follows the emulated system colour scheme, an explicit toggle persists across reload, Account's Appearance restores "System"; sign out reachable from the menu; time zone setting present on Account; phone-width menu opens, navigates and closes.
- **Config:** add one phone-viewport Playwright project that runs only the shell/navigation spec; behaviour specs stay at desktop width.
