FROM node:22.18.0-slim
RUN npm install -g pnpm@12.4.2
WORKDIR /repo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile --filter @cycle-pro/api...
COPY apps/api apps/api
WORKDIR /repo/apps/api
ENV WRANGLER_SEND_METRICS=false
# ponytail: runs the Worker under local workerd (wrangler dev); no Node port of the API needed.
CMD ["pnpm", "exec", "wrangler", "dev", "--ip", "0.0.0.0", "--port", "8787"]
