# 09: Today composition

Status: ready-for-agent

## Parent

[Frontend navigation and redesign spec](../../frontend-navigation/spec.md)

## What to build

Today becomes the focused landing page: the workout suggestion with the recovery check-in beside it, the headline CTL/ATL/TSB/FTP numbers, a goal summary and the latest rides. For a new user, next-step prompts link to Goals (set a goal), Rides (import a first ride) and Training load (add FTP); each disappears once done. Saving a check-in still recalculates the suggestion; accepting a workout still updates the calendar. Styled in variant B (big numbers, ruled rows). Suggestion and recovery tests move to their own specs.

## Acceptance criteria

- [ ] Today shows the suggestion and recovery check-in together, with unchanged calculation and accept/skip behaviour.
- [ ] Headline numbers, goal summary and latest rides show; each links to its page.
- [ ] A brand-new user sees the three prompts, and each disappears once its step is done.
- [ ] Suggestion and recovery tests live in their own specs and pass; the axe scan passes.

## Blocked by

04-rides-and-ride-detail.md, 05-goals-page.md, 07-training-load-page.md
