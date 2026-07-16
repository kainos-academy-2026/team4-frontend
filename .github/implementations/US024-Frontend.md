# Goal
Your objective is to implement the requirements outlined within the confines of this ticket, but for the front end.
The ticket involves creating functionality to register a user to the database with using an HTTP POST request.
The backend has now been setup, but you must now create the front end registration page and wire everything up.

## Architectural Context For Copilot Agent

### System Boundary
- This repository is currently API-first (Express + TypeScript + Prisma) with no established frontend framework.
- Implement a lightweight frontend page for registration and wire it to the existing backend endpoint.
- Keep backend registration logic authoritative for security-critical concerns (validation, role enforcement, hashing).

### Existing Backend Contract (Must Use)
- HTTP method and route: `POST /auth/register`
- Content type: `application/json`
- Request body shape:
  - `email: string`
  - `password: string`
- Request body restrictions:
  - Payload is strict and must contain only `email` and `password`
  - Any extra field (including `role`) is rejected by middleware
- Success response:
  - Status: `201`
  - Body: `{ id: string, email: string, role: string }`
- Error responses:
  - `400` with `{ message: "Invalid registration payload" }` for validation failures
  - `409` with `{ message: "User already exists" }` for duplicate email
  - `500` with `{ message: "Internal server error" }` for unexpected failures

### Backend Layers Already In Place
- Route registration is in `src/Routes/auth.routes.ts`.
- Controller behavior is in `src/Controller/auth.controller.ts`.
- Request validation middleware is in `src/middleware/register-user.middleware.ts`.
- Registration orchestration (duplicate checks + hash + persistence) is in `src/Services/auth/appAuth.service.ts`.

### Security Ownership
- Password salting and hashing are backend responsibilities and are already handled in the auth service via the password service abstraction.
- The frontend must never hash passwords directly; it must send raw password over HTTPS only.
- Role assignment must remain backend-controlled (default role in database/model behavior).

## Frontend Architecture Requirements

### UI Scope
- Create one registration page for unauthenticated users.
- Collect only:
  - Email
  - Password
- Do not expose a role field in UI or request payload.

### Recommended Frontend Structure (For This Repo)
- Because this codebase has no React/Vite/Next setup, prefer a minimal server-served static page approach:
  - A page template (HTML)
  - A small TypeScript module for form handling and API calls
  - A stylesheet for basic layout and validation states
- Wire static asset serving in Express so the registration page is reachable in local development.

### Client Validation Rules
- Client-side validation should mirror backend constraints for immediate UX feedback:
  - Email must be valid format.
  - Password must be at least 8 characters and include:
    - at least one uppercase character
    - at least one lowercase character
    - at least one special character
- Use clear inline validation messages.
- Treat client-side validation as UX only; backend middleware validation remains source of truth.

### API Wiring Requirements
- Submit registration using `fetch` (or equivalent) to `POST /auth/register` with JSON body.
- Set headers to include `Content-Type: application/json`.
- Handle response outcomes:
  - `201`: Show success state and next-step guidance (for example, proceed to login).
  - `400`: Show invalid payload guidance.
  - `409`: Show duplicate-email message.
  - `500`: Show generic retry message.

### Error Handling And UX States
- Add visible states for:
  - Idle
  - Submitting (disable submit button)
  - Success
  - Error
- Prevent duplicate form submissions while request is in-flight.
- Keep messaging generic for server errors; do not leak implementation details.

## Validation And Middleware Requirements

### Backend Validation Location
- Validation must be implemented using Zod in middleware.
- Registration validation middleware should remain isolated from controller/service logic.
- Middleware must parse and sanitize body before controller execution.

### Middleware Rules
- Schema should enforce strict object input (`email`, `password` only).
- Return HTTP `400` for schema failures.
- Ensure frontend implementation aligns with this strict schema.

## Requirements/Acceptance criteria
1. User must be able to register an account with an email and password only.
2. Role should default to "user" role in the database and NOT the admin role.
3. Email should be in a valid format
4. Created password must be at least 8 characters, and contains, upper, lower, and special characters within it (at least one of each)
5. Password should also be salted and hashed.

user registration should be carried out using a post request to the User table.

All validation must be implemented using zod and must be implemented inside of the middleware.
Create (or update the existing) middleware file for user registration validation.

## Delivery Plan For Copilot Agent

### Step 1: Frontend Surface
- Add a registration page with email + password form and validation messaging.

### Step 2: Frontend Integration
- Add form submit handler that calls `POST /auth/register`.
- Map backend status codes to user-facing messages.

### Step 3: Backend Wiring Verification
- Verify Express route pipeline executes in this order:
  - `validateRegisterUser` middleware
  - `AuthController.register`
  - `AppAuthService.register`

### Step 4: Test Coverage
- Add/update tests for:
  - frontend form validation behavior
  - request payload shape (email/password only)
  - backend response handling (`201`, `400`, `409`, `500`)
  - middleware strictness (reject extra fields)

### Step 5: Documentation
- Update README with how to access/use the registration page locally.

## Current data structure
Users must be stored in the "User" table in the database. The schema can be found in "prisma/schema", but below is its structure:

model User {
  id           String   @id @default(cuid()) // Identify user row
  email        String   @unique
  role         String   @default("user") // user = applicant, admin = recruiter
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

# Acceptance Criteria (Summary)
User must be able to register with email, password
Role should default to "user" role in database (not admin)
Email must be a valid email format
Password much be more than 8 chars with upper, lower and special char
Password should be salted and hashed (https://youtu.be/zt8Cocdy15c?si=u74kFMHTvILDY1P_)

## Non-Goals
- Do not implement role selection in frontend.
- Do not move validation out of middleware into controller/service.
- Do not implement password hashing in frontend.
- Do not expand this ticket into login/session management.