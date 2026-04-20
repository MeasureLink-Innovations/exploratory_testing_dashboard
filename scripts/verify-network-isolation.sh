#!/usr/bin/env bash
set -euo pipefail

FRONTEND_URL="${FRONTEND_URL:-http://localhost:4200}"
BACKEND_URL="${BACKEND_URL:-http://localhost:3000/health}"

pass() { echo "✅ $1"; }
fail() { echo "❌ $1"; exit 1; }

command -v docker >/dev/null 2>&1 || fail "docker is required"
command -v curl >/dev/null 2>&1 || fail "curl is required"

echo "Verifying Docker network exposure..."

if ! docker compose ps --services --status running | grep -q '^frontend$'; then
  fail "frontend container is not running. Start stack first: docker compose up -d --build"
fi

if docker compose port backend 3000 >/dev/null 2>&1; then
  fail "backend is published to host (expected hidden)"
else
  pass "backend is NOT published to host"
fi

if docker compose port db 5432 >/dev/null 2>&1; then
  fail "database is published to host (expected hidden)"
else
  pass "database is NOT published to host"
fi

if curl -fsS --max-time 10 "$FRONTEND_URL" >/dev/null; then
  pass "frontend is reachable at $FRONTEND_URL"
else
  fail "frontend is not reachable at $FRONTEND_URL"
fi

if curl -fsS --max-time 3 "$BACKEND_URL" >/dev/null 2>&1; then
  fail "backend is reachable from host at $BACKEND_URL (expected blocked)"
else
  pass "backend is NOT reachable from host at $BACKEND_URL"
fi

echo "\nAll checks passed. Frontend is public; backend + database are internal only."
