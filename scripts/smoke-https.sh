#!/usr/bin/env bash
set -euo pipefail

BASE_HOST="${BASE_HOST:-localhost}"
HTTP_URL="${HTTP_URL:-http://${BASE_HOST}}"
HTTPS_URL="${HTTPS_URL:-https://${BASE_HOST}}"
HEALTH_PATH="${HEALTH_PATH:-/health}"
CURL_INSECURE="${CURL_INSECURE:--k}"

printf "[1/5] Checking HTTP -> HTTPS redirect status...\n"
status_code=$(curl -sS -o /dev/null -w "%{http_code}" "${HTTP_URL}${HEALTH_PATH}")
if [[ "$status_code" != "308" ]]; then
  echo "Expected 308 redirect from ${HTTP_URL}${HEALTH_PATH}, got ${status_code}"
  exit 1
fi

printf "[2/5] Checking redirect location preserves path/query...\n"
location_header=$(curl -sSI "${HTTP_URL}${HEALTH_PATH}?probe=1" | awk -F': ' 'tolower($1)=="location" {print $2}' | tr -d '\r')
expected_prefix="${HTTPS_URL}${HEALTH_PATH}?probe=1"
if [[ "$location_header" != "$expected_prefix" ]]; then
  echo "Expected Location '${expected_prefix}', got '${location_header}'"
  exit 1
fi

printf "[3/5] Checking HTTPS health endpoint...\n"
https_status=$(curl ${CURL_INSECURE} -sS -o /dev/null -w "%{http_code}" "${HTTPS_URL}${HEALTH_PATH}")
if [[ "$https_status" != "200" ]]; then
  echo "Expected 200 from ${HTTPS_URL}${HEALTH_PATH}, got ${https_status}"
  exit 1
fi

printf "[4/5] Checking HSTS response header...\n"
hsts_header=$(curl ${CURL_INSECURE} -sSI "${HTTPS_URL}${HEALTH_PATH}" | awk -F': ' 'tolower($1)=="strict-transport-security" {print $2}' | tr -d '\r')
expected_hsts_header="${EXPECTED_HSTS_HEADER:-max-age=300}"
if [[ "$hsts_header" != "$expected_hsts_header" ]]; then
  echo "Expected Strict-Transport-Security '${expected_hsts_header}', got '${hsts_header}'"
  exit 1
fi

printf "[5/5] Checking no redirect loop when following redirects...\n"
final_url=$(curl ${CURL_INSECURE} -sS -L --max-redirs 3 -o /dev/null -w "%{url_effective}" "${HTTP_URL}${HEALTH_PATH}")
if [[ "$final_url" != "${HTTPS_URL}${HEALTH_PATH}" ]]; then
  echo "Expected final URL '${HTTPS_URL}${HEALTH_PATH}', got '${final_url}'"
  exit 1
fi

echo "HTTPS smoke checks passed."
