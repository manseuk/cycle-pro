# Zwift discovery and display options

Research checked 2026-09-29. This report focuses on displaying selected Zwift routes, events, and rides in a separate cycling app, with links that send users to Zwift for details and participation.

## Findings

### First-party discovery surfaces

- Zwift directs users to browse and join events on its official [events page](https://www.zwift.com/events), in Zwift Companion, or in-game. Its FAQ says all events can be viewed there and explains event details such as route name, distance, elevation, description, and rules. This supports a manual “browse on Zwift” link in the app; it does **not** document a public event-data API or a supported event deep-link format. [Zwift race FAQ](https://www.zwift.com/eu/racing/racing/racing-faq)
- The public events page presents filters for sport, event type, intensity/category, and start time. The page is a useful user-facing destination, but the publicly documented material does not provide a data feed, API schema, export, or reuse license for reproducing those listings elsewhere. [Zwift Events](https://www.zwift.com/events)
- Zwift’s official support documents route information and event-only routes. This can support a curated in-app route catalog assembled from permitted/manual research and linked to official Zwift pages, but does not establish that the route tables are an API or grant permission to copy them wholesale. [Event-only routes support page](https://support.zwift.com/en_us/zwift-event-only-routes-for-running-rJP9u408T)
- Zwift says the Companion app supports reviewing activities and progress, browsing worlds/routes, and finding events. It remains the first-party destination for ride history and details. [Zwift Companion](https://www.zwift.com/r/companion)

### APIs and account integrations

- Zwift has a “Training API” used by selected partner platforms. Zwift staff described partners syncing scheduled workouts into Zwift and completed workout/activity data back out; the connection is initiated from the partner side and appears in Zwift account Connections. [Zwift staff on the Final Surge integration](https://forums.zwift.com/t/final-surge/70597/23) and [Zwift’s TriDot integration announcement](https://forums.zwift.com/t/tridot-integration-now-available-august-2024/632654)
- Zwift’s current support page lists supported third-party platforms by capability: some send scheduled workouts to Zwift, some receive completed Zwift activities, and others share selected data with Zwift. This documents partner-specific integrations, not an open self-serve API. [Zwift and Third-party Platforms](https://support.zwift.com/en_us/zwift-and-third-party-platforms-SypU0LdVr)
- Practical implication: the cycling-coach app should not make its MVP depend on importing a user’s Zwift activity history, querying routes/events, or sending workouts through Zwift. A future integration is possible only if Zwift onboards/authorizes the product; public documentation does not give API credentials, OAuth scopes, endpoints, or a guaranteed application process. The partner API is precedent, not evidence that this app can currently obtain access.

### Terms and access limits

- Zwift’s Terms prohibit scraping/data mining, automated collection, bots/scripts interacting with the Platform, reverse engineering, and developing/using apps that interact with Zwift without prior written authorization. They also reserve platform content and require written permission for uses beyond the granted personal, noncommercial license. [Zwift Terms of Service, Section 5 and Section 9](https://us.zwift.com/policies/terms-of-service)
- Therefore, do not have the backend poll or scrape Zwift’s event pages or undocumented endpoints, automate account login, read Companion/app internals, or collect Zwift passwords. Even read-only display is an interaction/reuse question; a commercial or public product should obtain written authorization before programmatically collecting or republishing Zwift event/route data. This recommendation is an inference from the terms above.
- A normal user-clicked link to Zwift’s official public event/calendar page is the low-dependency option. Keep the Zwift account connection and action on Zwift; do not imply the app can enroll a user in a race or book a route.

## MVP recommendation

1. Include **“Explore Zwift events”** as a link to [zwift.com/events](https://www.zwift.com/events), and **“Explore routes”** as a link to Zwift’s first-party route information. Avoid promising personalized live event listings or event-specific deep links until Zwift documents and authorizes a supported feed/link scheme.
2. Let users save a Zwift event or route as a manually entered training option (name, date/time, route, URL, and optional notes). This records the user’s choice without automating collection from Zwift.
3. Keep FIT upload as the app’s source of ride data. If the user needs an activity recorded in Zwift, direct them to Zwift; a future FIT export/import workflow should be treated separately from API access.
4. If Zwift integration is strategically important, make partner onboarding and written permission a discovery gate before committing integration work. If authorized, the documented direction of travel is a supported partner connection for scheduled workouts and/or completed activity sync, not an unofficial read-only event API.

## Evidence boundary

Zwift first-party sources document an official event calendar, route and event details in its own experiences, supported partner data connections, and strict limits on automated interaction. They do not document a public developer API for third-party route/event discovery or personal activity-history reads. The conclusion that public read-only aggregation is unavailable is bounded to the first-party public documentation reviewed here; private partner agreements or subsequently published developer documentation may offer capabilities not described publicly.
