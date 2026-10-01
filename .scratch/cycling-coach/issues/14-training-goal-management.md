# 14: Training goal management

**What to build:** A signed-in Cyclist can create and edit one Primary active goal using an Event goal or General-fitness goal, and can continue using the app without a goal where one is not required.

**Blocked by:** 13: Private Cyclist accounts.

**Status:** ready-for-human

- [x] A Cyclist can create an Event goal with a name and date; completing the event is the default outcome and target finish time is optional.
- [x] A Cyclist can create a General-fitness goal with a weekly ride-frequency or riding-time target and an optional power target such as FTP.
- [x] A Cyclist can start from editable templates or enter a custom goal.
- [x] A Cyclist can edit the Primary active goal and has no more than one active primary goal at a time.
- [x] Goal data is private to its owning Cyclist.
- [ ] A Cyclist can use ride-import functionality before setting a goal; personalized workout suggestions remain unavailable until a goal exists.

## Comments

- Goal editing is implemented and covered by the browser journey. The final acceptance item remains pending until ride import (ticket 15) and personalized suggestions (ticket 18) are available to verify together.
