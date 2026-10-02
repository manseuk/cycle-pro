# Router choice and Cloudflare SPA hosting

Question: `issues/02-router-and-hosting.md`. Fetched 2026-10-02.

## Repo facts (local files)

- `apps/web/package.json`: react/react-dom 19.3.0, vite 8.3.1, wrangler 4.145.0.
- `apps/web/wrangler.toml` is only `name`, `compatibility_date = "2026-09-30"`, `pages_build_output_dir = "./dist"`. So it is a **Pages** project. There is no `[assets]` block and no `_redirects`.
- No `404.html` and no `public/` dir in `apps/web`.
- `vite.config.ts` has only the react plugin plus a dev `/api` proxy to 127.0.0.1:8787. The dev server already falls back to index.html for unknown paths.

## Hosting facts

- Pages: "If your project does not include a top-level `404.html` file, Pages assumes that you are deploying a single-page application." It "matches all incoming paths to the root (`/`)". Source: https://developers.cloudflare.com/pages/configuration/serving-pages/
- Workers static assets (the alternative): needs explicit `"assets": { "directory": "./dist/", "not_found_handling": "single-page-application" }` (wrangler.jsonc form). It serves `/index.html` for navigation requests (`Sec-Fetch-Mode: navigate`) with no matching asset. With compatibility date 2025-04-01 or later these requests skip the Worker. Source: https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/

## Router facts (npm registry manifests, fetched via https://registry.npmjs.org/<pkg>/latest)

| | react-router 8.4.0 | @tanstack/react-router 1.170.41 | wouter 3.13.0 |
|---|---|---|---|
| React peer | react >=19.2.7 | >=18 or >=19 | >=16.8 |
| Runtime deps | cookie-es, @remix-run/route-pattern | isbot, history, react-store, router-core | regexparam, use-sync-external-store |
| Unpacked size | not reported | about 992 KB (unpacked, not gzipped) | about 80 KB (unpacked) |
| Other | node >=22.22 | node >=20.19 | description: "~1.5KB router" |

Sources: https://registry.npmjs.org/react-router/latest, https://registry.npmjs.org/@tanstack/react-router/latest, https://registry.npmjs.org/wouter/latest

- React Router has three modes: declarative, data and framework. The docs page summary says automatic code splitting is only in framework mode, which uses a Vite plugin and can output SPA. Source: https://reactrouter.com/start/modes. I did not verify the per-route `lazy` API in data mode, so check that before relying on it.
- TanStack Router: its Vite plugin has `autoCodeSplitting: true`. Code-based routing uses `.lazy()` and `createLazyRoute`. Source: https://tanstack.com/router/latest/docs/framework/react/guide/code-splitting
- wouter: no code-splitting API was found in the manifest. Interpretation: it would rely on plain `React.lazy` and `Suspense`.
- Not verified: gzipped bundle sizes. No primary source was fetched for these. Only the "~1.5KB" description (wouter) and unpacked sizes are cited above.

## Interpretation

- The app has a few top-level views (e.g. `/calendar`, `/rides`) with no loaders or SSR need. That favours the smallest router. wouter fits, and `React.lazy` per view gives code splitting.
- React Router is the most mature and best known. Declarative mode is enough for this, but it brings a heavier dependency graph and a React >=19.2.7 and Node >=22.22 floor. The repo already pins react 19.3.0 and Node 22.18, so the Node floor is a possible mismatch to check. Framework mode would change the build setup and is overkill.
- TanStack Router adds type-safe routes and auto-splitting, but it is the largest dependency and a lot of machinery for a few views.
- Hosting needs no change if it stays on Pages. Deep links already work because there is no `404.html`. Do not add a `404.html`. If it moves to Workers assets, add the `not_found_handling` setting above.

## Recommendation

Use **wouter** with `React.lazy` per view. Fall back to React Router declarative mode if typed routes or loaders become needed. Keep Pages and add no fallback config. Add a Playwright check that a direct hit on `/calendar` returns the app. As a safeguard, optionally add `public/_redirects` with `/* /index.html 200`. I did not confirm this from a primary source, so verify it before adding.
