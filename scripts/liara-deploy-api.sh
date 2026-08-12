#!/usr/bin/env bash
# Shim — prefer the interactive ops console.
# Kept for muscle memory / older docs that call this script.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
exec "$ROOT/scripts/gandom-liara.sh" deploy:api "$@"
