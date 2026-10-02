Type: grilling
Status: resolved

## Question

What do the shell and pages show while the signed-in provider's first load is in progress, and when a load or save fails? Today each section has its own `role="status"` "Loading…" text and `role="alert"`/message patterns. Decide one pattern for the shell (first load after sign-in, session check) and for pages (a section failing to load while the rest works, retry), how it is announced to assistive technology (consistent with the accessibility decision), and what is kept as is.

## Answer

- **Failure scope:** shared data (goal, rides, time zone, planned workouts, Zwift options) fails independently and never blocks the shell. A page that needs failed data shows an inline error with a **Retry** button where that content would go; pages that don't need it work normally. (Today there is no retry; users refresh.)
- **Announcements:** loading and success messages use `role="status"` (polite). Failure messages, including failed saves and the Retry prompts, use `role="alert"`. Today almost everything is `role="status"`, including failures; the only existing `role="alert"` is "Account access is not configured".
- **Proposed by the agent, confirmed in summary:** the shell shows "Loading your account…" only while the session is checked, then the layout appears immediately with each page showing its own inline loading text (existing wording, e.g. "Loading rides…"; no spinners or skeletons). `/rides/:id` shows its loading text while rides load, then the ride or "Ride not found".
