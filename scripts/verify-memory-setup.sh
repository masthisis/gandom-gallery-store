#!/usr/bin/env bash
# Quick health check for Graphify + Headroom on this project.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== Graphify ==="
graphify --version
if [[ -f graphify-out/graph.json ]]; then
  nodes=$(python3 -c "import json; print(len(json.load(open('graphify-out/graph.json'))['nodes']))")
  echo "graph.json: ${nodes} nodes"
else
  echo "MISSING graphify-out/graph.json — run: graphify extract ."
  exit 1
fi
graphify hook status 2>&1 | sed 's/^/  /'
echo "  query smoke:"
graphify query "auth OTP flow" --budget 500 2>&1 | head -3 | sed 's/^/    /'

echo ""
echo "=== Headroom ==="
headroom doctor 2>&1 | grep -E 'proxy|deployments|claude|codex|shell env' | sed 's/^/  /' || true

echo ""
echo "=== Cursor (manual) ==="
echo "  OpenAI override: http://127.0.0.1:8787/p/gandom_galery_shop/v1"
echo "  Anthropic override: http://127.0.0.1:8787/p/gandom_galery_shop"
echo "  Settings → Models → Override OpenAI Base URL"

echo ""
echo "=== API keys ==="
if [[ -f .env ]]; then set -a; source .env; set +a; fi
if [[ -n "${GOOGLE_API_KEY:-}" || -n "${GEMINI_API_KEY:-}" ]]; then
  echo "  Gemini: set"
else
  echo "  Gemini: NOT in env (add GOOGLE_API_KEY to ~/.zshrc or .env)"
  exit 1
fi

echo ""
echo "OK — graphify + headroom configured."
