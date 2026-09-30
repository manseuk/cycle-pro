Type: grilling
Status: resolved

## Question

Given the decisions about goals, FIT imports, readiness, and Zwift options, what should the MVP calendar and core user journey contain? Specify how completed rides and planned/suggested workouts appear together, the key interactions, and testable MVP acceptance criteria for the end-to-end journey.

## Comments

- The user approved a month view as the starting calendar, showing rides, accepted workout suggestions, and saved Zwift options on their dates. Selecting a date opens details; provide a list view for smaller screens.
- The user approved asking for one primary goal before providing personalized workout suggestions. Cyclists may still use the app and import rides without a goal; personalized suggestions wait until a goal exists.
- The user approved showing completed rides, accepted workout suggestions, and manually saved Zwift options together in the calendar, with clear visual distinctions and item details.

## End-to-end journey baseline

1. A cyclist creates an account, verifies their email, and signs in.
2. The cyclist sets up a primary goal and optional FTP/recovery details. If FTP is missing, offer the agreed Zwift Ramp Test setup path; no Zwift account connection is required.
3. The cyclist uploads FIT files. Each file receives an import result; usable rides appear on the calendar, duplicates are identified, and unusable files include a reason.
4. The cyclist reviews the calendar, ride details, and CTL/ATL/TSB trends. The app explains missing data and only suggests a personalized workout when its inputs are sufficient and the recovery check-in does not report illness or injury.
5. The cyclist may accept the workout suggestion to add it to the calendar, or skip it. They may also save a Zwift event/race or route manually, associate it with the active goal, and open its Zwift link.

## Acceptance criteria

- Account data is private to the signed-in cyclist.
- A cyclist can create an account, verify their email, sign in, create one primary goal, and edit that goal. Ride import remains available if they have not yet created a goal; personalized workout suggestions do not.
- A usable FIT import appears on its recorded date in the selected calendar time zone, with missing measurements clearly unavailable; unusable files and duplicates have understandable outcomes.
- The calendar has a month view and a list view for smaller screens. It shows rides, accepted workout suggestions, and saved Zwift options together with clear visual distinctions; selecting a date opens its items, and selecting an item opens its details.
- CTL/ATL/TSB are presented as relative training-load trends, not a readiness verdict. Power-based load requires usable power and a dated FTP.
- Workout suggestions explain their relationship to the goal and recent load. The cyclist must accept before a suggestion is added to the calendar; they can skip it.
- Illness/injury suppresses intensity suggestions, including the Ramp Test setup assessment.
- A manually saved Zwift event/route shows the cyclist's entered details and a link that opens Zwift.
