#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

STUB_PID=""
cleanup() {
  if [[ -n "$STUB_PID" ]]; then
    kill "$STUB_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

echo "[payment-harness] Starting stack if needed..."
docker compose up -d postgres strapi frontend 2>/dev/null || true

"$ROOT/scripts/wait-for-url.sh" "http://localhost:1337/api/store-setting" 180
"$ROOT/scripts/wait-for-url.sh" "http://localhost:5173/" 120

echo "[payment-harness] Starting Digipay stub..."
cd "$ROOT/tests/payment-harness"
npm ci --silent 2>/dev/null || npm install --silent

npx tsx lib/digipay-stub.ts &
STUB_PID=$!
sleep 1

echo "[payment-harness] Running integration tests..."
if docker ps --format '{{.Names}}' 2>/dev/null | grep -q gandom_strapi_dev; then
  GW="$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.Gateway}}{{end}}' gandom_strapi_dev 2>/dev/null || true)"
  if [[ -n "$GW" ]]; then
    export DIGIPAY_STUB_HOST="${DIGIPAY_STUB_HOST:-$GW}"
  fi
fi
export DIGIPAY_STUB_HOST="${DIGIPAY_STUB_HOST:-host.docker.internal}"
export DIGIPAY_STUB_PORT="${DIGIPAY_STUB_PORT:-9191}"
echo "[payment-harness] Digipay stub host for Strapi: $DIGIPAY_STUB_HOST:$DIGIPAY_STUB_PORT"
npm run test:integration

echo "[payment-harness] ALL GREEN"
