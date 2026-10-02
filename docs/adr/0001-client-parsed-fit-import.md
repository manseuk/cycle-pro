# FIT files are parsed in the browser and the API trusts the parsed Ride

The browser parses each FIT file and sends the Ride summary and the file's SHA-256 to `/rides/import`; the Worker validates shape and ranges, checks for duplicates, and inserts with the service role. FIT files are never uploaded, which keeps the Worker small (no FIT parser in the bundle, no file storage) and matches the POC rule that FIT files are discarded after import. The trade-off is that a Cyclist can submit fabricated metrics or a fabricated hash; this only affects their own account, because the Worker binds every insert to the authenticated Cyclist. Sensor measurements are immutable only after import (Cyclists can edit notes but not metrics). If imported data ever needs to be trusted beyond its owner (shared leaderboards, coaching, sharing with another Cyclist), move FIT parsing into the Worker and compute the hash there.

## Measurements (2026-10-02)

Measured with a representative real ride (1.05 MB FIT, 3 h 32 min moving, 98 km, power/HR/cadence), not committed because it contains location data:

- **Parsing:** `parseCyclingRide` took 60–96 ms per run in Node 26 (5 runs). That is 6–10× the Cloudflare Workers Free 10 ms CPU limit, so parsing in the Worker is not viable on the Free plan; browser parsing avoids it. The import request body is about 380 bytes.
- **Storage:** 10,000 such Rides added 5.2 MB to `rides` including indexes, about 520 bytes per Ride with empty notes (notes add up to 4 KB each). Supabase Free's 500 MB holds roughly 1 million Rides, or about 270 Cyclists riding daily for 10 years, before counting other tables and Supabase's own overhead.
