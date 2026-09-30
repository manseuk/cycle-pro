Type: grilling
Status: resolved

## Question

What account and privacy behavior must the MVP guarantee for multiple users? Define account identity and recovery expectations, whether a user can export or delete their account data, and the boundaries around private FIT files and derived training data. The user has already decided each signed-in user sees only their own rides, calendar, goal, and suggestions.

## Answer

- Sign in with email and password through Supabase Auth. Verify email addresses and provide password reset.
- One account represents one cyclist with private rides, goals, calendar, and training data. Data is not shared with other users or coaches in the MVP.
- Account deletion requires clear confirmation and permanently removes the account, rides, goals, and derived training data.
- User-initiated data export is deferred beyond the MVP. Original FIT files are not retained after successful import.

See [GLOSSARY.md](../../../GLOSSARY.md) for the agreed meaning of Cyclist.
