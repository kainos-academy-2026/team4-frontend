# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci

FROM deps AS prod-deps

RUN npm prune --omit=dev && npm cache clean --force

FROM node:22-alpine AS build

WORKDIR /app

# rsync is required by the build script that copies views and public assets.
RUN apk add --no-cache rsync

COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig.json ./
COPY src ./src
COPY public ./public
RUN npm run build

FROM node:22-alpine AS runtime

WORKDIR /app

ARG INCLUDE_DEV_DEPS=false

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package*.json ./
RUN --mount=from=deps,source=/app/node_modules,target=/mnt/deps,ro \
	--mount=from=prod-deps,source=/app/node_modules,target=/mnt/prod-deps,ro \
	if [ "$INCLUDE_DEV_DEPS" = "true" ]; then \
		cp -a /mnt/deps/. ./node_modules/; \
	else \
		cp -a /mnt/prod-deps/. ./node_modules/; \
	fi

COPY --from=build /app/dist ./dist

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

CMD ["node", "dist/index.js"]
