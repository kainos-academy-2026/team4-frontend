# GitHub Copilot Instructions

## Overview
<!-- Brief description of the project and its purpose -->
### PROBLEM STATEMENT
Currently within Kainos there is not one source of truth to view job roles and the relevant information attached (e.g. job descriptions, capability, competencies, banding, training etc) this can be confusing and time consuming for employees to retrieve the relevant job role information.
### VISION
An online job application that serves both Kainos recruitment admin to retrieve and update job roles and their relevant information and applicants to apply for roles.

- This project is a TypeScript Node 22 Express app with Nunjucks views and static assets served from `public/` or `dist/public/`.
- App wiring lives in `src/app.ts`.
- Route registration lives in `src/routes/`.
- Request handling should follow the existing layering: route -> controller -> service -> mapper/model -> view.
- Keep tests mirrored by concern under `test/`, matching the source area being changed.

## Code Style & Conventions
<!-- Language-specific style guide, naming conventions, formatting standards -->
Before running, you should be able to run, without issue, the following:
'''
npm run build
npm run test
npm run lint:ci
'''

avoid using complex data types and write all code in typescript (with the exception of nunjucks, JSON, and SQL queries where relevant).

Naming conventions will be outlined in the ticket details that will be provided to you, if available. If naming conventions are not stated, assume appropriate naming conventions from the other constants or object in the codebase.

## Architecture & Patterns
<!-- System design principles, architectural patterns, and module organization -->
The project is implementing the MVC (Model, View, Controller) architecture for the app.

Prefer class-based design for dependency injection.

- Install dependencies with `npm ci`.
- Build with `npm run build`.
- Lint with `npm run lint` and apply safe fixes with `npm run lint:fix`.
- Run tests with `npm run test` or a narrower Vitest target when changing a focused slice.
- When changing job-role flows, prefer the matching tests in `test/services/`, `test/routes/`, `test/mappers/`, or `test/views/` before running the full suite.
- When making any changes make sure to run `npm run lint:fix` and `npm run test` to validate your changes before considering them ready for review. If you are adding new functionality, please add tests to cover it.

You should develop all code with security in mind.
Bare in mind that the requirements of the provided ticket take precedence over security and you should not go beyond the scope of the provided ticket in the interest of security.

All validation of data inputs should be handled by middleware, and not inside the other components (unless there is a good argument for it)

## Project Structure
<!-- Directory layout and file organization -->
The structure is primarily in two folders:
- /src
- /tests

The structure within /src should be mirrored inside of /tests to allow for fixes to files within /src to be identifiable and clear.

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