# 05: Goals page

Status: ready-for-agent

## Parent

[Frontend navigation and redesign spec](../../frontend-navigation/spec.md)

## What to build

The primary active goal can be viewed and edited at `/goals`: the goal card, the templates, the event and general-fitness forms and save, moved from the old single page with behaviour unchanged. Goals is added to the navigation, styled in variant B. Goals tests move to their own spec.

## Acceptance criteria

- [ ] `/goals` shows the primary goal or the "no goal yet" state with the existing wording.
- [ ] Creating from a template, editing and saving a goal work as before and update the provider so other pages see the change.
- [ ] Goals is in the navigation.
- [ ] Goals tests live in their own spec and pass; the axe scan passes.

## Blocked by

01-shell-router-shared-data.md, 02-test-foundation.md
