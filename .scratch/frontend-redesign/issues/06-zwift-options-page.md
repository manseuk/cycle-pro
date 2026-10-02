# 06: Zwift options page

Status: ready-for-agent

## Parent

[Frontend navigation and redesign spec](../../frontend-navigation/spec.md)

## What to build

Saved Zwift events, races and routes, and the add form, move to `/zwift` with behaviour unchanged (including the goal association and links). Zwift options is added to the navigation, styled in variant B. Zwift tests move to their own spec.

## Acceptance criteria

- [ ] `/zwift` lists saved options and the add and delete flows work as today.
- [ ] Saving or deleting an option updates the provider so the calendar reflects it.
- [ ] Zwift options is in the navigation.
- [ ] Zwift tests live in their own spec and pass; the axe scan passes.

## Blocked by

01-shell-router-shared-data.md, 02-test-foundation.md
