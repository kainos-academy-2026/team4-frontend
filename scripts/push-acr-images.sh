#!/usr/bin/env bash

set -euo pipefail

# Build and push both production and development-dependencies image variants to Azure ACR.
# Required environment variables:
#   ACR_NAME   e.g. acraiacademy26
#   VERSION    e.g. 1.2.0
# Optional environment variables:
#   REPOSITORY       default: team4-frontend
#   VERIFY_AFTER_PUSH  default: true (true/false)
#   API_BASE_URL     default: http://host.docker.internal:3000
#   PROD_PORT        default: 3011
#   DEV_PORT         default: 3012

: "${ACR_NAME:?ACR_NAME is required (e.g. acraiacademy26)}"
: "${VERSION:?VERSION is required (e.g. 1.2.0)}"

REPOSITORY="${REPOSITORY:-team4-frontend}"
VERIFY_AFTER_PUSH="${VERIFY_AFTER_PUSH:-true}"
API_BASE_URL="${API_BASE_URL:-http://host.docker.internal:3000}"
PROD_PORT="${PROD_PORT:-3011}"
DEV_PORT="${DEV_PORT:-3012}"

PROD_TAG="${VERSION}-prod-deps"
DEV_TAG="${VERSION}-dev-deps"
PROD_IMAGE="${ACR_NAME}.azurecr.io/${REPOSITORY}:${PROD_TAG}"
DEV_IMAGE="${ACR_NAME}.azurecr.io/${REPOSITORY}:${DEV_TAG}"

check_command() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "ERROR: Required command not found: $cmd" >&2
    exit 1
  fi
}

cleanup_container() {
  local name="$1"
  docker rm -f "$name" >/dev/null 2>&1 || true
}

verify_image() {
  local image="$1"
  local container_name="$2"
  local port="$3"

  cleanup_container "$container_name"

  docker run -d \
    --name "$container_name" \
    -p "${port}:3000" \
    -e "API_BASE_URL=${API_BASE_URL}" \
    "$image" >/dev/null

  curl -fsS --retry 12 --retry-all-errors --retry-connrefused --retry-delay 1 "http://localhost:${port}/health" >/dev/null

  local runtime_user
  runtime_user=$(docker exec "$container_name" sh -c 'id -un')
  if [ "$runtime_user" != "appuser" ]; then
    echo "ERROR: Expected runtime user appuser, got ${runtime_user}" >&2
    cleanup_container "$container_name"
    exit 1
  fi

  cleanup_container "$container_name"
}

check_command az
check_command docker
check_command curl

if ! az account show >/dev/null 2>&1; then
  echo "ERROR: Azure CLI is not logged in. Run: az login" >&2
  exit 1
fi

echo "Logging into Azure Container Registry: ${ACR_NAME}"
az acr login --name "$ACR_NAME" >/dev/null

echo "Building production image: ${PROD_IMAGE}"
docker build -t "$PROD_IMAGE" .

echo "Building development-dependencies image: ${DEV_IMAGE}"
docker build --build-arg INCLUDE_DEV_DEPS=true -t "$DEV_IMAGE" .

echo "Pushing production image"
docker push "$PROD_IMAGE"

echo "Pushing development-dependencies image"
docker push "$DEV_IMAGE"

echo "Verifying pushed tags exist in ACR"
TAGS=$(az acr repository show-tags --name "$ACR_NAME" --repository "$REPOSITORY" --output tsv)

if ! echo "$TAGS" | grep -Fxq "$PROD_TAG"; then
  echo "ERROR: Missing pushed production tag: ${PROD_TAG}" >&2
  exit 1
fi

if ! echo "$TAGS" | grep -Fxq "$DEV_TAG"; then
  echo "ERROR: Missing pushed development tag: ${DEV_TAG}" >&2
  exit 1
fi

if [ "$VERIFY_AFTER_PUSH" = "true" ]; then
  echo "Pulling both images from ACR for runtime verification"
  docker pull "$PROD_IMAGE" >/dev/null
  docker pull "$DEV_IMAGE" >/dev/null

  echo "Verifying production image runtime behavior"
  verify_image "$PROD_IMAGE" "${REPOSITORY}-acr-prod-verify" "$PROD_PORT"

  echo "Verifying development-dependencies image runtime behavior"
  verify_image "$DEV_IMAGE" "${REPOSITORY}-acr-dev-verify" "$DEV_PORT"
fi

echo "Success"
echo "  Production tag: ${PROD_IMAGE}"
echo "  Development tag: ${DEV_IMAGE}"
