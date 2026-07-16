# syntax = docker/dockerfile:1

ARG VP_VERSION=0.2.4
ARG BUN_VERSION=1.3.14

FROM ghcr.io/voidzero-dev/vite-plus:${VP_VERSION} AS build
WORKDIR /app
COPY --chown=vp:vp bun.lock bunfig.toml package.json ./
RUN vp install --frozen-lockfile

COPY --chown=vp:vp . .
RUN vp run build:ssr

FROM ghcr.io/voidzero-dev/vite-plus:${VP_VERSION} AS deps
WORKDIR /app
COPY --chown=vp:vp bun.lock bunfig.toml package.json ./
RUN vp install --frozen-lockfile --prod

FROM oven/bun:${BUN_VERSION}-slim AS runtime
WORKDIR /app
ENV NODE_ENV="production"
COPY --from=build /app/dist ./dist
COPY --from=build /app/server-prod.ts ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

EXPOSE 8080
CMD ["bun", "run", "start"]
