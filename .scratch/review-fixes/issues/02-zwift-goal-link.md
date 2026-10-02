# 02: Stop Zwift options staying linked to a replaced goal

**What to build:** training_goals is upserted per Cyclist so its id never changes; a saved Zwift option stays "Linked to Primary active goal" even after the Cyclist turns the goal into a different event. Make the association reflect the goal it was saved against.

**Blocked by:** None — fix in numeric order.

Status: ready-for-human

- [x] Replacing the Primary active goal with a different goal no longer shows older Zwift options as linked to it.
- [x] Options linked to the current goal still show as linked.
- [x] Behaviour on goal edit vs replace is decided and recorded in the ticket comments.

## Comments

- 2026-10-02: Decision (user): snapshot the goal name. Saving a linked option stores `goal_name`; it shows as linked only while the current goal has the same id and name. Otherwise it shows "Saved for an earlier goal: <name>". Editing the goal's name therefore counts as a new goal; other edits (date, finish time) keep the link. The migration backfills existing links from the current goal name. The check is `goal_id is null or goal_name is not null`, so the `on delete set null` foreign key and account deletion still work (verified). Extended the Zwift e2e journey.
