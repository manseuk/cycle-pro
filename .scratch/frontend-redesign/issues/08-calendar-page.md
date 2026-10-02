# 08: Calendar page

Status: ready-for-agent

## Parent

[Frontend navigation and redesign spec](../../frontend-navigation/spec.md)

## What to build

The training calendar (month and list views, rides, accepted workouts and saved Zwift options with their distinctions) moves to `/calendar`. Selecting a ride entry opens that ride's own page instead of the inline ride panel. The day cells keep their button-per-day structure with descriptive labels and `aria-pressed`. Calendar is added to the navigation, styled in variant B (hard-edged cells). The `.calendar-ride-detail` check becomes "clicking the ride lands on `/rides/:id` and its heading is visible".

## Acceptance criteria

- [ ] `/calendar` shows month and list views with the same items and distinctions as today.
- [ ] Clicking a ride entry navigates to `/rides/:id`.
- [ ] Planned workouts and Zwift options still open their existing inline detail.
- [ ] Calendar is in the navigation.
- [ ] Calendar tests live in their own spec and pass; the axe scan passes.

## Blocked by

02-test-foundation.md, 04-rides-and-ride-detail.md
