# 07: Validate calendar time zone server-side and guard the UI

**What to build:** cyclists.calendar_timezone is only validated in the browser; an invalid stored value crashes training-load and the calendar Today button.

**Blocked by:** None — fix in numeric order.

Status: ready-for-human

- [x] The database rejects invalid IANA time zone names.
- [x] UI paths that format dates with the saved time zone fall back gracefully instead of throwing.

## Comments

- 2026-10-02: A trigger on `cyclists` rejects zones missing from `pg_timezone_names` (a CHECK can't query catalogs). `calendarDateKey`, which every date-dependent view calls, falls back to UTC for an unknown zone. Covered by a unit test and an e2e rejected-PATCH assertion.
