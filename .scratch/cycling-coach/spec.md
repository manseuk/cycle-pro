Status: ready-for-human

# Cycling Coach MVP

## Problem Statement

Road cyclists need one place to review their completed rides, understand how their recent training load is changing, keep an event or general-fitness goal in view, and decide what to do today. Ride history is often split across files and services, while load indicators can be misleading without context about missing data, FTP, and recovery.

## Solution

Build a browser-based training companion for road cyclists. Cyclists create a private account, set one primary active goal, import completed rides from FIT files, review rides and planned items on a calendar, and see explained CTL, ATL, and TSB trends when the required data is available. The app can offer at most one explained workout suggestion per day; it is added to the calendar only when accepted. Cyclists can also save Zwift events, races, and routes manually and open the supplied Zwift link.

## User Stories

1. As a Cyclist, I want to create an account with my email and password, so that my training data is private to me.
2. As a Cyclist, I want to verify my email address, so that account access uses a confirmed address.
3. As a Cyclist, I want to sign in and sign out, so that I can access my training account safely.
4. As a Cyclist, I want to reset a forgotten password, so that I can recover access to my account.
5. As a Cyclist, I want my account to represent one private cyclist, so that my rides, goals, calendar, and training data are not shared with other users.
6. As a Cyclist, I want to delete my account after clear confirmation, so that my personal data and associated training records are removed.
7. As a Cyclist, I want to set an Event goal with a name and date, so that my training suggestions can orient toward a real event.
8. As a Cyclist, I want an Event goal to default to completing the event, so that I can set a meaningful goal without needing a finish-time target.
9. As a Cyclist, I want to add an optional target finish time to an Event goal, so that I can define a more measurable outcome.
10. As a Cyclist, I want to set a General-fitness goal using weekly ride frequency or riding time, so that I can guide training without a specific event.
11. As a Cyclist, I want to add an optional power target such as FTP to a General-fitness goal, so that my goal can include a measurable power outcome.
12. As a Cyclist, I want to start from editable goal templates or enter a custom goal, so that goal setup fits my needs.
13. As a Cyclist, I want to edit my Primary active goal, so that my training focus can change over time.
14. As a Cyclist, I want to import rides before setting a goal, so that I can start organizing history immediately.
15. As a Cyclist, I want to upload individual FIT files and have each processed independently, so that one problematic file does not prevent other rides from importing.
16. As a Cyclist, I want each usable FIT file to create a Ride even when some measurements are missing, so that partial activity data remains useful.
17. As a Cyclist, I want unavailable ride measurements clearly identified, so that I do not mistake missing values for zero values.
18. As a Cyclist, I want an unparseable FIT file rejected with an understandable reason, so that I know what prevented its import.
19. As a Cyclist, I want exact duplicate FIT files skipped and linked to the existing Ride, so that my history does not contain accidental duplicates.
20. As a Cyclist, I want likely duplicate activities flagged for review, so that I can decide whether separate records should remain.
21. As a Cyclist, I want Ride timestamps preserved and displayed in my selected calendar time zone, so that activities appear on the correct local date.
22. As a Cyclist, I want the source FIT file discarded after a successful import, so that the app stores only parsed ride data.
23. As a Cyclist, I want to add or edit notes on a Ride, so that I can remember relevant context.
24. As a Cyclist, I want recorded sensor measurements protected from manual editing, so that imported activity data remains faithful to its source.
25. As a Cyclist, I want to delete a Ride, so that I can remove an activity I no longer want in my history.
26. As a Cyclist, I want training data recalculated after Ride deletion, so that displayed trends reflect my remaining history.
27. As a Cyclist, I want a month calendar view, so that I can see my training and plans across the month.
28. As a Cyclist, I want a list calendar view suited to smaller screens, so that I can use the calendar on a phone.
29. As a Cyclist, I want completed Rides, accepted workout suggestions, and saved Zwift options shown together with clear distinctions, so that I can understand both past and planned activity.
30. As a Cyclist, I want to select a calendar date and see its items, so that I can review a day’s activity and plans.
31. As a Cyclist, I want to open an item’s details from the calendar, so that I can see useful information without confusing one item type with another.
32. As a Cyclist, I want to set or update my FTP and record its date, so that power-based training load uses a known threshold estimate.
33. As a Cyclist, I want power-based training load calculated only when ride power is usable and a dated FTP is available, so that load is not inferred from incomplete inputs.
34. As a Cyclist, I want CTL explained as a longer-term weighted training-load trend, so that I understand what it describes.
35. As a Cyclist, I want ATL explained as a shorter-term weighted training-load trend, so that I understand what it describes.
36. As a Cyclist, I want TSB explained as the previous day’s CTL minus ATL, so that I understand the displayed relationship.
37. As a Cyclist, I want load trends described as relative indicators rather than readiness or performance scores, so that I do not treat them as universal prescriptions.
38. As a Cyclist, I want missing history, power, or FTP called out, so that I understand why trends may be incomplete or unavailable.
39. As a Cyclist, I want an optional daily recovery check-in for perceived recovery and illness or injury, so that suggestions can account for how I feel.
40. As a Cyclist, I want intensity suggestions withheld when I report illness or injury, so that the app does not recommend hard training in that state.
41. As a Cyclist, I want at most one workout suggestion for the day, so that recommendations remain focused.
42. As a Cyclist, I want a workout suggestion to state its type, duration, intensity target, and a short explanation tied to my Primary active goal and recent load, so that I can decide whether it fits.
43. As a Cyclist, I want to accept a workout suggestion before it appears on my calendar, so that a recommendation does not become a plan without my choice.
44. As a Cyclist, I want to skip a workout suggestion, so that I can decline it without adding it to my calendar.
45. As a Cyclist, I want the app to explain when data is insufficient for a personalized intensity workout and abstain, so that it does not present unsupported advice.
46. As a Cyclist, I want personalized suggestions to wait until I have a Primary active goal, while keeping ride import available, so that goal setup is required only where it matters.
47. As a Cyclist without a dated FTP, I want an optional Zwift Ramp Test offered as an FTP setup assessment when appropriate, so that I have a way to establish an estimate.
48. As a Cyclist, I want to manually record the estimated FTP and test date after a Ramp Test, so that no Zwift account connection is required.
49. As a Cyclist, I want manual FTP entry available without Zwift, so that the app supports cyclists who use other assessment methods.
50. As a Cyclist, I want the Ramp Test assessment withheld when I report illness or injury, so that the recovery check-in also informs this setup suggestion.
51. As a Cyclist, I want to save a Zwift event or race with its name, date/time, route, URL, and optional notes, so that I can keep a relevant option with my training calendar.
52. As a Cyclist, I want to save a Zwift route with its name, date/time, route, URL, and optional notes, so that I can plan a route alongside other activity.
53. As a Cyclist, I want to associate a saved Zwift option with my Primary active goal, so that it stays connected to the outcome I am pursuing.
54. As a Cyclist, I want a saved Zwift option shown on its calendar date, so that I can see it alongside Rides and accepted workouts.
55. As a Cyclist, I want a saved option to open its supplied Zwift link, so that I can view details and participate on Zwift.
56. As a Cyclist, I want to manage my training data without connecting a Zwift account, so that the MVP does not require Zwift credentials or account synchronization.

## Implementation Decisions

- Build a browser frontend with React, TypeScript, and Vite; deploy static assets on Cloudflare Pages.
- Build the API with Hono and TypeScript on Cloudflare Workers.
- Use Supabase Postgres and Supabase Auth. Enforce per-Cyclist ownership with authenticated, user-scoped access and Row Level Security.
- Run the frontend and Worker locally against a persistent local Supabase stack. A Docker-compatible runtime is needed for local Supabase development only; local database records remain local.
- Deploy the frontend from `main`; deploy the Worker with Wrangler in CI. Version schema changes as migrations and apply them to the hosted Supabase project during deployment. Deploy code and schema, not local data.
- Each account represents one Cyclist. Store goals, Rides, calendar items, check-ins, FTP history, and derived training data with clear Cyclist ownership.
- Support one Primary active goal at a time. A goal is either an Event goal or a General-fitness goal with the required fields defined in this spec.
- Process FIT files independently. Preserve usable activity data, make absent measurements unavailable, skip exact duplicate files, and flag likely duplicate activities for review. Do not retain source FIT files after successful import.
- Preserve activity timestamps and store the Cyclist’s selected calendar time zone for display and date grouping.
- Allow note edits and Ride deletion, but do not allow edits to recorded sensor measurements. Recalculate derived training data following Ride deletion.
- Store only parsed Ride detail needed for the MVP; select the retained fields and duplicate fingerprinting rules during implementation with the Supabase free database quota in mind.
- Show CTL, ATL, and TSB as explained relative trends, not a composite readiness verdict. Use power-based training load only with usable power and a dated, user-managed FTP. Do not infer or silently update FTP; heart-rate-based load is out of scope.
- Offer an optional daily recovery check-in. Illness or injury suppresses intensity workouts and the Ramp Test setup suggestion.
- Offer no more than one workout suggestion per day. The suggestion includes type, duration, intensity target, and a short explanation based on goal and recent load; acceptance creates a calendar item and skipping does not.
- When inputs are insufficient, explain what is missing and abstain from personalized intensity suggestions. When FTP is missing, offer the optional Ramp Test setup assessment if recovery permits; let the Cyclist enter the resulting FTP and date manually.
- Let Cyclists manually save Zwift events/races and routes with name, date/time, route, URL, optional notes, and optional association with the Primary active goal. Do not scrape listings, connect accounts, or synchronize activities or workouts.
- Use the browser journey as the highest end-to-end test seam. Tests should observe user-visible outcomes across authentication, goal setup, import, calendar, trends, and suggestion acceptance/withholding, including isolation between two Cyclists.
- Add lower-level tests where needed to validate FIT parsing outcomes, duplicate classification, time-zone display, load calculations, and recommendation rules through their public inputs and outputs. Test representative valid, partial, invalid, duplicate, and likely duplicate activity cases.
- The codebase currently has no application modules or tests. There is no prior test suite to mirror; establish the test tooling and browser-level journey as part of implementation.
- Validate FIT parser CPU use against the Cloudflare Workers Free 10 ms CPU limit and size retained parsed data against Supabase Free’s 500 MB database quota. These are POC constraints that require measurements with representative rides.

## Testing Decisions

- Prefer tests of externally observable behavior: what a Cyclist sees, can change, or is prevented from accessing. Avoid coupling tests to component structure, database internals, or private helper functions.
- Use one browser-level end-to-end journey as the primary seam. Cover sign-up/verification and sign-in as feasible in the local auth environment; setting a goal; importing rides; calendar display; load explanations; accepting or skipping a suggestion; and manual Zwift option management.
- Include two-account scenarios proving one Cyclist cannot read or modify another Cyclist’s records, including through direct API/database-facing application behavior.
- Exercise FIT import outcomes for usable complete and partial files, unparseable files, exact duplicates, and likely duplicates. Verify per-file outcomes, retained ride details, local-time display, source-file disposal after success, and note/delete behavior.
- Verify load trends are unavailable or qualified when required power, FTP, or history is missing; when available, confirm CTL/ATL/TSB explanations and behavior after Ride deletion.
- Verify recommendation behavior for missing goal, insufficient inputs, illness/injury, missing FTP setup, accepted suggestion, skipped suggestion, and the one-suggestion-per-day limit.
- Verify responsive calendar behavior at month and small-screen list views, with distinct item types and accessible date/item details.
- Test Cloudflare Worker FIT parsing with representative files to measure CPU use against the Free tier request limit; measure retained Ride data size against the database quota.
- No existing automated test modules or test conventions exist in this repository. The test runner and browser automation should be selected when establishing the application scaffold.

## Out of Scope

- Generating or adapting a multi-week training plan.
- Syncing workouts, rides, or other data with a Zwift account.
- Scraping or automatically collecting Zwift events, routes, or ride listings.
- Supporting cycling disciplines beyond road cycling in the MVP.
- Heart-rate-based training-load calculations.
- Editing imported sensor measurements.
- User-initiated data export.
- Retaining original FIT files after successful import or requiring persistent file storage.
- Sharing data with coaches or other Cyclists.

## Further Notes

- Product decisions and supporting research are recorded in the adjacent MVP specification, decision tickets, and research reports. This spec consolidates those decisions as the implementation contract.
- Do not invent universal CTL, ATL, TSB, or readiness thresholds. Training-load initialization, minimum history, workout catalog, duplicate heuristics, and retained FIT fields remain explicit implementation details that need validation.
- Cloudflare Free is a plausible POC host, but FIT parsing must be measured against the Worker CPU limit. Supabase Free project inactivity and database quota also need to be considered during operation.

## Comments

- 2026-10-02: All user stories are delivered by tickets 12–19 (plus the review fixes in `.scratch/review-fixes/`). The remaining POC measurements are recorded in `docs/adr/0001-client-parsed-fit-import.md`. A real 1 MB, 3.5 h ride parses in 60–96 ms, which is over the Workers Free 10 ms CPU limit, so FIT parsing stays in the browser. A stored Ride costs about 520 bytes including indexes, roughly 1 million Rides in Supabase Free's 500 MB. Import outcomes (complete, partial, invalid, exact and likely duplicates) and the narrow-screen list calendar are covered by the e2e suite. Duplicate classification, time-zone dating, load calculations, and recommendation rules are covered by unit tests.
