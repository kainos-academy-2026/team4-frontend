#!/usr/bin/env bash
set -euo pipefail

# Builds and pushes both hybrid runtime modes:
# - prod deps image: <version>-prod-deps
# - dev deps image:  <version>-dev-deps

ACR_NAME="${ACR_NAME:-}"
REPOSITORY="${REPOSITORY:-team4-frontend}"
VERSION="${VERSION:-}"
DOCKERFILE="${DOCKERFILE:-Dockerfile}"
CONTEXT_DIR="${CONTEXT_DIR:-.}"
VERIFY_PUSH="${VERIFY_PUSH:-true}"
USE_BUILDX_CACHE="${USE_BUILDX_CACHE:-true}"
BUILDX_CACHE_REF="${BUILDX_CACHE_REF:-}"

if [[ -z "$ACR_NAME" ]]; then
  echo "ERROR: ACR_NAME is required"
  echo "Example: ACR_NAME=acraiacademy26 VERSION=1.2.50 $0"
  exit 1
fi

if [[ -z "$VERSION" ]]; then
  echo "ERROR: VERSION is required"
  echo "Example: ACR_NAME=acraiacademy26 VERSION=1.2.50 $0"
  exit 1
fi

if [[ -z "$BUILDX_CACHE_REF" ]]; then
  BUILDX_CACHE_REF="${ACR_NAME}.azurecr.io/${REPOSITORY}:buildcache"
fi

REGISTRY="${ACR_NAME}.azurecr.io"
IMAGE_BASE="${REGISTRY}/${REPOSITORY}"
PROD_TAG="${VERSION}-prod-deps"
DEV_TAG="${VERSION}-dev-deps"
PROD_IMAGE="${IMAGE_BASE}:${PROD_TAG}"
DEV_IMAGE="${IMAGE_BASE}:${DEV_TAG}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "ERROR: required command not found: $1"
    exit 1
  fi
}

require_cmd docker
require_cmd az

echo "Logging into ACR: ${ACR_NAME}"
az acr login --name "$ACR_NAME" >/dev/null

build_and_push() {
  local image="$1"
  local include_dev_deps="$2"

  echo "Building and pushing: ${image} (INCLUDE_DEV_DEPS=${include_dev_deps})"

  if [[ "$USE_BUILDX_CACHE" == "true" ]] && docker buildx version >/dev/null 2>&1; then
    docker buildx build \
      --file "$DOCKERFILE" \
      --build-arg "INCLUDE_DEV_DEPS=${include_dev_deps}" \
      --cache-from "type=registry,ref=${BUILDX_CACHE_REF}" \
      --cache-to "type=registry,ref=${BUILDX_CACHE_REF},mode=max" \
      --tag "$image" \
      --push \
      "$CONTEXT_DIR"
  else
    docker build \
      --file "$DOCKERFILE" \
      --build-arg "INCLUDE_DEV_DEPS=${include_dev_deps}" \
      --tag "$image" \
      "$CONTEXT_DIR"
    docker push "$image"
  fi
}

build_and_push "$PROD_IMAGE" false
build_and_push "$DEV_IMAGE" true

if [[ "$VERIFY_PUSH" == "true" ]]; then
  echo "Verifying pushed tags exist in ACR"
  az acr repository show-tags \
    --name "$ACR_NAME" \
    --repository "$REPOSITORY" \
    --output tsv | grep -Fx "$PROD_TAG" >/dev/null

  az acr repository show-tags \
    --name "$ACR_NAME" \
    --repository "$REPOSITORY" \
    --output tsv | grep -Fx "$DEV_TAG" >/dev/null

  echo "Verification passed for tags: ${PROD_TAG}, ${DEV_TAG}"
fi

echo "Done"
echo "  PROD: ${PROD_IMAGE}"
echo "  DEV : ${DEV_IMAGE}"
