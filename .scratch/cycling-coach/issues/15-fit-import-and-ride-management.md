# 15: FIT import and Ride management

**What to build:** A Cyclist can import completed rides from FIT files, understand per-file outcomes, review parsed Ride details, edit notes, and delete Rides. Partial usable activity data is retained and duplicate activities are handled explicitly.

**Blocked by:** 13: Private Cyclist accounts.

**Status:** ready-for-human

- [x] A Cyclist can upload one or more FIT files, and each file receives an independent import result.
- [x] A usable file creates a Ride while preserving available measurements and identifying missing measurements as unavailable.
- [x] An unparseable file is rejected with a user-understandable reason.
- [x] An exact duplicate file is skipped and points to the existing Ride.
- [x] A likely duplicate activity is flagged for user review and is not silently merged.
- [x] The Ride timestamp is preserved, and the Cyclist's selected calendar time zone is saved for display and date grouping.
- [x] After successful import, the original FIT file is discarded; parsed ride data remains available to the Cyclist.
- [x] A Cyclist can edit Ride notes but cannot edit recorded sensor measurements.
- [ ] A Cyclist can delete a Ride, and derived training data is recalculated after deletion.
- [x] A Cyclist can only import and manage their own Rides.
- [x] Representative FIT parsing is measured against the Cloudflare Worker Free CPU limit, and retained parsed data is measured against the Supabase Free database quota.

## Comments

- 2026-10-01: Implemented the import and Ride management flow. The provided 1.08 MB sample (12,702 records) took 98.91 ms to parse locally, roughly ten times the Workers Free 10 ms CPU limit. This is a local parser wall-time comparison, not a Cloudflare production CPU trace; FIT decoding therefore runs in the browser and the Worker receives only compact parsed data and its SHA-256 hash. The Worker uses the authenticated session to select the Cyclist and a server-only service role to create the Ride. Authenticated clients can update notes and delete their own Rides, but cannot insert Rides or change sensor fields.
- 2026-10-01: Measured `pg_column_size` on 6 local Ride rows: 187-byte average, 200-byte maximum. This is tuple size, excluding indexes and general database overhead. Supabase Free projects have a 500 MB database-size quota.
- 2026-10-01: Ride deletion is implemented, but derived training data does not exist yet. Recalculation remains pending the training-load/suggestion tickets that introduce derived data.
