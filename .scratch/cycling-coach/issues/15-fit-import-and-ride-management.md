# 15: FIT import and Ride management

**What to build:** A Cyclist can import completed rides from FIT files, understand per-file outcomes, review parsed Ride details, edit notes, and delete Rides. Partial usable activity data is retained and duplicate activities are handled explicitly.

**Blocked by:** 13: Private Cyclist accounts.

**Status:** ready-for-agent

- [ ] A Cyclist can upload one or more FIT files, and each file receives an independent import result.
- [ ] A usable file creates a Ride while preserving available measurements and identifying missing measurements as unavailable.
- [ ] An unparseable file is rejected with a user-understandable reason.
- [ ] An exact duplicate file is skipped and points to the existing Ride.
- [ ] A likely duplicate activity is flagged for user review and is not silently merged.
- [ ] The Ride timestamp is preserved, and the Cyclist's selected calendar time zone is saved for display and date grouping.
- [ ] After successful import, the original FIT file is discarded; parsed ride data remains available to the Cyclist.
- [ ] A Cyclist can edit Ride notes but cannot edit recorded sensor measurements.
- [ ] A Cyclist can delete a Ride, and derived training data is recalculated after deletion.
- [ ] A Cyclist can only import and manage their own Rides.
- [ ] Representative FIT parsing is measured against the Cloudflare Worker Free CPU limit, and retained parsed data is measured against the Supabase Free database quota.
