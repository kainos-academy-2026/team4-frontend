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

- Run all BDD features:

```bash
npm run test:bdd
```

- Install Playwright browser dependency for BDD runs (first time only):

```bash
npm run test:bdd:install
```

## Registration Integration Tests (BDD)

Registration BDD features are now organized by integration mode:

- Mock integration features: `test/bdd/features/mock-integration-tests/`
- Real backend integration features: `test/bdd/features/real-integration-tests/`

Each `.feature` file contains exactly one scenario (or one scenario outline).

### Run mock registration integration tests

Primary run command:

```bash
npm run test:bdd:register:mock
```

Folder-based run:

```bash
npm run test:bdd:register:mock:folder
```

### Run real registration integration tests

Start a reachable backend first and ensure the backend health endpoint is available.

Primary run command:

```bash
npm run test:bdd:register:real
```

Folder-based run:

```bash
npm run test:bdd:register:real:folder
```

If your backend is not at `http://localhost:3000`, set the base URL:

```bash
TEST_REAL_BACKEND_API_BASE_URL=http://localhost:4000 npm run test:bdd:register:real
```

### Run all registration BDD tests

```bash
npm run test:bdd:register:all
```

Default local port is `3000`. Override with `PORT`, for example:

```bash
PORT=4000 npm run start
```

Frontend API connection values can be set in `.env`:

```ini
PORT=3001
API_BASE_URL=http://localhost:3000
```

## Endpoints

- `GET /` renders the branded home page with open job roles.
- `GET /login` renders the login page.
- `POST /api/login` proxies login to the backend auth endpoint.
- `POST /logout` clears the frontend auth cookie.
- `GET /health` returns JSON with:
	- `status`: `UP`
	- `time`: current timestamp in ISO-8601 format
- `GET /job-roles` renders open job roles.
  - Calls backend `GET /job-roles` using Axios.
- `GET /job-roles/:id` renders a specific job role detail page.
  - Calls backend `GET /job-roles/:id` using Axios.
- `GET /job-roles/:id` renders the job role detail page.
- `GET /job-roles/:id/apply` renders the job application page.
- `POST /job-roles/:id/applications` uploads a CV for a role.
- `GET /job-roles/:id/applications/me` fetches the logged-in user's application status.
- `GET /job-roles/:id` renders the job role detail page.
- `GET /job-roles/:id/apply` renders the job application page.
- `POST /job-roles/:id/applications` uploads a CV for a role.

## Login Integration

- Login form sends `email` and `password` to backend `POST /auth/login`.
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
2. Run the backend API and ensure `POST /auth/login` is available.
3. Run frontend with `API_BASE_URL` pointing to the backend, then open `http://localhost:3000/`.
4. Click `Log in` and confirm `http://localhost:3000/login` renders the branded login form.
5. Submit invalid credentials and confirm the page stays on `/login` and shows an error.
6. Submit valid credentials and confirm the app redirects to `/`, shows a welcome message, and swaps `Log in` for `Log out`.
7. Click `Log out` and confirm the session is cleared and the home page returns to the logged-out state.
8. Request `http://localhost:3000/health` and confirm `status` + `time`.
9. Stop dev, run `npm run start`, and re-check `/`, `/login`, and `/health`.
10. Run `npm ci` and `npm run build` again to confirm reproducibility.

## Registration Acceptance Checks

1. Run the backend API and ensure `POST /auth/register` is available.
2. Run frontend and open `/register`.
3. Submit an invalid email and weak password and confirm inline validation messages are shown.
4. Submit valid details and confirm success guidance appears.
5. Submit an already-registered email and confirm duplicate-user guidance appears.
6. Confirm no role field is sent from the frontend payload.
