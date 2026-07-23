---
name: Bug_Reporting
description: Executes tests derived from Test_Cases outputs and records failures in CSV format with title, environment, reproduction steps, expected result, actual result, severity, priority, risk score, and evidence.
author: Development Team
version: 1.1
---

# Bug Reporting CSV Generator

## Overview
This skill is designed to follow directly from the Test_Cases skill. Use it after test cases have been created and when the next step is to design executable tests from those test cases, run them, capture outcomes, and document failures in a structured CSV bug report.

This skill is for:
- Turning test cases into executable test runs.
- Recording failed or unexpected outcomes.
- Producing bug reports in CSV format for triage and prioritization.
- Creating a repeatable defect log tied back to the originating test cases.

This skill is not for:
- Replacing the Test_Cases skill.
- Writing informal prose-only bug summaries.
- Logging feature requests or non-defect enhancements as bugs.

### Repo Context
- This repo is `team4-frontend`, a Node 22 Express app that renders Nunjucks views and serves public assets.
- Common execution surfaces are Vitest route tests, controller tests, service tests, mapper tests, view/template tests, static asset checks, and Supertest integration tests.
- Relevant environment flags may include `API_BASE_URL`, `USE_JOB_ROLE_FALLBACK_MOCK`, and `ENABLE_DEMO_AUTH`.

## Relationship To Test_Cases

Use this skill after one of the following has happened:
- Test cases were generated from `.github/Test_Cases.md`.
- Existing CSV test cases produced for this repo were reviewed and selected for execution.
- A Sanity, Smoke, Feature, or Full Regression run has been requested.

Expected handoff inputs from Test_Cases:
- Test case ID
- Title
- Test Suite Type
- Preconditions
- Test Steps
- Expected Results
- Test Data

This skill should preserve traceability from executed test case to bug report wherever practical.

---

## Output Format

All bug reports must be generated as CSV tables with the following columns in this exact order:

1. Title
2. Environment
3. Steps to Reproduce
4. Expected Result
5. Actual Result
6. Severity
7. Priority
8. Risk Score
9. Attachments/Evidence

Canonical CSV header:

```csv
Title,Environment,Steps to Reproduce,Expected Result,Actual Result,Severity,Priority,Risk Score,Attachments/Evidence
```

Example:

```csv
Title,Environment,Steps to Reproduce,Expected Result,Actual Result,Severity,Priority,Risk Score,Attachments/Evidence
Login page omits required branding stylesheet,"macOS; Node 22; local Vitest run","1. Run the login page template contract test; 2. Inspect the rendered HTML; 3. Verify stylesheet link presence","Rendered login page includes /styles/branding.css","Rendered login page omits the branding stylesheet link",High,High,9,"Vitest output for loginPage.test.ts; rendered HTML excerpt missing /styles/branding.css"
```

---

## CSV Guidelines

- Keep the CSV valid and tabular with exactly 9 columns per row.
- Wrap fields containing commas in quotes.
- Use semicolons within a field when listing multiple values.
- Keep `Steps to Reproduce` sequential and action-oriented.
- Keep `Expected Result` aligned to the originating test case expectation.
- Keep `Actual Result` factual and observable.
- Record evidence in `Attachments/Evidence` when available.
- If no bug is found for a given executed test case, do not create a bug row for that passing result unless the user explicitly asks for a pass/fail execution log.

---

## CSV Schema Safety Guardrails (Mandatory)

Hard constraints:
- Never add extra columns.
- Never reorder or rename the required columns.
- Never append free text outside the 9th column.
- Never leave out `Risk Score`; calculate it using the defined model below.
- Never invent evidence that was not observed.

Post-edit validation before finalizing:
- Confirm header exactly matches the canonical 9-column header.
- Confirm every data row parses to exactly 9 columns.
- Confirm no trailing notes exist outside the CSV row structure.

---

## Environment Capture Rules

The `Environment` field should describe the environment from which the test was executed. Include what is known from the workspace or runtime context.

Prefer this structure:
- OS
- Runtime/toolchain
- Execution mode
- Relevant app mode or backing dependency
- Any environment flags or notable config

Examples:
- `macOS; Node 22; local Vitest run`
- `macOS; Node 22; local Supertest integration run; API_BASE_URL configured`
- `macOS; Node 22; local Vitest run; USE_JOB_ROLE_FALLBACK_MOCK=true`
- `CI Linux runner; Node 22; npm run test`

If some environment information is unknown, include only verified facts. Do not guess.

---

## Severity And Priority Model

### Severity

Use one of these values:
- Critical
- High
- Medium
- Low

Interpretation:
- Critical: System unusable, security failure, data loss, or release-blocking outage.
- High: Major feature broken, no reasonable workaround, high user or business impact.
- Medium: Important defect with workaround or partial impact.
- Low: Minor defect, cosmetic issue, low operational impact.

### Priority

Use one of these values:
- Critical
- High
- Medium
- Low

Interpretation:
- Critical: Must be fixed immediately.
- High: Should be fixed in the current cycle.
- Medium: Should be scheduled soon.
- Low: Can be deferred if necessary.

### Risk Score

Calculate `Risk Score` by combining Severity and Priority using this numeric mapping:
- Critical = 4
- High = 3
- Medium = 2
- Low = 1

Formula:
- `Risk Score = Severity Score x Priority Score`

Examples:
- Critical + Critical = 16
- High + High = 9
- High + Medium = 6
- Medium + Low = 2

Always store the numeric result in the CSV.

---

## Execution Workflow

Use this workflow when converting test cases into bug reports.

1. Confirm scope.
- Identify whether the user wants Sanity, Smoke, Feature, or Full Regression execution.
- Identify which test case files or IDs are in scope.

2. Identify execution surface.
- Map each selected test case to an executable path.
- Determine whether it is best executed as a route test, controller test, service test, mapper test, view/template test, static asset check, type-check, manual verification, or a combination.
- Prefer existing Vitest and Supertest coverage where available before inventing manual-only steps.

3. Prepare environment.
- Capture the current verified environment.
- Start or verify required services if needed, such as the local app for manual verification.
- Note blockers such as missing env vars, unavailable API connectivity, or asset-copy/build issues.

4. Execute tests.
- Run the relevant automated tests when available.
- If no automated path exists, perform the narrowest manual verification that matches the test case.
- Record observed results exactly.

5. Compare actual vs expected.
- Use the originating test case `Expected Results` as the baseline.
- Log a bug only when the observed behavior differs materially from the expected behavior.

6. Assign severity and priority.
- Base severity on impact.
- Base priority on urgency and delivery risk.
- Calculate numeric risk score.

7. Capture evidence.
- Include terminal output summaries, response payloads, rendered HTML excerpts, screenshots, stack traces, or file references where available.
- Evidence must be factual and reproducible.

8. Generate CSV bug rows.
- One row per distinct defect.
- Merge duplicates only when the same underlying defect causes the same observable failure.

9. Report residual gaps.
- Note tests not executed.
- Note blocked tests.
- Note inconclusive results separately from confirmed defects.

---

## Test Execution Types To Consider

When designing executable tests from test cases, consider the most appropriate execution type:
- Sanity testing
- Smoke testing
- Feature testing
- Full regression testing
- Route and integration testing
- Controller testing
- Service testing
- Mapper testing
- View/template contract testing
- Static asset and public path validation
- Error handling testing
- Type-check or compile validation
- Manual exploratory confirmation where automation is not available

If a test type is inappropriate, state that explicitly in the summary rather than forcing an invalid execution path.

---

## Evidence Guidance

Preferred evidence sources:
- Terminal command output
- Failing test output
- HTTP request and response payloads
- Rendered HTML excerpts
- Stack traces
- Logs
- Screenshots when available
- File references to relevant code or test definitions

Evidence field examples:
- `Vitest output for loginPage.test.ts; rendered HTML missing /styles/branding.css`
- `Terminal output from npm run test; stack trace in jobRoleService getOpenRoles path`
- `HTTP 500 response from GET /job-roles/999 during local Supertest run`

If no evidence can be captured, write:
- `No attachment captured; behavior reproduced manually in local environment`

---

## Bug Row Writing Rules

- Title should be concise and defect-focused.
- Steps to Reproduce should be directly executable.
- Expected Result should describe intended behavior, not implementation detail.
- Actual Result should describe what happened, including incorrect status codes, missing markup, broken asset paths, or incorrect messages when relevant.
- Severity and Priority must use only the allowed values.
- Risk Score must always be numeric and derived from the defined matrix.

---

## Re-Evaluation And Follow-Up

Use this skill again when:
- A fix is delivered and retest is needed.
- A failed Sanity run needs escalation into Feature or Full Regression execution.
- New evidence changes severity or priority.
- Duplicate defects need consolidation.

---

## Final Output Checklist

Before finalizing bug report CSV output, confirm:
- The executed scope is clear.
- Environment reflects verified runtime facts only.
- Each bug row corresponds to an actual observed failure.
- Each row has exactly 9 columns.
- Severity and Priority use allowed values only.
- Risk Score is numeric and correctly calculated.
- Evidence is included where possible and not invented.
- Blocked or unexecuted tests are called out separately if relevant.

---

## Example Bug Report Output

```csv
Title,Environment,Steps to Reproduce,Expected Result,Actual Result,Severity,Priority,Risk Score,Attachments/Evidence
Job role list shows closed roles in the rendered page,"macOS; Node 22; local Vitest run; USE_JOB_ROLE_FALLBACK_MOCK=true","1. Enable fallback mock mode; 2. Run the job role list flow; 3. Inspect the rendered job role list","Only open job roles are rendered","Closed roles are visible in the rendered list",High,High,9,"Vitest output from jobRoleService.test.ts; rendered list assertion failed"
Login page omits branding stylesheet,"macOS; Node 22; local Vitest run","1. Run the login page template contract test; 2. Inspect the rendered HTML; 3. Verify stylesheet link presence","Rendered login page includes /styles/branding.css","Rendered login page omits the branding stylesheet link",Medium,High,6,"Vitest output from loginPage.test.ts; rendered HTML excerpt missing stylesheet link"
```
