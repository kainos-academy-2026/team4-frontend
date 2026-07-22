---
name: bdd-playwright-pom
description: "Create or refactor professional Cucumber and Playwright tests using a Cucumber-first workflow and Page Object Models; use for new test authoring, test rework, and clean test layout enforcement."
---

# BDD Playwright POM Skill

## Purpose
This skill creates and reworks tests in a professional, easy-to-understand format using Cucumber, Playwright, and Page Object Models (POMs).

This skill must support both:
1. Creating new tests from scratch.
2. Refactoring existing tests to align with project conventions.

## When To Use
Use this skill when the user asks to:
1. Create a new test for UI behavior.
2. Add or update Cucumber feature scenarios.
3. Build or update step definitions.
4. Convert raw locator tests to POM-based tests.
5. Improve directory structure or consistency of test files.

## When Not To Use
Do not use this skill for:
1. Pure API tests with no page interaction.
2. Non-testing infrastructure tasks unrelated to test authoring/refactoring.
3. Runtime debugging that does not require test changes.

## Required Workflow
Always follow this order unless the user explicitly asks otherwise:
1. Create or update the Cucumber feature file first in tests/features.
2. Create or update matching step definitions in tests/steps.
3. Implement or update POM methods in tests/pages used by the steps.
4. Run the relevant test commands and report results.

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

## POM Requirement
All UI tests should use POMs where available and appropriate.

Rules:
1. If a relevant POM already exists, use it.
2. If the existing POM is missing required methods/locators, extend that POM.
3. Do not duplicate locator logic in step files or test specs when a POM can own it.

## Missing POM Policy (Ask First)
If no relevant POM exists for a page needed by the test:
1. Pause and ask the user for permission before creating a new POM file.
2. Explain which page(s) require a POM and why.
3. Only create the new POM after user approval.

## Directory Layout Rules
Keep test assets organized in this structure:
1. tests/features: Cucumber .feature files.
2. tests/steps: Cucumber step definitions.
3. tests/pages: Page Object Models.
4. tests/fixtures: Shared fixtures and deterministic setup helpers.
5. tests/ui: Playwright UI specs.
6. tests/api: API specs.

Naming conventions:
1. Feature files use snake_case names matching behavior.
2. Step files end with .steps.ts and map clearly to feature intent.
3. POM files use PascalCase and end with Page.ts.

## Locator And Assertion Quality
Use stable selectors and precise assertions:
1. Prefer getByRole, then getByLabel, then getByTestId.
2. Avoid XPath unless no robust semantic locator exists.
3. Use row-scoped or container-scoped assertions to avoid strict mode collisions.
4. Use strict URL expectations that avoid false positives.

## Environment And Execution
Respect project environment controls:
1. Use BASE_URL from environment where applicable.
2. Use HEADED toggle from .env (or environment override) for headed/headless behavior.
3. Preserve existing timeout and launch conventions unless user asks to change them.

## Refactoring Existing Tests
When reworking current tests:
1. Preserve behavior and assertions first.
2. Move duplicated locator logic into POM methods.
3. Keep changes minimal and focused.
4. Re-run impacted tests and report pass/fail outcomes.

## Completion Checklist
Before finishing, verify:
1. Feature-first flow is respected.
2. Steps map to feature language and remain readable.
3. POM usage is applied where available.
4. Missing-POM ask-first policy was followed.
5. Files are in clean, expected directories.
6. Relevant tests were executed and results reported.
