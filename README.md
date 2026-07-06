# team4-frontend

Minimal TypeScript Node frontend scaffold using Express + Nunjucks.

## Requirements

- Node 22 (see `.nvmrc`)

## Install

```bash
npm ci
```

## Run Scripts

- Build to `dist`:

```bash
npm run build
```

- Start dev mode with hot reload:

```bash
npm run dev
```

- Start compiled app from `dist`:

```bash
npm run start
```

Default local port is `3000`. Override with `PORT`, for example:

```bash
PORT=4000 npm run start
```

## Endpoints

- `GET /` renders a hello-world HTML page.
- `GET /health` returns JSON with:
	- `status`: `UP`
	- `time`: current timestamp in ISO-8601 format

Example health response:

```json
{
	"status": "UP",
	"time": "2026-07-06T10:30:00.000Z"
}
```

## Acceptance Criteria Checks

1. Run `npm run build` and confirm `dist` is created.
2. Run `npm run dev` and open `http://localhost:3000/`.
3. Request `http://localhost:3000/health` and confirm `status` + `time`.
4. Stop dev, run `npm run start`, and re-check `/` and `/health`.
5. Run `npm ci` and `npm run build` again to confirm reproducibility.

THIS IS MY NEW CHANGE!!!!!


ANOTHER BIG COMMIT
