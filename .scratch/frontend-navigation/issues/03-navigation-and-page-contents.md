Type: grilling
Status: resolved


Direction chosen: variant B (see Visual direction decision).

## Question

Given the chosen visual direction: what is the mobile navigation pattern (e.g. bottom tab bar vs menu) and desktop pattern, what content lives on each of the seven pages, and does Training load stay a separate page or merge into Today or Rides?

## Answer

**Navigation:** variant B. Phones: MENU button opens a full-screen numbered menu. Desktop: top tabs. Sign out is always reachable (menu on phones, right end of the top bar on desktop); delete account stays on the Account page only. Auth screens keep their own layout with no menu.

**Pages (each a real URL; Today is the landing page):**
- **Today**: workout suggestion, recovery check-in, headline CTL/ATL/TSB/FTP numbers, goal summary, latest rides. For a new user, next-step prompts link to the right page: set a goal (Goals), import a first ride (Rides), add FTP (Training load); each disappears once done.
- **Calendar**: month and list views; ride entries link to the ride's own page.
- **Rides**: FIT import, import results, compact table of rides; each row opens the ride page.
- **Ride detail** (`/rides/:id`): all metrics, notes, delete. Intended to be extended with new features later (out of scope here).
- **Training load**: CTL/ATL trend chart and FTP history with FTP entry (split from Today).
- **Goals**: view and edit the primary active goal.
- **Zwift options**: saved options and the add form.
- **Account**: email, sign out, delete account, and the calendar time zone setting (moved from Rides). Rides and Calendar show a small "times shown in <zone>" note linking here.
