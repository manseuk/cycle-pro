Type: grilling
Status: resolved

## Question

`App.tsx` currently owns the session, goal, rides, planned workouts, Zwift options and time zone in one component, and the sections read them directly. Once these become separate URL-routed pages, where does that data live (a shared provider loaded once after sign-in, per-page fetching, or a mix), how do pages refresh each other (e.g. saving a recovery check-in updates the suggestion; accepting a workout updates the calendar), and how is `App.tsx` split up?

## Answer

- **Shared data:** one signed-in provider (React context), loaded once after sign-in, holding session, goal, rides, calendar time zone, planned workouts and saved Zwift options, with the existing refresh callbacks. No data-fetching library. Section-local data (daily suggestion, recovery check-in, FTP rows) stays inside the sections; form drafts, messages and busy flags stay in the page that uses them.
- **`App.tsx` split:** a small shell handles the auth check, the provider, the router and the menu, and renders either the signed-out or signed-in layout. One component per page owns its forms and save/delete logic and writes results back to the provider (e.g. `setGoal`, `refreshRides`). `TrainingCalendar`, `DailySuggestionSection`, `TrainingLoadSection` and `SavedZwiftOptionsSection` stay mostly as they are; Training load is divided between the Today and Training load pages per the page-contents decision.
- **Behaviour unchanged:** saving a recovery check-in still recalculates the suggestion; accepting a workout still updates the calendar; saving or deleting a Zwift option still refreshes the saved list. Changing FTP does not regenerate today's suggestion, same as now.
- **Signed-out deep links:** the URL stays as it is and the auth layout renders in place of the page; the real page appears once signed in. No redirect code.
- **Proposed by the agent, confirmed in summary:** `/rides/:id` waits for the provider's first load, then shows "Ride not found" with a link to Rides if missing; an unknown URL shows "Page not found" inside the signed-in layout.
