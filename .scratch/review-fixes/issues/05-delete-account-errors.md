# 05: Handle network failures in account deletion

**What to build:** /auth/delete-account calls Supabase without try/catch, so a network failure surfaces as a generic 500.

**Blocked by:** None — fix in numeric order.

Status: ready-for-human

- [x] Session verification and admin deletion failures return the friendly 502 JSON error.
- [x] Behaviour matches the ride import endpoint's error handling.

## Comments

- 2026-10-02: Both Supabase calls now return the friendly 502 JSON on network failure, matching ride import. Session verification also reuses the normalized URL. Not covered by a test (a plain try/catch; simulating a Supabase network failure isn't worth a harness).
