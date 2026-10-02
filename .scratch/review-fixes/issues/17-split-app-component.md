# 17: Extract the calendar from App.tsx

**What to build:** App.tsx is ~650 lines; the calendar item button markup is repeated four times, the account-available condition five times, and dateLabel exists in two files.

**Blocked by:** None — fix in numeric order.

Status: ready-for-human

- [x] The calendar lives in its own component with one shared item renderer.
- [x] The repeated account-available condition is computed once.
- [x] dateLabel is shared.
- [x] No user-visible behaviour changes; e2e passes.

## Comments

- 2026-10-02: Calendar moved to `TrainingCalendar.tsx` with one `CalendarItem` renderer and a single `openItem` state replacing three ids. It remounts via `key={savedTimezone}` so a time zone change resets to that zone's today, as before. A deleted Ride's detail closes because it's derived from `rides`. `dateLabel`/`displayTimestamp` now live in `calendar-date.ts`. `showTraining` is computed once. App.tsx went from ~650 to 512 lines with the same DOM. React Compiler lint rules stay off; revisit in a dedicated effects refactor.
