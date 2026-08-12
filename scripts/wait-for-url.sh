#!/usr/bin/env bash
# wait-for-url.sh URL TIMEOUT_SECONDS
set -euo pipefail
URL="${1:?url required}"
TIMEOUT="${2:-120}"
end=$((SECONDS + TIMEOUT))
while (( SECONDS < end )); do
  code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 5 "$URL" 2>/dev/null || echo 000)"
  if [[ "$code" == "200" || "$code" == "301" || "$code" == "302" ]]; then
    echo "OK $URL ($code)"
    exit 0
  fi
  sleep 2
done
echo "TIMEOUT waiting for $URL"
exit 1
