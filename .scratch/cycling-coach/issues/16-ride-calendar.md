# 16: Ride calendar and time-zone display

**What to build:** A Cyclist can browse imported Rides on a month calendar or small-screen list, see them grouped by local calendar date, and open each Ride's details.

**Blocked by:** 15: FIT import and Ride management.

**Status:** ready-for-human

- [x] The calendar has a month view and a list view suited to smaller screens.
- [x] Imported Rides appear on the correct date in the Cyclist's selected calendar time zone.
- [x] Selecting a date shows its Ride items, and selecting a Ride opens its details.
- [x] Ride items are clearly distinguished as completed activity.
- [x] Calendar access and Ride details are restricted to the owning Cyclist.
- [x] Deleting a Ride removes it from calendar views.

## Comments

- 2026-10-01: Added an owner-only Training calendar with month and date-grouped list views. Ride dates are grouped in the saved calendar time zone; selecting a date shows its completed Rides, and selecting a Ride opens its details. The responsive list view is the default on narrow screens. Calendar data uses the existing owner-scoped Ride query, and Ride deletion immediately removes it from calendar state.
