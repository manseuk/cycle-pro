# Cycling Coach MVP Specification

## Purpose

Build a browser-based training companion for road cyclists. A cyclist can import completed rides from FIT files, review them on a calendar, track relative training-load trends, set a goal, and receive at most one explained workout suggestion for the day. The MVP is a free-tier proof of concept with a local development workflow and a production deployment from `main`.

## Users and access

- Each account represents one private cyclist.
- Sign up and sign in with email and password. Verify email addresses and provide password reset.
- A cyclist can only access their own rides, goals, calendar, and training data.
- Provide confirmed account deletion that removes the account and associated rides, goals, and derived data.
- Data export is outside the MVP.

## Goals

Support one primary active goal per cyclist:

- **Event goal:** name and date are required. Completing the event is the default outcome; target finish time is optional.
- **General-fitness goal:** weekly ride-frequency or riding-time target is required; an FTP or other power target is optional.
- Cyclists can start from editable templates or enter a custom goal, and can edit their active goal.
- A primary goal is needed for personalized workout suggestions. Cyclists may still import rides before setting a goal.

## Ride import

- Accept individual FIT file uploads and process each file independently.
- Keep a ride when its basic activity data is usable. Preserve available measurements and show missing measurements as unavailable.
- Reject unparseable files with a user-understandable reason.
- Skip exact duplicate files and point to the existing ride. Flag likely duplicate activities for user review rather than silently merging them.
- Preserve the activity timestamp. Display it in the cyclist's selected calendar time zone.
- After successful import, discard the source FIT file and persist parsed ride data only.
- Allow note edits and ride deletion. Do not allow editing recorded sensor measurements. Recalculate derived training data after deletion.

## Calendar and core journey

The primary calendar has a month view and a list view suited to smaller screens. Show completed rides, accepted workout suggestions, and manually saved Zwift options together on their dates, with clear visual distinctions. Selecting a date shows its items; selecting an item opens its details.

Core journey:

1. Create an account, verify the email address, and sign in.
2. Create or edit a primary goal. Optionally set FTP and complete a recovery check-in.
3. Upload one or more FIT files and review each file's import outcome.
4. Review rides, calendar details, CTL/ATL/TSB trends, and any available workout suggestion.
5. Accept a workout suggestion to add it to the calendar, or skip it.
6. Optionally save a Zwift event/race or route and associate it with the active goal.

## Fitness, recovery, and suggestions

- Show CTL, ATL, and TSB as relative training-load trends with plain-language definitions. Do not combine them into a single readiness score or prescribe universal target values.
- Calculate power-based training load only when ride power is usable and a current, dated, user-managed FTP is available. Do not infer or silently update FTP from ride power. Heart-rate-based load is out of scope.
- Make clear when history, power, or FTP is missing and how this limits the displayed metrics. Do not present incomplete trends as a readiness verdict.
- Offer an optional daily check-in for perceived recovery and illness/injury. If illness or injury is reported, withhold intensity suggestions.
- Make at most one workout suggestion for the day. State workout type, duration, intensity target, and a short explanation tied to the active goal and recent load. Do not add it to the calendar until accepted; allow the cyclist to skip it.
- If data is insufficient for a personalized intensity workout, explain what is missing and abstain. If FTP is missing, offer an optional Zwift Ramp Test as an FTP setup assessment, subject to the illness/injury check. The cyclist manually enters the estimated FTP and test date. Manual FTP entry remains available without Zwift.

## Zwift options

- Let a cyclist manually save a Zwift event/race or route with a name, date/time, route, URL, and optional notes; associate it with the active goal.
- Show saved options on their calendar dates and open the supplied Zwift link for details and participation.
- Do not scrape or automatically collect Zwift listings, connect a Zwift account, or sync workouts/activities in the MVP. Tighter integration can be explored later.

## Architecture and delivery

- **Frontend:** React + TypeScript + Vite, deployed as static assets on Cloudflare Pages.
- **API:** Hono + TypeScript on Cloudflare Workers.
- **Database and identity:** Supabase Postgres and Supabase Auth, with user-scoped access and Row Level Security.
- **Local development:** run frontend and Worker locally against a persistent local Supabase stack. A Docker-compatible runtime is needed for the local Supabase stack only.
- **Release:** deploy the frontend from `main`; deploy the Worker with Wrangler in CI; version database changes as migrations and apply them during deployment. Local records stay local; deploy code and schema, not local data.
- **POC limits:** validate FIT parsing within the Cloudflare Workers Free CPU limit and size retained parsed ride data for the Supabase Free database quota. Raw FIT files are discarded, so persistent file storage is not required.

## MVP acceptance criteria

- Two cyclists can use separate accounts; each is prevented from viewing or modifying the other's records.
- A cyclist can set an event or general-fitness goal, edit it, and import rides without a goal. Personalized suggestions remain unavailable until a goal is set.
- Valid FIT files produce rides in the selected time zone; partial data remains usable with missing fields marked unavailable. Invalid files explain failure, exact duplicates are skipped, and likely duplicates are flagged for review.
- The calendar presents rides, accepted workouts, and saved Zwift options together in month and small-screen list views, with clear distinctions and accessible item details.
- CTL/ATL/TSB are explained as relative load trends. Power-based load depends on usable power and a dated FTP; missing inputs are communicated.
- The app offers no more than one personalized workout suggestion for the day, explains its goal/load context, and only adds it to the calendar after acceptance. The user can skip it.
- An illness/injury response suppresses intensity suggestions, including the Ramp Test setup assessment.
- A cyclist can save a Zwift event/route manually and open its supplied link. No Zwift account credentials or automated listing collection are required.
- A cyclist can edit ride notes, delete a ride and trigger derived-data recalculation, reset their password, and delete their account with confirmation.

## Implementation details to settle while building

These choices are intentionally left to implementation design, while the product behavior above is fixed:

- FIT parser/library selection, Worker CPU measurements, and the exact parsed fields retained.
- Duplicate-file fingerprint and probable-duplicate matching rules.
- Training-stress calculation details, daily series initialization, and insufficient-history thresholds. Keep these explicit and documented; do not invent readiness cutoffs.
- Workout suggestion rules and exact workout catalog. Keep recommendations bounded by available goal/load/recovery inputs and abstain when inputs are inadequate.
- Supabase schema, migrations, timezone preference storage, and derived-data recalculation strategy.
