#!/usr/bin/env bash
set -euo pipefail

echo "=== Sina Maoni · Phase 0 Check ==="

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm not found on PATH. Install pnpm first."
  exit 1
fi

echo ""
echo "1) Installing dependencies with pnpm..."
pnpm install --no-frozen-lockfile

echo ""
echo "2) Running lint (turbo via npm script)..."
pnpm lint:repo

echo ""
echo "3) Running type-check..."
pnpm type-check:repo

echo ""
echo "4) Running tests..."
pnpm test:repo

echo ""
echo "5) Running build..."
pnpm build:repo

# Optional DB checks (Phase 0: schema + migrations working)
if [ -d "packages/db" ]; then
  echo ""
  echo "6) Running Drizzle migrations (packages/db)..."
  cd packages/db
  if [ -f "drizzle.config.ts" ] || [ -f "drizzle.config.mts" ] || [ -f "drizzle.config.mjs" ]; then
    pnpm db:migrate
  else
    echo "Skipping db:migrate (no drizzle.config.* found)."
  fi
  cd - >/dev/null
fi

echo ""
echo "=== Phase 0 checks completed successfully ==="
echo "Next manual step: run 'pnpm dev' in another terminal and confirm all apps start."
