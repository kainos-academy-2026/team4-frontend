# GitHub Copilot Instructions

## Overview
<!-- Brief description of the project and its purpose -->
### PROBLEM STATEMENT
Currently within Kainos there is not one source of truth to view job roles and the relevant information attached (e.g. job descriptions, capability, competencies, banding, training etc) this can be confusing and time consuming for employees to retrieve the relevant job role information.
### VISION
An online job application that serves both Kainos recruitment admin to retrieve and update job roles and their relevant information and applicants to apply for roles.

This project should allow users to track open roles and apply to jobs, while also allowing Admins to create new job postings and modify them if needed.
- Prefer one-to-one source/test symmetry: if a file exists in `src/<area>/`, place its nearest tests under `test/<area>/` and use matching names where practical (for example `src/routes/loginRouter.ts` -> `test/routes/loginRouter.test.ts`, `src/views/login.njk` -> `test/views/login.njk.test.ts`).
- When creating new source folders under `src/`, create the corresponding folder under `test/` in the same change when tests are needed.

## Conventions

- Never manually make changes to `dist/` or `dist/public/` files; they are generated from `src/` and `public/` respectively, instead delete and run commands to regenerate them.
- Keep changes narrow and consistent with the existing file you are editing rather than introducing new patterns.
- Prefer strict TypeScript types and existing model/view-model shapes over ad hoc objects.
- For job roles, keep fallback mock data as full `JobRole` objects and map to list items in the service/mapper path when needed.
- In `JobRoleService`, list behaviour should keep using list mapping plus open-status filtering; detail behaviour should return full role detail.
- Demo auth is frontend-only. Do not add backend authentication assumptions to the login flow unless the task explicitly requires that change.
- Preserve existing Nunjucks rendering patterns: controllers prepare view models, views remain presentation-focused, and user-facing failures render friendly states instead of throwing.
- Follow the existing import style in the touched file. This repo uses `moduleResolution: "Node16"`, and some runtime-facing relative imports intentionally use `.js` suffixes.
- Enums should never be mapped in the database layer. Instead, map them in the service/mapper layer to avoid coupling the database schema to the application code.

## Views And Assets

- Nunjucks templates live in `src/views/` and are copied to `dist/views/` during build.
- Static branding assets in `public/` are source files and may be edited directly. Only `dist/public/` is generated and must not be manually edited.
- If a change affects rendered HTML, static assets, or page text, update or add the nearest integration/view test.

## Build And Validation

- Install dependencies with `npm ci`.
- Build with `npm run build`.
- Lint with `npm run lint` and apply safe fixes with `npm run lint:fix`.
- Run tests with `npm run test` or a narrower Vitest target when changing a focused slice.
- When changing job-role flows, prefer the matching tests in `test/services/`, `test/routes/`, `test/mappers/`, or `test/views/` before running the full suite.
- Before requesting review, run `npm run lint:fix` and `npm run test` to validate your changes. When adding new functionality, add tests to cover it.

## Known Constraints & Limitations
<!-- Project-specific limitations or gotchas to be aware of -->
You will be provided with a ticket to work through, do not go beyond the scope of the ticket.
You should also avoid unnecessarily complex typings for variables. 