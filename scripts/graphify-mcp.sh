#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec uvx --from 'graphifyy[mcp]' python -m graphify.serve "$ROOT/graphify-out/graph.json"
