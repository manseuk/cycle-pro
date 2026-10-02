# 19: Saved Zwift options

**What to build:** A Cyclist can manually save a Zwift event, race, or route, associate it with the Primary active goal, and review it on the calendar with a link to Zwift.

**Blocked by:** 14: Training goal management; 16: Ride calendar and time-zone display.

**Status:** ready-for-human

- [x] A Cyclist can save a Zwift event or race with name, date/time, route, URL, and optional notes.
- [x] A Cyclist can save a Zwift route with name, date/time, route, URL, and optional notes.
- [x] A saved option can be associated with the Primary active goal.
- [x] Saved options appear on the appropriate calendar date and are visually distinct from completed Rides and accepted workouts.
- [x] Opening a saved option follows its supplied Zwift link.
- [x] Zwift listings are not scraped or automatically collected, and the app does not require Zwift credentials or account synchronization.
- [x] Saved options are private to the owning Cyclist.

## Comments

- 2026-10-02: Added owner-only `saved_zwift_options` (RLS; goal association checked against the owner's own goal) with a manual form for event/race/route (name, date, optional time, route, URL, notes, optional Primary-goal link). Saved options show on the calendar (month badge, list, selected date, detail) in a distinct blue style labelled "NOT COMPLETED", and open the supplied link in a new tab. Date/time are stored as calendar-local values, not converted by time zone. URLs must be http(s). No scraping or Zwift credentials. Also scoped a flaky password-reset assertion that collided with the suggestion loading status.
