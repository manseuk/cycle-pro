Type: grilling
Status: resolved

## Question

What should happen when a user uploads FIT files in the MVP? Decide the user-visible flow and rules for invalid or unsupported files, duplicate activities, partial imports, time zones, and corrections or deletion. Keep the decision focused on product behavior and required data, not implementation details.

## Answer

- Import each file independently. Keep a ride when its basic activity data is usable, even if some measurements are absent; mark dependent training metrics unavailable. Reject files that cannot be parsed into a meaningful ride and explain why.
- Skip exact duplicate files and show the existing ride. Flag likely duplicates for review rather than silently merging them.
- Preserve the ride timestamp and display it in the user's chosen calendar time zone.
- Let users edit notes, but do not hand-edit recorded sensor measurements. Deleting a ride triggers recalculation of derived training metrics.
- For the online POC, discard the original FIT file after a successful import and keep the parsed ride data in the database. The source file is not retained with the Ride.

See [GLOSSARY.md](../../../GLOSSARY.md) for the distinction between a Ride and its source FIT file.
