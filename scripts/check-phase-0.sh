#!/usr/bin/env bash
set -uo pipefail

echo "=== Sina Maoni · Phase 0 Check ==="

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm not found on PATH. Install Node 22 and run 'corepack enable'."
  exit 1
fi

FAILED=()

step() {
  local label="$1"
  shift
  echo ""
  echo "----- $label -----"
  if "$@"; then
    echo "PASS: $label"
  else
    echo "FAIL: $label"
    FAILED+=("$label")
  fi
}

step "install" pnpm install --no-frozen-lockfile
step "format" pnpm format:check
step "lint" pnpm lint:repo
step "type-check" pnpm type-check:repo
step "test" pnpm test:repo
step "build" pnpm build:repo

echo ""
if [ ${#FAILED[@]} -eq 0 ]; then
  echo "=== Phase 0 checks PASSED ==="
  echo "Next: bring up Postgres ('pnpm db:up') and run migrations."
  exit 0
fi

echo "=== Phase 0 checks FAILED: ${FAILED[*]} ==="
exit 1
