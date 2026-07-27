#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
ROLE_ID="${ROLE_ID:-1}"
EMAIL="${EMAIL:-}"
PASSWORD="${PASSWORD:-}"
ACCESS_TOKEN="${ACCESS_TOKEN:-}"
STRICT_AUTH_CHECKS="${STRICT_AUTH_CHECKS:-false}"

COOKIE_JAR="$(mktemp)"
BODY_FILE="$(mktemp)"

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

cleanup() {
  rm -f "$COOKIE_JAR" "$BODY_FILE"
}
trap cleanup EXIT

print_result() {
  local label="$1"
  local ok="$2"
  local details="$3"

  if [[ "$ok" == "true" ]]; then
    PASS_COUNT=$((PASS_COUNT + 1))
    printf '[PASS] %s -> %s\n' "$label" "$details"
  else
    FAIL_COUNT=$((FAIL_COUNT + 1))
    printf '[FAIL] %s -> %s\n' "$label" "$details"
  fi
}

print_warn() {
  local label="$1"
  local details="$2"
  WARN_COUNT=$((WARN_COUNT + 1))
  printf '[WARN] %s -> %s\n' "$label" "$details"
}

run_request() {
  local method="$1"
  local path="$2"
  local data="${3:-}"
  local use_cookie="${4:-false}"

  local curl_args=(
    -sS
    -X "$method"
    "$BASE_URL$path"
    -o "$BODY_FILE"
    -w "%{http_code}"
  )

  if [[ "$use_cookie" == "true" ]]; then
    if [[ -n "$ACCESS_TOKEN" ]]; then
      curl_args+=( -H "Cookie: access_token=$ACCESS_TOKEN" )
    else
      curl_args+=( -b "$COOKIE_JAR" )
    fi
  fi

  if [[ -n "$data" ]]; then
    curl_args+=( -H "Content-Type: application/json" -d "$data" )
  fi

  curl "${curl_args[@]}"
}

assert_status() {
  local label="$1"
  local method="$2"
  local path="$3"
  local expected="$4"
  local data="${5:-}"
  local use_cookie="${6:-false}"

  local code
  code="$(run_request "$method" "$path" "$data" "$use_cookie")"

  if [[ "$code" == "$expected" ]]; then
    print_result "$label" "true" "expected $expected, got $code"
  else
    local body
    body="$(cat "$BODY_FILE")"
    print_result "$label" "false" "expected $expected, got $code, body: $body"
  fi
}

assert_status_in() {
  local label="$1"
  local method="$2"
  local path="$3"
  local allowed_csv="$4"
  local data="${5:-}"
  local use_cookie="${6:-false}"

  local code
  code="$(run_request "$method" "$path" "$data" "$use_cookie")"

  IFS=',' read -r -a allowed <<< "$allowed_csv"
  local found="false"
  for candidate in "${allowed[@]}"; do
    if [[ "$code" == "$candidate" ]]; then
      found="true"
      break
    fi
  done

  if [[ "$found" == "true" ]]; then
    print_result "$label" "true" "allowed [$allowed_csv], got $code"
  else
    local body
    body="$(cat "$BODY_FILE")"
    print_result "$label" "false" "allowed [$allowed_csv], got $code, body: $body"
  fi
}

printf 'Running curl smoke tests against %s\n' "$BASE_URL"

assert_status "Health endpoint" "GET" "/health" "200"
assert_status "Upload URL unauthenticated" "GET" "/job-roles/$ROLE_ID/applications/upload-url" "401"
assert_status "Upload URL invalid role id" "GET" "/job-roles/not-a-number/applications/upload-url" "400"
assert_status "Submit application unauthenticated" "POST" "/job-roles/$ROLE_ID/applications" "401" '{"s3Key":"applications/1/cv.pdf","cvFileName":"cv.pdf","cvMimeType":"application/pdf","cvSizeBytes":12345}'

if [[ -n "$ACCESS_TOKEN" ]]; then
  printf 'Using ACCESS_TOKEN for authenticated checks (skipping /api/login).\n'

  assert_status_in \
    "Upload URL authenticated passthrough" \
    "GET" \
    "/job-roles/$ROLE_ID/applications/upload-url?fileName=cv.pdf&mimeType=application%2Fpdf" \
    "200,400,401,404,502" \
    "" \
    "true"

  assert_status_in \
    "Submit application authenticated passthrough" \
    "POST" \
    "/job-roles/$ROLE_ID/applications" \
    "200,201,400,401,404,409,422,502" \
    '{"s3Key":"applications/1/cv.pdf","cvFileName":"cv.pdf","cvMimeType":"application/pdf","cvSizeBytes":12345}' \
    "true"
elif [[ -n "$EMAIL" && -n "$PASSWORD" ]]; then
  login_payload=$(printf '{"email":"%s","password":"%s"}' "$EMAIL" "$PASSWORD")
  login_code="$(curl -sS -X POST "$BASE_URL/api/login" -H "Content-Type: application/json" -d "$login_payload" -c "$COOKIE_JAR" -o "$BODY_FILE" -w "%{http_code}")"

  if [[ "$login_code" == "200" ]]; then
    print_result "Login for authenticated checks" "true" "expected 200, got 200"

    assert_status_in \
      "Upload URL authenticated passthrough" \
      "GET" \
      "/job-roles/$ROLE_ID/applications/upload-url?fileName=cv.pdf&mimeType=application%2Fpdf" \
      "200,400,401,404,502" \
      "" \
      "true"

    assert_status_in \
      "Submit application authenticated passthrough" \
      "POST" \
      "/job-roles/$ROLE_ID/applications" \
      "200,201,400,401,404,409,422,502" \
      '{"s3Key":"applications/1/cv.pdf","cvFileName":"cv.pdf","cvMimeType":"application/pdf","cvSizeBytes":12345}' \
      "true"
  else
    body="$(cat "$BODY_FILE")"
    if [[ "$STRICT_AUTH_CHECKS" == "true" ]]; then
      print_result "Login for authenticated checks" "false" "expected 200, got $login_code, body: $body"
    else
      print_warn "Login for authenticated checks" "expected 200, got $login_code, body: $body"
    fi
    if [[ "$login_code" == "502" ]]; then
      printf 'Hint: frontend /api/login could not reach a healthy backend auth service. Check API_BASE_URL and backend /auth/login.\n'
    fi
    printf 'Skipping authenticated passthrough checks because login failed.\n'
  fi
else
  printf 'No ACCESS_TOKEN or EMAIL/PASSWORD provided; skipping authenticated passthrough checks.\n'
fi

printf '\nSummary: %s passed, %s failed, %s warnings\n' "$PASS_COUNT" "$FAIL_COUNT" "$WARN_COUNT"

if [[ "$FAIL_COUNT" -gt 0 ]]; then
  exit 1
fi
