# 06: Enforce the import body size limit on actual bytes

**What to build:** The 64 KB limit only checks the declared content-length header; a request without one bypasses it.

**Blocked by:** None — fix in numeric order.

Status: ready-for-human

- [x] The API rejects bodies over 64 KB based on bytes read, regardless of headers.
- [x] Normal imports are unaffected.

## Comments

- 2026-10-02: `readLimitedText` streams the request body and stops past 64 KB regardless of headers. The declared content-length is still used as a fast reject. An e2e test sends a 70 KB streamed body with no content-length and expects 413.
