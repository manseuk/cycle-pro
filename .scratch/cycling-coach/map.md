## Destination

A build-ready MVP spec for a browser-based, multi-user cycling training app, covering product scope, domain/data model, training guidance, integrations, and a recommended technical architecture. This map plans the spec; it does not implement the application.

The consolidated specification is [MVP-SPEC.md](MVP-SPEC.md). All planned product decision tickets are resolved; the remaining open bullets below are implementation design and validation work.

## Notes

- User decisions so far: road cycling first; editable goals with an event/date and measurable target, plus general-fitness goals; a fitness/readiness summary and today's workout suggestion; calendar includes completed rides and planned workouts; show selected Zwift training options with links, without account sync in the MVP; compare and recommend a simple stack for a browser frontend and TypeScript backend. Docker is optional; target an online free POC.
- Users log in and see their own FIT uploads, calendar, goals, and training suggestions.
- Selected Supabase Postgres and Supabase Auth for the POC; see the Technical architecture decision.
- Consult `docs/agents/issue-tracker.md` and `docs/agents/domain.md`. Use grilling and domain-modeling when resolving product decisions; use primary sources for research.
- Road cycling is the initial discipline. Multi-week adaptive plans and Zwift account sync are outside this MVP destination.

## Decisions so far

- [FIT import behavior](issues/05-fit-import.md): import per file, preserve rides with usable basics and mark missing metrics unavailable; skip exact duplicates, flag likely ones, use the user's calendar time zone, discard source FIT after successful import, and allow note edits or deletion with recalculation.
- [Cloudflare hosting research](issues/11-cloudflare-hosting.md): a Free Worker can pair with Supabase Postgres for a POC, but the 10 ms CPU/request limit needs FIT-parser validation and Supabase's database quota/inactivity pause must be considered.
- [Technical architecture](issues/09-technical-architecture.md): use React/Vite on Pages, Hono on Workers, Supabase Auth/Postgres with per-user RLS, persistent local Supabase development, and `main`-branch deployment of code and migrations; local data stays local.
- [Account and data](issues/06-account-and-data.md): one private cyclist per account, email/password with verification and reset, confirmed deletion removes all personal data, and export is deferred beyond the MVP.
- [Goal model](issues/04-goal-model.md): the MVP has event and general-fitness goals, editable templates/custom entry, and one primary active goal.
- [Training readiness](issues/07-training-readiness.md): show explained CTL/ATL/TSB trends without a composite readiness score; calculate power load only with usable power and a dated user-managed FTP; use an optional recovery check-in; offer a Zwift Ramp Test as an optional FTP setup assessment with manual result entry; make at most one explained workout suggestion and add it to the calendar only when accepted.
- [Zwift discovery](issues/08-zwift-discovery.md): cyclists manually save Zwift events/races and routes with details and a link, associate them with the active goal, and open Zwift for participation; tighter integration can be explored later.
- [Calendar and MVP journey](issues/10-calendar-and-mvp-spec.md): month and mobile list views show rides, accepted workouts, and saved Zwift options together with clear distinctions; a primary goal is needed for personalized suggestions, but not to import rides.
- [WKO-Q model research](issues/01-wko-q-model.md): WKO-Q offers relative load indicators, not a standalone readiness prescription; data quality and initialization matter.
- [Zwift options research](issues/02-zwift-options.md): use user-saved options and official Zwift links in the MVP; public docs do not describe an open event/activity API, and terms restrict scraping.
- [TypeScript stack research](issues/03-typescript-stack.md): the initial comparison favored React + Vite and Hono; the selected Workers/Supabase deployment is recorded in [Technical architecture](issues/09-technical-architecture.md).

## Implementation work to plan

- Technical FIT parsing, duplicate fingerprinting, time-zone conversion, the subset of parsed ride data to retain within free database limits, and derived-metric recalculation details.
- The exact domain vocabulary and relationships among goals, rides, workouts, fitness, and readiness.
- How selected Zwift routes, races, and rides can be sourced and displayed reliably.
- FIT-parser feasibility within Worker CPU limits and the right amount of parsed ride detail to retain within the Supabase free database quota.

## Out of scope

- Generating or adapting a multi-week training plan.
- Syncing workouts or other data into a user's Zwift account.
- Supporting cycling disciplines beyond road in the MVP.
- User-initiated data export.
