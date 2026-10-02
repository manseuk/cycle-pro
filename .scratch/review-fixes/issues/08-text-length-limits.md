# 08: Add database length limits to free-text columns

**What to build:** Suggestion text, Zwift name/route/notes, and ride notes are only length-limited by forms.

**Blocked by:** None — fix in numeric order.

Status: ready-for-human

- [x] Each free-text column has a database check matching (or slightly above) the form limit.
- [x] Existing e2e flows still pass.

## Comments

- 2026-10-02: Added `char_length` checks matching the forms: goal name 120, ride name 120, ride notes 4000, Zwift name/route 120, URL 2048, notes 1000, goal snapshot 120. Generated suggestion text is capped at 200/500/2000. The Zwift link input now has `maxLength={2048}`. An e2e test asserts a 1001-character Zwift note is rejected.
