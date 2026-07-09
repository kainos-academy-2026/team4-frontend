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

- Run Biome lint and formatting checks for TypeScript and JSON files:

```bash
npm run lint
```

- Apply Biome safe auto-fixes for lint and formatting issues where supported:

```bash
npm run lint:fix
```

Default local port is `3000`. Override with `PORT`, for example:

```bash
PORT=4000 npm run start
```

## Endpoints

- `GET /` renders a hello-world HTML page.
- `GET /login` renders the demo login page.
- `GET /health` returns JSON with:
	- `status`: `UP`
	- `time`: current timestamp in ISO-8601 format

## Demo Login

- Set `ENABLE_DEMO_AUTH=true` to enable the frontend-only demo login flow.
- Demo credentials:
	- Email: `test@test.com`
	- Password: `passwordtest`
- On successful login, a fake JWT-shaped token and the user email are stored in `sessionStorage`.
- This is a frontend-only demo flow and does not call a backend or validate real password hashes.

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
3. Click `Log in` and confirm `http://localhost:3000/login` renders the branded login form.
4. Submit invalid credentials and confirm the page stays on `/login` and shows an error.
5. Submit `test@test.com` and `passwordtest` with `ENABLE_DEMO_AUTH=true` and confirm the app redirects to `/`, shows `Welcome back, test@test.com`, and swaps `Log in` for `Log out`.
6. Click `Log out` and confirm the session is cleared and the home page returns to the logged-out state.
7. Request `http://localhost:3000/health` and confirm `status` + `time`.
8. Stop dev, run `npm run start`, and re-check `/`, `/login`, and `/health`.
9. Run `npm ci` and `npm run build` again to confirm reproducibility.
