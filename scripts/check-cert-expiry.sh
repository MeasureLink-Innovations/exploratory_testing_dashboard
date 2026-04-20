#!/usr/bin/env bash
set -euo pipefail

CERT_PATH="${1:-${CERT_PATH:-certs/fullchain.pem}}"
WARNING_DAYS="${WARNING_DAYS:-30}"
CRITICAL_DAYS="${CRITICAL_DAYS:-14}"
URGENT_DAYS="${URGENT_DAYS:-7}"

if [[ ! -f "$CERT_PATH" ]]; then
  echo "CRITICAL: certificate file not found at '$CERT_PATH'"
  exit 2
fi

not_after=$(openssl x509 -in "$CERT_PATH" -noout -enddate | cut -d= -f2)
expiry_epoch=$(date -d "$not_after" +%s)
now_epoch=$(date +%s)
days_left=$(( (expiry_epoch - now_epoch) / 86400 ))

echo "Certificate: $CERT_PATH"
echo "Expires: $not_after (${days_left} days left)"

if (( days_left <= URGENT_DAYS )); then
  echo "CRITICAL: certificate expires in <= ${URGENT_DAYS} days"
  exit 2
fi

if (( days_left <= CRITICAL_DAYS )); then
  echo "HIGH: certificate expires in <= ${CRITICAL_DAYS} days"
  exit 1
fi

if (( days_left <= WARNING_DAYS )); then
  echo "WARN: certificate expires in <= ${WARNING_DAYS} days"
  exit 1
fi

echo "OK: certificate validity is above warning threshold"
