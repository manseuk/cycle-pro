# 15: Document that imported ride data is client-parsed

**What to build:** The browser parses FIT files and the API trusts the resulting metrics and hash; immutability applies only after import.

**Blocked by:** None — fix in numeric order.

Status: ready-for-human

- [x] The trust boundary is recorded (ADR or architecture note), including that forged data can only affect the Cyclist's own account.
- [x] Server-side FIT parsing is noted as the upgrade path if trust matters later.

## Comments

- 2026-10-02: Recorded as `docs/adr/0001-client-parsed-fit-import.md`, covering the trust boundary, why it was chosen, and moving parsing into the Worker as the upgrade path.
