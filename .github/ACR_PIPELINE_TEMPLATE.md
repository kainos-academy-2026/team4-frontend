# ACR Pipeline Configuration Template

Use this template to configure ACR publishing in the CI workflow.

## 1) Required GitHub Repository Variables

Add these in GitHub: Settings -> Secrets and variables -> Actions -> Variables.

- `ACR_NAME`: The Azure Container Registry name only.
  - Example: `acraiacademy26`

No separate `ACR_LOGIN_SERVER` or `ACR_REPOSITORY` variable is required:

- login server is derived as `<ACR_NAME>.azurecr.io`
- repository is derived from the image name created in CI (`team4-frontend`)

## 2) Required GitHub Repository Secret

Add this in GitHub: Settings -> Secrets and variables -> Actions -> Secrets.

- `AZURE_CLIENT_ID`: Service principal application (client) ID.
- `AZURE_CLIENT_SECRET`: Service principal client secret.
- `AZURE_TENANT_ID`: Azure tenant ID for the service principal.

The workflow maps these secrets to runtime shell variables used in login:

- `CLIENT_ID`
- `CLIENT_SECRET`
- `TENANT_ID`

## 3) Required Azure Permissions

The service principal referenced by these secrets should have at least:

- `AcrPush` role on the target ACR resource.

## 4) When Push Happens

The workflow pushes only when all earlier jobs pass and the event is:

- `push` to `main` or `master`

No image push occurs for pull requests or scheduled runs.

## 5) Preflight Checklist

- Confirm `ACR_NAME` is set.
- Confirm `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, and `AZURE_TENANT_ID` exist.
- Confirm the service principal has `AcrPush` on the target ACR.
- Confirm branch is `main` or `master` for publish behavior.
