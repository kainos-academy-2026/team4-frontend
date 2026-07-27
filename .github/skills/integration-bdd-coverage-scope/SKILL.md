---
name: integration-bdd-coverage-scope
description: "Create scoped integration tests in the repository's BDD feature format with both mock and real backend variants, comprehensive scenario depth, and explicit 100% coverage targeting within user-defined scope."
author: Development Team
version: 1.0
---

# Integration BDD Coverage Skill

## Purpose
Use this skill to create integration tests that match the existing BDD structure in this repository:
- `test/bdd/features/mock-integration-tests/*.feature`
- `test/bdd/features/real-integration-tests/*.feature`
- `test/bdd/steps/*.steps.ts`
- `test/bdd/pages/*.ts`
- `test/bdd/support/*.ts`

This skill always produces both:
1. Mock integration tests (frontend behavior with mocked backend responses).
2. Real integration tests (frontend behavior against reachable backend API).

## Primary Requirements
1. Strictly scope all test creation to the exact feature boundary requested by the user.
2. Generate comprehensive scenarios within that scope only.
3. Target 100% coverage for the selected scope (branch, path, validation, and error-state coverage).
4. Keep naming and folder style consistent with existing BDD tests.
5. Avoid writing tests outside the approved scope.

## Required Input Contract
Before generating tests, collect and confirm all required inputs.

Mandatory inputs:
1. Scope name: short identifier (example: register, login, job-role-detail).
2. Scope boundary: exact pages/routes/behaviors included.
3. Out-of-scope list: explicit exclusions.
4. Test mode selection:
- mock only
- real only
- both (default)
5. Coverage goal:
- 100% scope behavior coverage (mandatory)
- optional code coverage threshold for affected files.
6. Environment assumptions for real integration:
- expected backend base URL
- required data preconditions
- known unstable dependencies.

If any mandatory field is missing, ask targeted clarification questions first.

## Scope Enforcement Rules (Mandatory)
1. Only create or modify tests that map directly to the approved scope.
2. Do not add unrelated scenarios, steps, pages, or helpers.
3. Do not broaden to neighboring flows unless user explicitly expands scope.
4. Every created scenario must be traceable to a scope behavior line item.
5. If a required assertion cannot be implemented without expanding scope, stop and ask for approval.

## Repository Style Rules
Use the repository's current BDD style:
1. Feature files use tags and business-readable Given/When/Then language.
2. Mock tests live under `test/bdd/features/mock-integration-tests/`.
3. Real tests live under `test/bdd/features/real-integration-tests/`.
4. Existing step file patterns should be reused (for example shared steps where appropriate).
5. Use existing world/hooks conventions for request observation and mock routing.
6. Keep deterministic assertions and stable selectors.

## Page Object Model Requirement (Mandatory)
1. If a Page Object Model for the required page already exists, reuse and extend it.
2. If a required Page Object Model does not exist, create one.
3. Do not place raw locator-heavy interaction logic inside step definitions when a POM can own it.
4. Keep new POM files under `test/bdd/pages/` and follow existing naming patterns.

## File Naming Convention
Follow existing naming style:
- mock feature files: `<scope>.mock.<behavior>.feature`
- real feature files: `<scope>.real.<behavior>.feature`
- step files: `<scope>.steps.ts` (reuse existing where practical)

Example:
- `test/bdd/features/mock-integration-tests/login.mock.success.feature`
- `test/bdd/features/real-integration-tests/login.real.success.feature`

## Scenario Coverage Matrix (Mandatory)
For the approved scope, include scenarios that cover all relevant rows:
1. Happy path success.
2. Validation errors (field-level and form-level).
3. Backend conflict or business-rule rejection.
4. Backend internal error or malformed payload handling.
5. Network failure and user-visible resilience.
6. Recovery path after prior failure.
7. Boundary values for key inputs.
8. Request payload contract assertions.
9. Redirect/navigation and final page state.
10. Retry/double-submit behavior where applicable.

If a row is not applicable, include one scenario note in planning output that marks it as not applicable with reason.

## Mock And Real Integration Requirements

### Mock integration scenarios
1. Use route interception/mocking patterns already established in the BDD world.
2. Cover deterministic backend outcomes for each decision branch.
3. Assert both UI behavior and API call expectations.

### Real integration scenarios
1. Use real backend mode tags such as `@real-backend` for real flows.
2. Require backend health validation before run.
3. Use unique test data where collisions are possible.
4. Keep assertions resilient to live-system timing without hiding failures.

## Coverage Targeting Rules
100% coverage target is scoped, not repository-wide unless user asks.

Interpretation of 100% scoped coverage:
1. Every user-approved behavior has at least one scenario.
2. Every relevant branch in that behavior is exercised.
3. Every critical error path is covered.
4. Every validation rule in scope has positive and negative checks.
5. Every expected redirect/render state transition is asserted.

When user requests measurable code coverage in addition to behavior coverage:
1. Run `npm run test:coverage` and report impacted file coverage.
2. If full 100% code coverage is not achievable due to environment or untestable paths, report exact gap and reason.
3. Propose minimal additional tests to close the gap.

## Authoring Workflow
Follow this sequence:
1. Confirm scope contract and acceptance boundaries.
2. Inventory existing coverage in matching mock and real folders.
3. Identify existing Page Object Models and create missing ones before writing new locator interactions.
4. Build a scenario matrix and identify missing coverage rows.
5. Create or update feature files first.
6. Create or update step definitions and page methods second.
7. Reuse existing hooks/world wiring; extend only when required by scope.
8. Execute targeted mock and real runs.
9. Report pass/fail and scoped coverage status.

## Execution Commands
Use the narrowest command possible:
1. Run mock scope folder or feature subset.
2. Run real scope folder or feature subset.
3. Use full BDD run only when user requests broader validation.

Known repository commands:
- `npm run test:bdd`
- `npm run test:bdd:register:mock:folder`
- `npm run test:bdd:register:real:folder`

If a scope-specific script does not exist, run cucumber with a direct feature glob matching only approved scope files.

## Required Final Report Format
When this skill completes, output a concise report containing:
1. Confirmed scope and exclusions.
2. Files created or updated.
3. Scenario matrix coverage summary (row by row).
4. Mock run result.
5. Real run result.
6. Coverage status against 100% scoped target.
7. Remaining gaps, if any, with explicit blockers.

## Quality Guardrails
1. No placeholder assertions.
2. No flaky timing-based steps without deterministic waits.
3. No duplicate scenarios that do not increase coverage.
4. No hidden coupling across scenarios.
5. Preserve readability and business intent in feature text.

## Stop Conditions
Stop and ask the user before proceeding when:
1. Scope is ambiguous.
2. Real backend is unreachable.
3. Required credentials or environment values are missing.
4. Proposed test requires expanding beyond approved scope.
