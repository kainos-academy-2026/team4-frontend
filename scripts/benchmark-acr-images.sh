#!/usr/bin/env bash

set -euo pipefail

# Benchmarks ACR image metrics for prod/dev tag pairs and writes a CSV report.
# Required environment variables:
#   ACR_NAME   e.g. acraiacademy26
# Optional environment variables:
#   REPOSITORY         default: team4-frontend
#   VERSION            if omitted, latest matching x.y.z-prod-deps/x.y.z-dev-deps pair is used
#   OUTPUT_CSV         default: ./scripts/image-metrics.csv
#   API_BASE_URL       default: http://host.docker.internal:3000
#   PROD_PORT          default: 3091
#   DEV_PORT           default: 3092
#   INCLUDE_TAG_COLD   default: true (true/false)

: "${ACR_NAME:?ACR_NAME is required (e.g. acraiacademy26)}"

REPOSITORY="${REPOSITORY:-team4-frontend}"
OUTPUT_CSV="${OUTPUT_CSV:-./scripts/image-metrics.csv}"
API_BASE_URL="${API_BASE_URL:-http://host.docker.internal:3000}"
PROD_PORT="${PROD_PORT:-3091}"
DEV_PORT="${DEV_PORT:-3092}"
INCLUDE_TAG_COLD="${INCLUDE_TAG_COLD:-true}"

check_command() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "ERROR: Required command not found: $cmd" >&2
    exit 1
  fi
}

check_command az
check_command docker
check_command curl
check_command python3

if ! az account show >/dev/null 2>&1; then
  echo "ERROR: Azure CLI is not logged in. Run: az login" >&2
  exit 1
fi

az acr login --name "$ACR_NAME" >/dev/null

resolve_version() {
  if [ -n "${VERSION:-}" ]; then
    echo "$VERSION"
    return
  fi

  local tags latest
  tags=$(az acr repository show-tags --name "$ACR_NAME" --repository "$REPOSITORY" --output tsv)
  latest=$(printf '%s\n' "$tags" \
    | sed -nE 's/^([0-9]+\.[0-9]+\.[0-9]+)-prod-deps$/\1/p' \
    | while read -r v; do
        if printf '%s\n' "$tags" | grep -Fxq "${v}-dev-deps"; then
          echo "$v"
        fi
      done \
    | sort -V \
    | tail -n1)

  if [ -z "${latest:-}" ]; then
    echo "ERROR: Could not find a matching version pair in ACR" >&2
    exit 1
  fi

  echo "$latest"
}

now_epoch() {
  python3 - <<'PY'
import time
print(f"{time.time():.6f}")
PY
}

elapsed_secs() {
  local start="$1"
  local end="$2"
  python3 - <<PY
s=float('$start'); e=float('$end')
print(f"{(e-s):.3f}")
PY
}

to_mb() {
  local bytes="$1"
  python3 - <<PY
print(f"{int('$bytes')/1024/1024:.3f}")
PY
}

cleanup_container() {
  local name="$1"
  docker rm -f "$name" >/dev/null 2>&1 || true
}

time_pull() {
  local image="$1"
  local start end
  start=$(now_epoch)
  docker pull "$image" >/dev/null
  end=$(now_epoch)
  elapsed_secs "$start" "$end"
}

time_run_to_health() {
  local image="$1"
  local name="$2"
  local port="$3"
  local start end

  cleanup_container "$name"

  start=$(now_epoch)
  docker run -d --name "$name" -p "${port}:3000" -e "API_BASE_URL=${API_BASE_URL}" "$image" >/dev/null

  for _ in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
    if curl -fsS "http://localhost:${port}/health" >/dev/null 2>&1; then
      break
    fi
    sleep 0.2
  done

  end=$(now_epoch)
  cleanup_container "$name"

  elapsed_secs "$start" "$end"
}

idle_stats() {
  local image="$1"
  local name="$2"
  local port="$3"

  cleanup_container "$name"

  docker run -d --name "$name" -p "${port}:3000" -e "API_BASE_URL=${API_BASE_URL}" "$image" >/dev/null

  for _ in 1 2 3 4 5 6 7 8 9 10; do
    if curl -fsS "http://localhost:${port}/health" >/dev/null 2>&1; then
      break
    fi
    sleep 0.2
  done

  docker stats --no-stream --format '{{.CPUPerc}}|{{.MemUsage}}' "$name"
  cleanup_container "$name"
}

VERSION_RESOLVED=$(resolve_version)
PROD_IMAGE="${ACR_NAME}.azurecr.io/${REPOSITORY}:${VERSION_RESOLVED}-prod-deps"
DEV_IMAGE="${ACR_NAME}.azurecr.io/${REPOSITORY}:${VERSION_RESOLVED}-dev-deps"

PROD_PULL_CACHED=$(time_pull "$PROD_IMAGE")
DEV_PULL_CACHED=$(time_pull "$DEV_IMAGE")

PROD_PULL_TAG_COLD=""
DEV_PULL_TAG_COLD=""
if [ "$INCLUDE_TAG_COLD" = "true" ]; then
  docker image rm -f "$PROD_IMAGE" >/dev/null 2>&1 || true
  PROD_PULL_TAG_COLD=$(time_pull "$PROD_IMAGE")

  docker image rm -f "$DEV_IMAGE" >/dev/null 2>&1 || true
  DEV_PULL_TAG_COLD=$(time_pull "$DEV_IMAGE")
fi

PROD_RUN_TO_HEALTH=$(time_run_to_health "$PROD_IMAGE" "team4-bench-prod" "$PROD_PORT")
DEV_RUN_TO_HEALTH=$(time_run_to_health "$DEV_IMAGE" "team4-bench-dev" "$DEV_PORT")

PROD_SIZE_BYTES=$(docker image inspect "$PROD_IMAGE" --format '{{.Size}}')
DEV_SIZE_BYTES=$(docker image inspect "$DEV_IMAGE" --format '{{.Size}}')
PROD_SIZE_MB=$(to_mb "$PROD_SIZE_BYTES")
DEV_SIZE_MB=$(to_mb "$DEV_SIZE_BYTES")
DEV_MINUS_PROD_SIZE_MB=$(python3 - <<PY
p=int('$PROD_SIZE_BYTES'); d=int('$DEV_SIZE_BYTES')
print(f"{(d-p)/1024/1024:.3f}")
PY
)

PROD_LAYER_COUNT=$(docker history "$PROD_IMAGE" --no-trunc | tail -n +2 | wc -l | tr -d ' ')
DEV_LAYER_COUNT=$(docker history "$DEV_IMAGE" --no-trunc | tail -n +2 | wc -l | tr -d ' ')

PROD_IDLE_STATS=$(idle_stats "$PROD_IMAGE" "team4-bench-prod-stats" "$PROD_PORT")
DEV_IDLE_STATS=$(idle_stats "$DEV_IMAGE" "team4-bench-dev-stats" "$DEV_PORT")

mkdir -p "$(dirname "$OUTPUT_CSV")"

if [ ! -f "$OUTPUT_CSV" ]; then
  echo "timestamp,acr_name,repository,version,prod_image,dev_image,prod_pull_cached_s,dev_pull_cached_s,prod_pull_tag_cold_s,dev_pull_tag_cold_s,prod_run_to_health_s,dev_run_to_health_s,prod_size_mb,dev_size_mb,dev_minus_prod_size_mb,prod_layer_count,dev_layer_count,prod_idle_stats,dev_idle_stats" > "$OUTPUT_CSV"
fi

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "${TIMESTAMP},${ACR_NAME},${REPOSITORY},${VERSION_RESOLVED},${PROD_IMAGE},${DEV_IMAGE},${PROD_PULL_CACHED},${DEV_PULL_CACHED},${PROD_PULL_TAG_COLD},${DEV_PULL_TAG_COLD},${PROD_RUN_TO_HEALTH},${DEV_RUN_TO_HEALTH},${PROD_SIZE_MB},${DEV_SIZE_MB},${DEV_MINUS_PROD_SIZE_MB},${PROD_LAYER_COUNT},${DEV_LAYER_COUNT},${PROD_IDLE_STATS},${DEV_IDLE_STATS}" >> "$OUTPUT_CSV"

echo "Wrote metrics to ${OUTPUT_CSV}"
echo "Version: ${VERSION_RESOLVED}"
