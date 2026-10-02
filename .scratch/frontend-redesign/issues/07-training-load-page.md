# 07: Training load page

Status: ready-for-agent

## Parent

[Frontend navigation and redesign spec](../../frontend-navigation/spec.md)

## What to build

The CTL/ATL trend chart, the warnings about missing power or FTP, and the FTP history with FTP entry move to `/training-load`. The recovery check-in stays with the suggestion (it moves to Today in the Today slice; until then it remains where it is). Training load is added to the navigation, styled in variant B. Training load tests move to their own spec.

## Acceptance criteria

- [ ] `/training-load` shows the trend chart, FTP history and FTP entry with unchanged behaviour.
- [ ] Deleting a ride still updates the trend, as the existing test expects.
- [ ] Training load is in the navigation.
- [ ] Training load tests live in their own spec and pass; the axe scan passes.

## Blocked by

01-shell-router-shared-data.md, 02-test-foundation.md
