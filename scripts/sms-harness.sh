#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "[sms-harness] Starting stack if needed..."
docker compose up -d postgres strapi frontend 2>/dev/null || docker compose up -d postgres strapi 2>/dev/null || true

"$ROOT/scripts/wait-for-url.sh" "http://localhost:1337/api/store-setting" 180

echo "[sms-harness] Installing test deps..."
cd "$ROOT/tests/payment-harness"
npm ci --silent 2>/dev/null || npm install --silent

export SMS_TEST_MOBILE="${SMS_TEST_MOBILE:-09366531567}"

# Load live key from backend/.env if present (not committed)
if [[ -f "$ROOT/backend/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source <(grep -E '^SMSIR_API_KEY_LIVE=|^SMS_LINE_NUMBER=|^SMS_TEST_MOBILE=|^ADMIN_MOBILE=' "$ROOT/backend/.env" || true)
  set +a
fi

echo "[sms-harness] Running dev SMS integration tests..."
npm run test:sms

if [[ "${RUN_SMS_SANDBOX:-}" == "1" ]]; then
  echo ""
  echo "[sms-harness] ⚠  SANDBOX: SMS.ir simulates API success only."
  echo "[sms-harness]    Messages do NOT appear in your SMS.ir dashboard or on your phone."
  echo "[sms-harness]    Use RUN_SMS_LIVE=1 with SMSIR_API_KEY_LIVE for real dashboard sends."
  echo ""
  npm run test:sms:sandbox
fi

if [[ "${RUN_SMS_LIVE:-}" == "1" ]]; then
  if [[ -z "${SMSIR_API_KEY_LIVE:-}" ]]; then
    echo "[sms-harness] ERROR: RUN_SMS_LIVE=1 requires SMSIR_API_KEY_LIVE in backend/.env"
    echo "[sms-harness] Add: SMSIR_API_KEY_LIVE=your_production_api_key"
    exit 1
  fi
  echo ""
  echo "[sms-harness] LIVE mode: sending all event types to ${SMS_TEST_MOBILE} (visible in SMS.ir panel)"
  echo ""
  export SMSIR_API_KEY_LIVE
  npm run test:sms:live
fi

if [[ "${RUN_SMS_SANDBOX:-}" == "1" || "${RUN_SMS_LIVE:-}" == "1" ]]; then
  if [[ "${SKIP_SMS_E2E:-}" == "1" ]]; then
    echo "[sms-harness] Skipping E2E (SKIP_SMS_E2E=1)"
  else
    echo "[sms-harness] Installing Playwright Chromium (if needed)..."
    npx playwright install chromium 2>/dev/null || true
    echo "[sms-harness] Running SMS E2E tests..."
    npm run test:e2e:sms || {
      echo "[sms-harness] E2E failed (often missing Playwright browser). Run: cd tests/payment-harness && npx playwright install chromium"
      exit 1
    }
  fi
else
  echo "[sms-harness] Skipping sandbox/live (set RUN_SMS_SANDBOX=1 or RUN_SMS_LIVE=1)"
fi

echo "[sms-harness] ALL GREEN"
