# syntax=docker/dockerfile:1

# ---- Dependencies stage ----
# Installs all dependencies once (including devDependencies like typescript,
# vitest, biome) so the build stage can compile/type-check/test the app.
# Isolating installs into their own stage means Docker can cache this layer
# independently of source-code changes - it only re-runs when package*.json
# changes, not every time application code changes.
FROM node:22-alpine AS deps

WORKDIR /usr/src/app

COPY package*.json ./
# Cache mount persists npm's download cache across builds even when the
# lockfile changes, speeding up dependency installs.
RUN --mount=type=cache,target=/root/.npm npm ci

# ---- Build stage ----
# Uses the full (dev + prod) dependencies from the deps stage to compile
# TypeScript and assemble static assets. These build-time tools (typescript,
# rsync) are never needed at runtime, so this stage is discarded afterwards.
FROM node:22-alpine AS build

WORKDIR /usr/src/app

# Install rsync, used by the build script to copy views/public into dist/
RUN apk add --no-cache rsync

# Reuse already-installed node_modules instead of re-running npm ci
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- Production dependencies stage ----
# A fresh install with only runtime dependencies (--omit=dev), so packages
# such as typescript/vitest/playwright never end up in the final image.
FROM node:22-alpine AS prod-deps

WORKDIR /usr/src/app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

# ---- Production stage ----
# The final runtime image copies in only what's needed to run the app:
# production node_modules and the compiled dist/ output. Source files,
# devDependencies, and build tools (rsync, typescript, npm cache) are left
# behind in the earlier stages and never make it into this image.
FROM node:22-alpine AS production

WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY --from=prod-deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

# Run as the non-root "node" user (built into the base image) instead of root
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "dist/index.js"]
