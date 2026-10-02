Type: research
Status: resolved

## Question

Which client-side router suits a React 19 + Vite app on Cloudflare Pages (React Router vs lighter options; bundle size, code splitting, maturity), and how should Pages serve it with a single-page-app fallback so deep links like `/calendar` work? Use primary sources; record findings in `research/router-and-hosting.md`.

## Answer

Use wouter with `React.lazy` per page; fall back to React Router declarative mode if typed routes or loaders are ever needed. Hosting is already a Cloudflare Pages project with no `404.html`, so deep links work without config; do not add a `404.html`. A move to Workers assets would need `not_found_handling = "single-page-application"`. Add a Playwright check that a direct hit on `/calendar` loads the app. Unverified: gzipped bundle sizes, the optional `_redirects` safeguard, and React Router data-mode lazy loading. React Router 8.4.0 needs Node >=22.22 (repo pins 22.18). See the [research report](../research/router-and-hosting.md).
