---
name: bdd-playwright-pom
description: "Create or refactor professional tests using the repo's existing test stack, using Cucumber and Playwright with Page Object Models when browser BDD coverage is appropriate and supported by the project."
---

# BDD Playwright POM Skill

## Purpose
This skill creates and reworks tests in a professional, easy-to-understand format using the testing tools that fit the scenario and the repository.

It supports both repo-native test workflows such as Vitest, Supertest, and view/integration tests, and browser BDD workflows using Cucumber, Playwright, and Page Object Models (POMs) when those tools are already part of the project or the user explicitly wants them added.

This skill must support both:
1. Creating new tests from scratch.
2. Refactoring existing tests to align with project conventions.

## When To Use
Use this skill when the user asks to:
1. Create a new test for UI behavior.
2. Add or update Cucumber feature scenarios.
3. Build or update step definitions.
4. Create or refine Vitest, Supertest, view, or integration tests.
5. Convert raw locator tests to POM-based tests.
6. Improve directory structure or consistency of test files.

## When Not To Use
Do not use this skill for:
1. Pure API tests with no page interaction.
2. Non-testing infrastructure tasks unrelated to test authoring/refactoring.
3. Runtime debugging that does not require test changes.

## Required Workflow
Always follow this order unless the user explicitly asks otherwise:
1. Inspect the existing test stack, test directories, and package scripts before choosing a test approach.
2. Use the project's current framework for the touched area unless the user explicitly asks for a different tool and the repo supports it.
3. For service, controller, route, mapper, view, and Express integration behavior, prefer the repo's existing unit/integration tooling such as Vitest and Supertest.
4. For browser-driven UI behavior that genuinely benefits from BDD flows, use Cucumber plus Playwright only when those tools already exist in the repo or the user explicitly wants them introduced.
5. If using Cucumber and Playwright, create or update the feature file first, then matching step definitions, then the POM methods used by the steps.
6. Run the relevant narrow validation command and report results.

## Tool Selection Rules
Choose the test approach that matches the behavior under test:
1. Use Vitest for unit tests and most existing view/controller/service coverage when the repo already uses Vitest.
2. Use Supertest for HTTP route and app integration behavior in Express apps when the current repo already follows that pattern.
3. Use Cucumber plus Playwright for end-to-end browser behavior only when the project already contains that stack or the user explicitly requests that workflow.
4. Do not introduce a second test framework by default when the existing repo already has a clear local convention.
5. If the scenario can be covered cleanly without a browser, avoid escalating it to browser automation.

## Cucumber Feature Standards
Feature files must:
1. Use clear business-readable language.
2. Express meaningful behavior in Given/When/Then form.
3. Avoid vague or circular scenarios (for example, starting and ending on the same page without a real action).
4. Use tags when step hooks need scoping (for example, @create-user, @go-home).
5. Keep scenarios focused on one behavior outcome.

## Step Definition Standards
Step files must:
1. Be paired to feature behavior and stay easy to read.
2. Use tag-scoped hooks where appropriate so setup does not leak across features.
3. Set Cucumber timeout to a reliable value for browser startup.
4. Use deterministic test setup and unique test data where needed.
5. Call POM methods instead of raw page locators whenever a suitable POM exists.

These standards apply only when the chosen test approach is Cucumber-based.

## POM Requirement
Browser UI tests should use POMs where available and appropriate.

Rules:
1. If a relevant POM already exists, use it.
2. If the existing POM is missing required methods/locators, extend that POM.
3. Do not duplicate locator logic in step files or test specs when a POM can own it.
4. Do not force POM creation for non-browser tests such as Vitest view, controller, or route tests.

## Missing POM Policy (Ask First)
If browser automation is the right approach and no relevant POM exists for a page needed by the test:
1. Pause and ask the user for permission before creating a new POM file.
2. Explain which page(s) require a POM and why.
3. Only create the new POM after user approval.

## Directory Layout Rules
Keep test assets organized according to the repository's existing structure instead of introducing a new layout by default.

Rules:
1. Reuse the current top-level test directory already present in the repo, for example `test/` in Vitest-based projects or `tests/` in projects that already use that layout.
2. Mirror the source concern when the repo already does that, for example controller tests under the controller test area and route tests under the route test area.
3. Only use `features`, `steps`, `pages`, or other browser-BDD folders when the project already contains them or when the user explicitly approves introducing them.
4. Do not create parallel directory trees such as both `test/` and `tests/` unless the repo already intentionally uses both.

Naming conventions:
1. Follow the repo's existing naming convention first.
2. For Cucumber assets, feature files should use clear behavior-based names and step files should map clearly to feature intent.
3. For POM files, use PascalCase and a `Page` suffix when that convention is already established.

## Locator And Assertion Quality
Use stable selectors and precise assertions:
1. Prefer getByRole, then getByLabel, then getByTestId.
2. Avoid XPath unless no robust semantic locator exists.
3. Use row-scoped or container-scoped assertions to avoid strict mode collisions.
4. Use strict URL expectations that avoid false positives.

These locator rules apply to browser automation, not server-rendered HTML assertions in unit or integration tests.

## Environment And Execution
Respect project environment controls:
1. Use the environment variable names that already exist in the repo instead of assuming `BASE_URL` or `HEADED`.
2. Read package scripts, test config, and example env files before assuming execution flags or browser launch settings.
3. Preserve existing timeout, launch, and test-runner conventions unless the user asks to change them.
4. If browser tooling is being introduced, define its configuration explicitly instead of relying on undocumented environment assumptions.

## Refactoring Existing Tests
When reworking current tests:
1. Preserve behavior and assertions first.
2. Keep the existing framework unless there is a clear reason to migrate the test.
3. Move duplicated locator logic into POM methods only for browser-based tests.
4. Keep changes minimal and focused.
5. Re-run impacted tests and report pass/fail outcomes.

## Completion Checklist
Before finishing, verify:
1. The chosen test tool matches the scenario and the repo's existing stack.
2. The repo's current test layout and naming conventions were preserved.
3. Feature-first flow is respected when using Cucumber.
4. Steps map to feature language and remain readable when using Cucumber.
5. POM usage is applied where appropriate for browser tests.
6. Missing-POM ask-first policy was followed when relevant.
7. Files are in clean, expected directories.
8. Relevant tests were executed and results reported.
