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
- `GET /register` renders the registration page.
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

## Registration Integration

- Registration form sends `email` and `password` to backend `POST /auth/register`.
- Frontend payload is limited to `email` and `password` only.
- Password is never hashed in the browser; hashing/salting is backend-only.
- Frontend handles backend outcomes:
	- `201`: shows account-created success guidance with login CTA.
	- `400`: shows invalid-payload guidance.
	- `409`: shows duplicate-user guidance.
	- `500` and network failures: shows generic retry guidance.
- Submit button is disabled while a request is in-flight to prevent duplicate submissions.

Example health response:

```json
{
	"status": "UP",
	"time": "2026-07-06T10:30:00.000Z"
}
```

## Acceptance Criteria Checks

1. Run `npm run build` and confirm `dist` is created.
2. Run the backend API and ensure `POST /auth/login` is available.
3. Run frontend with `API_BASE_URL` pointing to backend, then open the frontend URL.
4. Confirm `/` and `/login` render correctly.
5. Submit invalid credentials and confirm `/login` shows an error.
6. Submit valid credentials and confirm redirect to `/` with logged-in state visible.
7. Click `Log out` and confirm the app returns to logged-out state.
8. Request `/health` on the frontend and confirm `status` + `time`.
9. Stop dev, run `npm run start`, and re-check `/`, `/login`, and `/health`.
10. Run `npm ci` and `npm run build` again to confirm reproducibility.

## Registration Acceptance Checks

1. Run the backend API and ensure `POST /auth/register` is available.
2. Run frontend and open `/register`.
3. Submit an invalid email and weak password and confirm inline validation messages are shown.
4. Submit valid details and confirm success guidance appears.
5. Submit an already-registered email and confirm duplicate-user guidance appears.
6. Confirm no role field is sent from the frontend payload.
