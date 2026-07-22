---
name: Test_Cases
description: Generates comprehensive test plans in CSV format for team4-frontend project features with columns for ID, Title, Test Type, Test Suite Type, Preconditions, Test Steps, Expected Results, Actual Results, and Test Data.
author: Development Team
version: 1.4
---

# Test Plan CSV Generator

## Overview
This skill generates comprehensive test plans in CSV format for team4-frontend features. The project uses **Vitest** for automated tests, **Supertest** for HTTP integration coverage, **TypeScript** for type safety, and follows an Express plus Nunjucks layering of route -> controller -> service -> mapper/model -> view.

### Testing Philosophy
- **Coverage Target**: Aim for broad, meaningful coverage of repo behavior where feasible.
- **Test Comprehensiveness**: Generate a varied set of cases that reflect real user flows, rendering contracts, data mapping, and error handling.
- **Output Format**: CSV table for easy import to test management tools.
- **Framework**: Vitest with TypeScript support; use Supertest when route-level HTTP assertions are appropriate.
- **Organization**: Mirror source concerns under `/test`, matching controllers, services, mappers, routes, views, and public asset behavior.

### Repo Context
- App type: Node 22 Express server rendering Nunjucks templates and serving static assets from `public/` or `dist/public/`.
- Important source areas: `src/controllers/`, `src/services/`, `src/mappers/`, `src/models/`, `src/routes/`, `src/views/`, `src/config/`, `src/mocks/`.
- Important test areas: `test/controllers/`, `test/services/`, `test/mappers/`, `test/routes/`, `test/views/`, plus integration and asset-focused tests in `test/*.test.ts`.
- Relevant app behaviors: home page rendering, login page/demo auth behavior, job role list/detail flows, public asset serving, public path resolution, and fallback mock handling.

### Test Suite Types
- **Sanity**: Focused verification of the changed route, view, service, mapper, or asset path to confirm the build is stable enough for deeper testing.
- **Smoke**: Minimal critical-path checks that validate app startup and high-risk user-facing flows such as home page rendering, login page rendering, and job role access.
- **Feature**: Focused coverage for one feature boundary and directly related dependencies, such as job roles or login flow.
- **Full Regression**: Broad repo-wide coverage including happy path, negative, edge, validation, rendering, and error handling behavior.

When generating test cases, always align depth and breadth with the selected suite type:
- Sanity: small targeted set for the recently changed slice and immediate defect-prone paths.
- Smoke: small high-value set only.
- Feature: comprehensive for the selected feature boundary.
- Full Regression: comprehensive across the requested scope or entire codebase.

## Output Format
All test plans are generated as CSV tables with the following columns:
- **ID**: Unique test case identifier (TC-001, TC-002, etc.)
- **Title**: Descriptive test case name
- **Test Type**: Category of the test (Happy Path, Unhappy Path, Data Validation, Edge Case, Authorization & Security, etc.)
- **Test Suite Type**: Suite classification for execution strategy (Sanity, Smoke, Feature, Full Regression)
- **Preconditions**: Setup requirements before test execution
- **Test Steps**: Sequential steps to execute the test
- **Expected Results**: What should happen when test passes
- **Actual Results**: To be filled during test execution
- **Test Data**: Input values, rendered state, flags, mocks, or configuration used

---

## Input Section

**Function Name:**
```
[Enter the function, route, template, or feature to test]
Search the relevant `src/` and `test/` areas to identify existing coverage and missing cases.
Prefer the nearest owning surface: route, controller, service, mapper, model, template, or public asset behavior.
```

**Suite Type:**
- [ ] Sanity
- [ ] Smoke
- [ ] Feature
- [ ] Full Regression

**Split Output Into Categories:**
- [ ] Yes
- [ ] No

If the user has not specified split preference, ask before generating:
- "Do you want the test cases split into separate category files (for example job-roles, login, views, or static-assets), or kept in one combined CSV?"

If the user has not specified suite type, ask before generating:
- "Which suite type do you want: sanity, smoke, feature, or full regression?"

**File Location:**
```
[Enter the file path where the behavior is controlled]
Explore repo structure including:
- src/controllers/ - HTTP request handlers that prepare view models
- src/services/ - Business logic and API/fallback orchestration
- src/mappers/ - API-to-model transformations
- src/models/ - Domain shapes and view-model contracts
- src/routes/ - Route registration and request wiring
- src/views/ - Nunjucks templates and rendering contracts
- src/config/ - Runtime configuration such as API client and demo auth flags
- src/mocks/ - Fallback mock data used when configured
- public/ - Static assets, client-side scripts, and branding styles
```

**Function Type:**
- [ ] Controller Method (handles HTTP requests and prepares render data)
- [ ] Service Method (business logic or API/fallback behavior)
- [ ] Mapper (data transformation)
- [ ] Route Module (routing and wiring)
- [ ] View Template Contract (rendered HTML behavior)
- [ ] Static Asset / Client Script Behavior
- [ ] Utility/Helper Function

**Description:**
```
[Brief description of what the function or feature does and where it sits in the route -> controller -> service -> mapper/model -> view flow]
```

**Parameters:**
```
[List each parameter, request input, template variable, config flag, or mock input with type and description]
```

**Return Type:**
```
[Specify the return type, rendered output, HTTP response, or side effect with description]
```

---

## CSV Output Format

Generate test cases using this exact CSV format:

```csv
ID,Title,Test Type,Test Suite Type,Preconditions,Test Steps,Expected Results,Actual Results,Test Data
TC-001,Test name,Happy Path,Smoke,Prerequisites,Step 1; Step 2; Step 3,Expected outcome,,Input: value1; Mock: value2
TC-002,Test name,Unhappy Path,Full Regression,Prerequisites,Step 1; Step 2; Step 3,Expected outcome,,Input: value1; Mock: value2
```

### CSV Guidelines:
- Use semicolons (;) to separate multiple items within a single field.
- Wrap fields containing commas in quotes ("field with, comma").
- ID format: TC-### (TC-001, TC-002, etc.).
- Test Type values: Happy Path, Unhappy Path, Data Validation, Edge Case, Authorization & Security, Error Handling.
- Test Suite Type values: Sanity, Smoke, Feature, Full Regression.
- Test Steps should be numbered and sequential.
- Keep Expected Results concise but complete.
- Leave Actual Results empty unless the user explicitly asks to populate execution outcomes.
- Include all relevant test data such as inputs, mocks, flags, expected markup fragments, or API responses.
- Record technique traceability only inside the `Test Data` field using `Technique: <name>`.

### CSV Schema Safety Guardrails (Mandatory)

The output must always remain valid 9-column CSV with this exact header:

```csv
ID,Title,Test Type,Test Suite Type,Preconditions,Test Steps,Expected Results,Actual Results,Test Data
```

Hard constraints:
- Never append free text after the 9th column.
- Never add an extra `Technique` column.
- Never modify, reorder, or rename header columns.
- If adding metadata (for example technique), include it inside `Test Data` only.
- Keep `Actual Results` empty unless explicitly asked to populate execution outcomes.

Valid technique placement example:

```csv
TC-001,Job role list renders open roles,Happy Path,Smoke,App is configured with available job role data,1. Start the app; 2. Request GET /job-roles; 3. Verify rendered list,Returns 200; Returns HTML containing only open job roles,,"Input: GET /job-roles; Expected markup: job role cards; Technique: Use Case Testing"
```

Invalid patterns (forbidden):
- `...,"Input: ..."; Technique: Use Case Testing`  (text outside the 9th field)
- `...,Actual Results,Test Data,Technique` (extra column)
- Any row with more or fewer than 9 CSV columns

Post-edit validation (required before finalizing):
- Confirm header exactly matches the canonical 9-column header.
- Confirm every data row parses to exactly 9 columns.
- Confirm all `Technique:` tags appear only within `Test Data`.
- Confirm split files and consolidated file use identical schema.

When split output is selected:
- Keep the same CSV schema in every file.
- Keep IDs globally unique across files where possible.
- Use clear file naming based on category, for example `job-roles-test-cases.csv`, `login-test-cases.csv`, `views-test-cases.csv`, or `static-assets-test-cases.csv`.

---

## Test Case Categories to Cover

**Happy Path (Success Cases):**
- Normal execution with valid inputs.
- Common user journeys such as home page render, login page render, and job role list/detail views.

**Unhappy Path (Failure Cases):**
- Upstream API failures or empty responses.
- Missing role IDs, not-found behavior, and invalid route inputs.
- Rendered error states and graceful failure handling.

**Edge Cases & Boundaries:**
- Empty, null, or undefined template data.
- Open versus closed job role status boundaries.
- Special characters, unicode, and date formatting boundaries.
- Missing assets or stale dist/public path conditions.

**Error Handling:**
- Invalid inputs and validation failures.
- API/client failures and fallback mock behavior.
- HTTP error responses (400, 404, 500) when applicable.
- Friendly user-facing failure states instead of thrown rendering failures.

**Data Validation:**
- Type mismatches across controller, service, mapper, and view boundaries.
- Required field presence in template context or mapped role data.
- Format validation for email fields, dates, and URLs when surfaced by the feature.
- Business rules such as open-role filtering and detail lookup behavior.

**Authorization & Security:**
- Demo-auth gating and login-state UI behavior where applicable.
- Public route behavior and safe handling of user-facing inputs.
- Static asset exposure limited to intended public files.
- Mark as `Technique: N/A - no auth boundary in scope` when a feature has no meaningful auth/security branch.

---

## Test Design Techniques (Mandatory)

When generating test cases, explicitly apply the following techniques:
- Equivalence Partitioning
- Boundary Value Analysis
- Decision Tables
- Error Guessing
- Risk Based Testing
- Use Case Testing

### How To Apply Per Technique

**Equivalence Partitioning:**
- Identify valid and invalid input classes for requests, template variables, mapped API payloads, config flags, and fallback data.
- Add representative tests for each partition rather than redundant values.

**Boundary Value Analysis:**
- Include min-1, min, min+1 and max-1, max, max+1 where numeric or list boundaries are defined.
- For string/date/template constraints, include empty, just-inside, and just-outside boundaries.

**Decision Tables:**
- For multi-condition logic such as fallback enabled + API availability + role status, derive combinations and expected outcomes.
- Cover each decision rule at least once with clear expected status, rendered state, or mapped output.

**Error Guessing:**
- Add tests for realistic mistakes and malformed inputs based on implementation patterns.
- Include missing route params, malformed API payloads, absent template fields, unexpected types, and null/undefined values.

**Risk Based Testing:**
- Prioritize high-impact and high-likelihood risks first, especially route availability, user-facing rendering, critical asset serving, and job-role listing/detail behavior.
- Mark highest-priority tests as Smoke where appropriate.

**Use Case Testing:**
- Derive end-to-end user journeys and alternate flows from feature behavior.
- Include successful primary flow and at least one alternative or failure flow per major use case.

### Technique Coverage Rules

- For Feature and Full Regression suites: include at least one test case per listed technique.
- For Sanity suites: apply Risk Based Testing and Use Case Testing as mandatory; include Decision Tables where fallback/config branching is touched.
- For Smoke suites: apply Risk Based Testing and Use Case Testing as mandatory; include other techniques where practical.
- Record the applied technique in the `Test Data` field using `Technique: <name>` for traceability.
- If a technique is not applicable, state `Technique: N/A - <reason>` in at least one relevant row.

---

## Test Plan Re-Evaluation Workflow

Use this step-by-step process whenever the codebase changes and test plans may be outdated.

### Re-Evaluation Triggers

Re-evaluate test plans when any of the following occurs:
- A new route, controller, service, mapper, model, template, static asset, or config flag is added.
- Existing logic, rendering rules, demo-auth behavior, fallback behavior, or error handling changes.
- Public path resolution, asset copying, or API integration contracts change.
- A defect is found that indicates a missing or weak test case.

### Step-By-Step Re-Evaluation Plan

1. Confirm scope and suite strategy.
- Ask whether the update is Sanity, Smoke, Feature, or Full Regression.
- Ask whether output should be split or consolidated.

2. Detect and map code changes.
- Compare changed files and identify impacted modules in `src/`, `public/`, and `test/`.
- Classify each impacted area by type: route, controller, service, mapper, model, template, config, mock data, static asset, or infrastructure.

3. Build an impact matrix.
- Map each code change to affected behaviors, inputs, outputs, rendering contracts, and risks.
- Mark risk level as High, Medium, or Low based on user impact, failure likelihood, and visibility.

4. Re-apply test design techniques.
- Re-run Equivalence Partitioning, Boundary Value Analysis, Decision Tables, Error Guessing, Risk Based Testing, and Use Case Testing against changed areas.
- Add new cases where coverage gaps are found.
- Retire or de-prioritize obsolete tests where behavior no longer exists.

5. Update CSV test plan rows.
- Preserve existing IDs where test intent is unchanged.
- Create new IDs only for net-new test intents.
- Update Title, Test Type, Test Suite Type, Preconditions, Test Steps, Expected Results, and Test Data as needed.
- Ensure Test Data includes `Technique: <name>` for each row.

6. Validate quality gates.
- Verify all changed logic paths are covered by at least one relevant test.
- Verify high-risk paths are represented in Sanity/Smoke or top-priority Feature coverage.
- Verify rendering, fallback, and validation changes include negative and boundary tests.

7. Validate organization and consistency.
- If split output is selected, ensure each file uses identical schema and clear category naming.
- Ensure IDs remain unique across generated files where possible.
- Ensure no duplicate rows with identical intent and steps.

8. Validate CSV structure and field integrity.
- Verify exact header match: `ID,Title,Test Type,Test Suite Type,Preconditions,Test Steps,Expected Results,Actual Results,Test Data`.
- Verify every row has exactly 9 columns when parsed as CSV.
- Verify `Technique:` appears only inside `Test Data` and nowhere else.

9. Produce re-evaluation summary.
- Provide a concise delta report with: added tests, updated tests, removed tests, and residual risks.
- Call out any assumptions or unknowns that may require user confirmation.

### Re-Evaluation Output Checklist

Before finalizing updated test plans, confirm:
- Suite type and split preference were confirmed.
- Impacted modules were identified and mapped.
- All six design techniques were re-applied.
- High-risk changes received prioritized Sanity/Smoke coverage.
- CSV schema is valid and consistent in all output files.
- Every row parses to exactly 9 columns; no trailing out-of-column metadata exists.
- Summary of changes and residual risk is included.

---

## Split Recommendation Guidance

When asking about splitting output, include this rationale in concise form:
- Improves ownership by allowing teams to own specific suites.
- Speeds targeted execution for impacted areas.
- Reduces triage time by grouping failures by domain.
- Lowers merge conflicts compared with one large CSV.
- Maintains scalability as new features are added.

If user selects split output, also ask for preferred categories if not obvious:
- "Which categories do you want (for example job-roles, login, views, static-assets, or infrastructure)?"

If user selects non-split output:
- Generate one consolidated CSV and include all selected coverage scope.

---

## Example CSV Output

```csv
ID,Title,Test Type,Test Suite Type,Preconditions,Test Steps,Expected Results,Actual Results,Test Data
TC-001,Home page renders branded shell,Happy Path,Smoke,Application is running with views and public assets available,1. Send GET request to /; 2. Inspect the HTML response; 3. Verify branded header,Returns 200 OK; Returns HTML; Includes branding stylesheet and auth action link,,"Input: GET /; Expected: branded home markup; Technique: Use Case Testing"
TC-002,Job role list excludes closed roles from the rendered list,Unhappy Path,Feature,Job role service receives open and closed roles,1. Prepare role data containing open and closed statuses; 2. Render or request the job role list path; 3. Inspect the visible roles,Only open roles are shown in the list,,"Input: open and closed role fixtures; Expected: closed role excluded; Technique: Decision Tables"
TC-003,Job role service falls back to mock data when fallback mode is enabled,Happy Path,Feature,`USE_JOB_ROLE_FALLBACK_MOCK=true` or equivalent service setup is enabled,1. Enable fallback mode; 2. Execute the job role list flow; 3. Inspect the returned roles,Returns fallback open roles without calling the upstream API,,"Input: fallback role fixtures; Flag: USE_JOB_ROLE_FALLBACK_MOCK=true; Technique: Risk Based Testing"
TC-004,Login page renders the branded contract when demo auth is disabled,Data Validation,Full Regression,Views are available and demo auth state is known,1. Render or request /login; 2. Inspect the response body; 3. Verify required markup fragments,Returns the branded login page with email and password inputs and login error placeholder,,"Input: demoAuthEnabled=false; Expected markup: data-login-form and branding assets; Technique: Equivalence Partitioning"
TC-005,Missing job role ID returns friendly not-found behavior,Error Handling,Full Regression,Application is running and the requested role does not exist,1. Send GET request to the job role detail route with a missing ID; 2. Inspect status and body; 3. Verify the failure state,Returns the expected not-found or friendly failure response without crashing the render path,,"Input: nonexistent role id; Expected: friendly failure state; Technique: Error Guessing"
TC-006,Static branding assets are served from public paths,Happy Path,Sanity,Application is running with public assets available,1. Request /styles/branding.css; 2. Request /scripts/auth.js; 3. Request the logo image path,Each asset returns 200 and the correct content type,,"Input: GET /styles/branding.css; GET /scripts/auth.js; GET /images/kainoslogo.png; Technique: Boundary Value Analysis"
```