#!/usr/bin/env bash
# Prebuild Strapi admin and deploy gandom-api to Liara (basic plan ~5min timeout workaround).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TOKEN="${LIARA_TOKEN:-$(cat "$ROOT/liara")}"

cd "$ROOT/backend"
cp .gitignore .gitignore.liara-bak
sed -i '/^dist$/d' .gitignore
npm ci
npm run build

cd "$ROOT"
cleanup() {
  if [[ -f "$ROOT/backend/.gitignore.liara-bak" ]]; then
    mv "$ROOT/backend/.gitignore.liara-bak" "$ROOT/backend/.gitignore"
  fi
}
trap cleanup EXIT

liara deploy \
  --app=gandom-api \
  --api-token="$TOKEN" \
  --platform=docker \
  --port=1337 \
  --build-location=germany \
  --no-app-logs \
  "$@"
