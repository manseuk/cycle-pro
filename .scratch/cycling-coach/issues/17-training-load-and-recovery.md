# 17: FTP, recovery, and training-load trends

**What to build:** A Cyclist can record a dated FTP estimate and optional daily recovery check-in, then review CTL, ATL, and TSB trends with plain-language limits and explanations.

**Blocked by:** 15: FIT import and Ride management.

**Status:** ready-for-human

- [x] A Cyclist can add or update FTP with the date it was set.
- [x] Power-based training load is calculated only when Ride power is usable and a dated, user-managed FTP is available; FTP is never inferred or silently updated.
- [x] Heart-rate-based training load is not calculated.
- [x] CTL, ATL, and TSB are displayed with plain-language explanations as relative trends, not a composite readiness or performance score.
- [x] Missing history, power, or FTP is clearly explained, and incomplete trends are not presented as a readiness verdict.
- [x] An optional daily check-in records perceived recovery and illness or injury.
- [x] Illness or injury status is available to the suggestion flow to suppress intensity recommendations.
- [x] Removing a Ride updates the displayed derived training trends.
- [x] FTP, check-ins, and training trends are private to the owning Cyclist.

## Comments

- 2026-10-01: FTP estimates are dated history; a Ride uses only the latest FTP set on or before its local ride date. Load is an explicitly qualified estimate from moving hours × (average power / FTP)² × 100. CTL and ATL are 42- and 7-day exponential trends; TSB is yesterday’s CTL minus ATL. This uses average power and is not a standardized TSS score. Trends are calculated from current Ride and FTP rows, so deleting a Ride recalculates them immediately without stored derived rows. Daily recovery state is saved per local date and is available for the suggestion flow; illness or injury suppresses intensity suggestions.
