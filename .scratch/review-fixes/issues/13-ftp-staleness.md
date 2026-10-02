# 13: Treat old FTP values as needing reassessment

**What to build:** Any past FTP counts as current, so a years-old FTP still unlocks power targets.

**Blocked by:** None — fix in numeric order.

Status: ready-for-human

- [x] A staleness window is decided (e.g. 8–12 weeks) and recorded.
- [x] When the latest FTP is older than the window, the Ramp Test assessment is offered again (recovery permitting) and the explanation says why.
- [x] Manual FTP entry still clears the condition.

## Comments

- 2026-10-02: Decision (user): 12 weeks (84 days, `FTP_STALE_AFTER_DAYS`). `ftpStatus()` returns missing/stale/current from the latest FTP on or before today. A stale FTP re-offers the optional Ramp Test, with an explanation that the FTP is over 12 weeks old (recovery permitting, as before). Saving a new FTP makes it current. Rides are still scored with the FTP in effect on their date. Unit tests cover the boundary and the explanation.
