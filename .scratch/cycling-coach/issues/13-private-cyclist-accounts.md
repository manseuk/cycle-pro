# 13: Private Cyclist accounts

**What to build:** A Cyclist can register, verify an email address, sign in, recover access, and permanently delete their account. Each account's records remain private from other Cyclists.

**Blocked by:** 12: Application foundation and local workflow.

**Status:** ready-for-agent

- [ ] A Cyclist can register and sign in with email and password using Supabase Auth.
- [ ] Email verification and password reset work through the configured auth flow.
- [ ] Two Cyclists can use separate accounts without reading or modifying one another's records through the application.
- [ ] Row Level Security and authenticated access enforce Cyclist ownership for application data.
- [ ] A Cyclist can delete their account only after clear confirmation; associated personal records are removed.
- [ ] Signed-out users cannot access authenticated Cyclist pages or data.
