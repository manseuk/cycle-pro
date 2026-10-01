# 18: Daily workout suggestion

**What to build:** When goal, training, and recovery inputs permit, a Cyclist can review at most one explained workout suggestion for the day, accept it into the calendar or skip it, and understand when the app abstains.

**Blocked by:** 14: Training goal management; 17: FTP, recovery, and training-load trends.

**Status:** ready-for-human

- [x] At most one workout suggestion is offered to a Cyclist for a given day.
- [x] A suggestion states workout type, duration, intensity target, and a short explanation tied to the Primary active goal and recent load.
- [x] The suggestion is not added to the calendar unless the Cyclist accepts it.
- [x] The Cyclist can skip a suggestion without adding it to the calendar.
- [x] No personalized workout suggestion is offered without a Primary active goal.
- [x] Insufficient inputs produce an explanation of what is missing and no unsupported personalized intensity workout.
- [x] Illness or injury suppresses intensity suggestions, including the FTP setup assessment.
- [x] When FTP is missing and recovery permits, the app can offer the optional Zwift Ramp Test as an FTP setup assessment.
- [x] The Cyclist can manually record estimated FTP and test date after an assessment; manual FTP entry remains available without Zwift.
- [x] Accepted workout suggestions appear as clearly distinguished planned items on the calendar.

## Comments

- 2026-10-01: Suggestions are generated at most once per Cyclist and calendar-local date, enforced by a database unique key. Today's suggestion is persisted so skip/accept survives reload. Accept changes it into a planned calendar item; skip never creates one. A Primary active goal and a scored Ride with active dated FTP are required for a personalized workout; without FTP, a Ramp Test assessment is offered only if the check-in does not report illness/injury or low recovery. The workout explanation includes current CTL/ATL/TSB as context; no universal load cutoff changes its intensity. Manual FTP entry remains in the existing FTP history form.
