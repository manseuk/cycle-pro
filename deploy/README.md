# Local Kubernetes + Argo CD deployment

Runs the web app (nginx, proxies `/api` to the API) and the API (Worker under `wrangler dev`) in a local kind cluster, managed by Argo CD. Supabase stays on the host (`pnpm supabase:start`); pods reach it at `host.docker.internal:54321`, the browser at `127.0.0.1:54321`.

Run from the repo root. Cluster context: `kind-argo-local`.

```sh
# 1. Supabase on the host
pnpm install && pnpm supabase:start

# 2. Build images (the web image bakes in the public Supabase URL and anon key)
eval "$(pnpm exec supabase status -o env --override-name api.url=SUPABASE_URL --override-name anon_key=SUPABASE_ANON_KEY --override-name service_role_key=SUPABASE_SERVICE_ROLE_KEY)"
docker build -f deploy/docker/api.Dockerfile -t cycle-pro-api:local .
docker build -f deploy/docker/web.Dockerfile -t cycle-pro-web:local \
  --build-arg VITE_SUPABASE_URL=http://127.0.0.1:54321 \
  --build-arg VITE_SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY" .

# 3. Load them into the kind cluster (no registry)
kind load docker-image cycle-pro-api:local cycle-pro-web:local --name argo-local

# 4. Create the namespace and the API secret (never committed)
kubectl create namespace cycle-pro --dry-run=client -o yaml | kubectl apply -f -
kubectl -n cycle-pro create secret generic cycle-pro-api-env \
  --from-literal=.dev.vars="FRONTEND_ORIGIN=http://localhost:8080
SUPABASE_URL=http://host.docker.internal:54321
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY"

# 5. Register the app with Argo CD (needs the branch pushed to GitHub)
kubectl apply -f deploy/argocd/application.yaml
kubectl -n argocd get application cycle-pro -w

# 6. Open it
kubectl -n cycle-pro port-forward svc/web 8080:80   # http://localhost:8080
```

Argo CD UI: `kubectl -n argocd port-forward svc/argocd-server 8443:443`, then <https://localhost:8443> (user `admin`, password from `kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d`).

## Updating

Manifest changes: push to the tracked branch; Argo syncs. Code changes: rebuild, `kind load`, then `kubectl -n cycle-pro rollout restart deploy/web deploy/api` (the `:local` tag doesn't change, so Argo can't see it).
