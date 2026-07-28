# syntax=docker/dockerfile:1.7

# ---- Dependencies stage ----
# Installs full dependencies once (including devDependencies) for build use.
FROM node:22-alpine AS deps

WORKDIR /usr/src/app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# ---- Production dependencies stage ----
# Derive runtime deps from already-installed modules for faster cold builds.
FROM deps AS prod-deps

RUN npm prune --omit=dev && npm cache clean --force

# ---- Runtime dependency selection stage ----
# Materializes either dev+prod deps or prod-only deps for final image copy.
FROM node:22-alpine AS runtime-deps

WORKDIR /usr/src/app

ARG INCLUDE_DEV_DEPS=false

RUN --mount=from=deps,source=/usr/src/app/node_modules,target=/mnt/deps,ro \
  --mount=from=prod-deps,source=/usr/src/app/node_modules,target=/mnt/prod-deps,ro \
  mkdir -p /out/node_modules && \
  if [ "$INCLUDE_DEV_DEPS" = "true" ]; then \
    cp -a /mnt/deps/. /out/node_modules/; \
  else \
    cp -a /mnt/prod-deps/. /out/node_modules/; \
  fi

# ---- Build stage ----
# Uses full dependencies to compile TypeScript and assemble static assets.
FROM node:22-alpine AS build

WORKDIR /usr/src/app

# Install rsync, used by the build script to copy views/public into dist/
RUN apk add --no-cache rsync

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
COPY public ./public
RUN npm run build

# ---- Production stage ----
# The final runtime image copies in only what's needed to run the app:
# runtime dependencies and the compiled dist/ output.
FROM node:22-alpine AS production

WORKDIR /usr/src/app

ARG INCLUDE_DEV_DEPS=false

ENV NODE_ENV=production

COPY package*.json ./

COPY --from=runtime-deps --chown=node:node /out/node_modules ./node_modules

COPY --from=build --chown=node:node /usr/src/app/dist ./dist

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "dist/index.js"]
