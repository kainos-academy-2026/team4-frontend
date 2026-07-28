#!/usr/bin/env bash
set -euo pipefail

# Benchmarks a prod/dev hybrid image pair from ACR and appends one CSV row.
# Expected tags: <version>-prod-deps and <version>-dev-deps

ACR_NAME="${ACR_NAME:-}"
REPOSITORY="${REPOSITORY:-team4-frontend}"
VERSION="${VERSION:-}"
CSV_FILE="${CSV_FILE:-scripts/image-metrics.csv}"
BASE_PORT="${BASE_PORT:-4310}"

if [[ -z "$ACR_NAME" ]]; then
  echo "ERROR: ACR_NAME is required"
  echo "Example: ACR_NAME=acraiacademy26 VERSION=1.2.50 $0"
  exit 1
fi

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "ERROR: required command not found: $1"
    exit 1
  fi
}

require_cmd docker
require_cmd az
require_cmd curl
require_cmd awk

if [[ -z "$VERSION" ]]; then
  # Auto-detect latest prod-deps tag and derive version prefix.
  latest_prod_tag=$(az acr repository show-tags \
    --name "$ACR_NAME" \
    --repository "$REPOSITORY" \
    --orderby time_desc \
    --output tsv | grep -- '-prod-deps$' | head -n 1 || true)

  if [[ -z "$latest_prod_tag" ]]; then
    echo "ERROR: Could not auto-detect latest -prod-deps tag. Set VERSION explicitly."
    exit 1
  fi

  VERSION="${latest_prod_tag%-prod-deps}"
fi

REGISTRY="${ACR_NAME}.azurecr.io"
PROD_IMAGE="${REGISTRY}/${REPOSITORY}:${VERSION}-prod-deps"
DEV_IMAGE="${REGISTRY}/${REPOSITORY}:${VERSION}-dev-deps"

now() {
  python3 - <<'PY'
import time
print(f"{time.time():.6f}")
PY
}

elapsed() {
  python3 - <<PY
s=float('$1')
e=float('$2')
print(f"{(e-s):.3f}")
PY
}

to_mb() {
  awk -v b="$1" 'BEGIN{printf "%.3f", b/1024/1024}'
}

pull_time() {
  local image="$1"
  local start end
  start=$(now)
  docker pull "$image" >/dev/null
  end=$(now)
  elapsed "$start" "$end"
}

health_time() {
  local label="$1"
  local image="$2"
  local port="$3"
  local cname="bench-${label}"
  local start end

  docker rm -f "$cname" >/dev/null 2>&1 || true

  start=$(now)
  docker run -d --name "$cname" -p "${port}:3000" -e API_BASE_URL=http://host.docker.internal:3000 "$image" >/dev/null
  for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
    if curl -fsS "http://localhost:${port}/health" >/dev/null 2>&1; then
      break
    fi
    sleep 0.2
  done
  end=$(now)

  docker rm -f "$cname" >/dev/null 2>&1 || true
  elapsed "$start" "$end"
}

idle_usage() {
  local label="$1"
  local image="$2"
  local port="$3"
  local cname="idle-${label}"

  docker rm -f "$cname" >/dev/null 2>&1 || true
  docker run -d --name "$cname" -p "${port}:3000" -e API_BASE_URL=http://host.docker.internal:3000 "$image" >/dev/null

  for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
    if curl -fsS "http://localhost:${port}/health" >/dev/null 2>&1; then
      break
    fi
    sleep 0.2
  done

  usage=$(docker stats --no-stream --format '{{.CPUPerc}}|{{.MemUsage}}' "$cname")
  docker rm -f "$cname" >/dev/null 2>&1 || true
  echo "$usage"
}

mkdir -p "$(dirname "$CSV_FILE")"
if [[ ! -f "$CSV_FILE" ]]; then
  echo "timestamp,acr_name,repository,version,prod_image,dev_image,pull_prod_s,pull_dev_s,health_prod_s,health_dev_s,size_prod_mb,size_dev_mb,size_delta_mb,layers_prod,layers_dev,idle_prod,idle_dev" > "$CSV_FILE"
fi

echo "Pulling and benchmarking:"
echo "  PROD: $PROD_IMAGE"
echo "  DEV : $DEV_IMAGE"

pull_prod_s=$(pull_time "$PROD_IMAGE")
pull_dev_s=$(pull_time "$DEV_IMAGE")

health_prod_s=$(health_time prod "$PROD_IMAGE" "$BASE_PORT")
health_dev_s=$(health_time dev "$DEV_IMAGE" "$((BASE_PORT + 1))")

size_prod_bytes=$(docker image inspect "$PROD_IMAGE" --format '{{.Size}}')
size_dev_bytes=$(docker image inspect "$DEV_IMAGE" --format '{{.Size}}')

size_prod_mb=$(to_mb "$size_prod_bytes")
size_dev_mb=$(to_mb "$size_dev_bytes")
size_delta_mb=$(awk -v d="$size_dev_mb" -v p="$size_prod_mb" 'BEGIN{printf "%.3f", d-p}')

layers_prod=$(docker history "$PROD_IMAGE" --no-trunc | tail -n +2 | wc -l | tr -d ' ')
layers_dev=$(docker history "$DEV_IMAGE" --no-trunc | tail -n +2 | wc -l | tr -d ' ')

idle_prod=$(idle_usage prod "$PROD_IMAGE" "$((BASE_PORT + 2))")
idle_dev=$(idle_usage dev "$DEV_IMAGE" "$((BASE_PORT + 3))")

timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "${timestamp},${ACR_NAME},${REPOSITORY},${VERSION},${PROD_IMAGE},${DEV_IMAGE},${pull_prod_s},${pull_dev_s},${health_prod_s},${health_dev_s},${size_prod_mb},${size_dev_mb},${size_delta_mb},${layers_prod},${layers_dev},${idle_prod},${idle_dev}" >> "$CSV_FILE"

echo "Benchmark row appended to ${CSV_FILE}"
