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

- Run tests from the repository root:

```bash
npm run test
```

- Run tests with coverage output:

```bash
npm run test:coverage
```

- Run tests with the Vitest UI:

```bash
npm run test:ui
```

Default local port is `3000`. Override with `PORT`, for example:

```bash
PORT=4000 npm run start
```

Frontend API connection values can be set in `.env`:

```ini
PORT=3000
API_BASE_URL=http://localhost:4000
USE_JOB_ROLE_FALLBACK_MOCK=true
```

## Endpoints

- `GET /` renders a hello-world HTML page.
- `GET /login` renders the login page.
- `POST /login` submits credentials to backend `POST /auth/login`.
- `POST /logout` clears the frontend auth cookie.
- `GET /health` returns JSON with:
	- `status`: `UP`
	- `time`: current timestamp in ISO-8601 format
- `GET /job-roles` renders open job roles.
  - Calls backend `GET /job-roles` using Axios.
  - Falls back to frontend mock data when backend is unavailable and `USE_JOB_ROLE_FALLBACK_MOCK=true`.

## Login Integration

- Login form sends `email` and `password` to backend `/auth/login`.
- Backend is expected to return JSON: `{ "accessToken": "..." }`.
- Frontend stores `accessToken` in an HttpOnly cookie named `access_token`.
- Home page reads that cookie and displays a greeting when a token is present.
- Logout clears the cookie and redirects back to home.

Example health response:

```json
{
	"status": "UP",
	"time": "2026-07-06T10:30:00.000Z"
}
```

## Acceptance Criteria Checks

1. Run `npm run build` and confirm `dist` is created.
2. Run backend branch `login-system-2` and ensure `/auth/login` is available.
3. Run frontend with `API_BASE_URL` pointing to backend, then open frontend URL.
4. Click `Log in` and confirm `/login` renders the branded login form.
5. Submit invalid credentials and confirm the page stays on `/login` and shows an error.
6. Submit valid backend credentials and confirm the app redirects to `/`, shows `Welcome back, <email>`, and swaps `Log in` for `Log out`.
7. Click `Log out` and confirm the session is cleared and the home page returns to the logged-out state.
8. Request `/health` on the frontend and confirm `status` + `time`.
9. Stop dev, run `npm run start`, and re-check `/`, `/login`, and `/health`.
10. Run `npm ci` and `npm run build` again to confirm reproducibility.