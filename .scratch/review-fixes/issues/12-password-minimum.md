# 12: Align server password minimum with the form

**What to build:** supabase/config.toml allows 6-character passwords while the form requires 8.

**Blocked by:** None — fix in numeric order.

Status: ready-for-human

- [x] Local Supabase config enforces 8 characters.
- [x] README notes that the production Supabase project must match.

## Comments

- 2026-10-02: `supabase/config.toml` now sets `minimum_password_length = 8` (local stack restarted to apply). README tells deployers to set the same in the production project; that dashboard setting can't be versioned here.
