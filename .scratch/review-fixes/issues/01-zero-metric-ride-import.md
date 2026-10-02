# 01: Import rides with zero distance or duration

**What to build:** Indoor or very short rides import instead of failing with a misleading 502. A FIT value of 0 for distance or duration becomes null (missing), and out-of-range metrics get a clear 400.

**Blocked by:** None — fix in numeric order.

Status: ready-for-human

- [x] A FIT ride with total distance 0 (indoor, no speed sensor) imports with distance shown as unavailable.
- [x] A ride whose duration rounds to 0 imports with duration unavailable, or is rejected with a clear message if it has no other usable data.
- [x] The API rejects metric values the database cannot store (e.g. power above smallint range) with a 400 and a specific message, not a 502.
- [x] An e2e or logic check covers the zero-distance case.

## Comments

- 2026-10-02: Fixed in the API, which every import routes through: per-column limits mirror the rides table; 0 distance/duration/elapsed are stored as null; non-integer or out-of-range values return a 400 naming the field; a ride left with no duration, distance, power, or heart rate returns a 400. Covered by an API-level e2e test.
