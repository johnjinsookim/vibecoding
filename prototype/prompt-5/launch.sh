#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-8000}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

echo "Serving ${ROOT} on http://localhost:${PORT}/prototype/prompt-5/"
cd "$ROOT"
python3 -m http.server "$PORT"
