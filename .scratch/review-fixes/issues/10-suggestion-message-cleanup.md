# 10: Remove duplicated save-error handling in DailySuggestionSection

**What to build:** The 'could not be saved' abstention is set twice in a row in the generation effect.

**Blocked by:** None — fix in numeric order.

Status: ready-for-human

- [x] Save and read errors are each handled once with unchanged user-visible behaviour.

## Comments

- 2026-10-02: Removed the redundant second `setAbstention` for `saveError`; the combined save/read check already handles it.
