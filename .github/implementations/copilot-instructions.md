# Project Guidelines

## Stack And Structure

- This project is a TypeScript Node 22 Express app with Nunjucks views and static assets served from `public/` or `dist/public/`.
- Express app wiring lives in `src/app.ts`, and the server entrypoint lives in `src/index.ts`.
- Route registration lives in `src/routes/`.
- Request handling should follow the existing layering: route -> controller -> service -> mapper/model -> view.
- Keep tests mirrored by concern under `test/`, matching the source area being changed.
- Prefer one-to-one source/test symmetry: if a file exists in `src/<area>/`, place its nearest tests under `test/<area>/` and use matching names where practical (for example `src/routes/loginRouter.ts` -> `test/routes/loginRouter.test.ts`, `src/views/login.njk` -> `test/views/login.njk.test.ts`).
- When creating new source folders under `src/`, create the corresponding folder under `test/` in the same change when tests are needed.

## Conventions

- Keep changes narrow and consistent with the existing file you are editing rather than introducing new patterns.
- Prefer strict TypeScript types and existing model/view-model shapes over ad hoc objects.
- For job roles, keep fallback mock data as full `JobRole` objects and map to list items in the service/mapper path when needed.
- In `JobRoleService`, list behaviour should keep using list mapping plus open-status filtering; detail behaviour should return full role detail.
- Demo auth is frontend-only. Do not add backend authentication assumptions to the login flow unless the task explicitly requires that change.
- Preserve existing Nunjucks rendering patterns: controllers prepare view models, views remain presentation-focused, and user-facing failures render friendly states instead of throwing.
- Follow the existing import style in the touched file. This repo uses `moduleResolution: "Node16"`, and some runtime-facing relative imports intentionally use `.js` suffixes.

## Views And Assets

- Nunjucks templates live in `src/views/` and are copied to `dist/views/` during build.
- Static branding assets live under `public/`; branding styles are in `public/styles/branding.css`.
- If a change affects rendered HTML, static assets, or page text, update or add the nearest integration/view test.

## Build And Validation

- Install dependencies with `npm ci`.
- Build with `npm run build`.
- Lint with `npm run lint` and apply safe fixes with `npm run lint:fix`.
- Run tests with `npm run test` or a narrower Vitest target when changing a focused slice.
- When changing job-role flows, prefer the matching tests in `test/services/`, `test/routes/`, `test/mappers/`, or `test/views/` before running the full suite.
- Before requesting review, run `npm run lint:fix` and `npm run test` to validate your changes. When adding new functionality, add tests to cover it.

## Environment Notes

- Default local port is `3000` and can be overridden with `PORT`.
- Backend API access is configured through `API_BASE_URL`.
- `USE_JOB_ROLE_FALLBACK_MOCK=true` enables frontend fallback data for job roles.
- `ENABLE_DEMO_AUTH=true` enables the demo-only login behaviour.
