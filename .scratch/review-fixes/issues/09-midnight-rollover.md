# 09: Refresh today's suggestion after local midnight

**What to build:** The daily suggestion keeps the date it was loaded with if the tab stays open past midnight.

**Blocked by:** None — fix in numeric order.

Status: ready-for-human

- [x] After the Cyclist's local date changes, the suggestion, check-in, and calendar 'today' update without a manual reload (e.g. on focus or a timer).

## Comments

- 2026-10-02: Added `useToday(timeZone)`, which rechecks every minute and on focus/visibility, used by the suggestion and training-load sections; the suggestion, check-in, and FTP date default follow it. The calendar Today button already computed the date fresh on click. The e2e test uses Playwright's clock starting just before the previous UTC midnight, so token refreshes can't cause the re-render; it fails without the hook.
