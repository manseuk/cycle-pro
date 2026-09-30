# 17: FTP, recovery, and training-load trends

**What to build:** A Cyclist can record a dated FTP estimate and optional daily recovery check-in, then review CTL, ATL, and TSB trends with plain-language limits and explanations.

**Blocked by:** 15: FIT import and Ride management.

**Status:** ready-for-agent

- [ ] A Cyclist can add or update FTP with the date it was set.
- [ ] Power-based training load is calculated only when Ride power is usable and a dated, user-managed FTP is available; FTP is never inferred or silently updated.
- [ ] Heart-rate-based training load is not calculated.
- [ ] CTL, ATL, and TSB are displayed with plain-language explanations as relative trends, not a composite readiness or performance score.
- [ ] Missing history, power, or FTP is clearly explained, and incomplete trends are not presented as a readiness verdict.
- [ ] An optional daily check-in records perceived recovery and illness or injury.
- [ ] Illness or injury status is available to the suggestion flow to suppress intensity recommendations.
- [ ] Removing a Ride updates the displayed derived training trends.
- [ ] FTP, check-ins, and training trends are private to the owning Cyclist.
