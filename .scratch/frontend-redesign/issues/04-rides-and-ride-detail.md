# 04: Rides and ride detail pages

Status: ready-for-agent

## Parent

[Frontend navigation and redesign spec](../../frontend-navigation/spec.md)

## What to build

Rides get their own pages. `/rides` has FIT import, import results and a compact table of rides; each row opens `/rides/:id`, which shows all metrics, notes editing and delete, and "Ride not found" (with a link to Rides) when the id doesn't exist, after waiting for the provider's first load. The calendar time zone form moves from Rides to Account, and Rides and Calendar show a small "times shown in <zone>" note linking to it. Styled in variant B (ruled rows, big tabular numerals). The "View Ride" link in import results opens the ride page. Rides and time zone tests move to their own spec(s) using the shared helper; the `.goal-card` lookups become table rows found by role and name.

## Acceptance criteria

- [ ] `/rides` imports FIT files with the same results and duplicate handling as today and shows rides in a table.
- [ ] Each row and the "View Ride" link open `/rides/:id` with metrics, notes edit and delete working as today.
- [ ] An unknown ride id shows "Ride not found" with a link to Rides.
- [ ] The time zone form is on Account; Rides and Calendar show a note linking to it.
- [ ] Rides is added to the navigation.
- [ ] Rides tests live in their own spec, use roles and names, and pass; the axe scan passes.

## Blocked by

01-shell-router-shared-data.md, 02-test-foundation.md
