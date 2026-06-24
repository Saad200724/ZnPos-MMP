#!/bin/bash
set -e

# ── Find the zip ──────────────────────────────────────────────────────────────
if [ -n "$1" ]; then
  ZIP="$1"
else
  ZIP=$(ls /home/runner/workspace/*.zip 2>/dev/null | head -1)
fi

if [ -z "$ZIP" ] || [ ! -f "$ZIP" ]; then
  echo ""
  echo "Usage: bash start.sh yourfile.zip"
  echo "Or:    drop a .zip here then run: bash start.sh"
  echo ""
  exit 1
fi

echo ""
echo "=== Mew Mew POS Setup ==="
echo ""

# ── Extract ───────────────────────────────────────────────────────────────────
echo "[1/4] Extracting $ZIP..."
TMP=$(mktemp -d)
unzip -q "$ZIP" -d "$TMP"

INNER=$(find "$TMP" -maxdepth 3 -name "package.json" ! -path "*/node_modules/*" | head -1)
if [ -z "$INNER" ]; then
  echo "ERROR: No package.json found in the zip."
  rm -rf "$TMP"
  exit 1
fi
ROOT=$(dirname "$INNER")

echo "[2/4] Copying files..."
rsync -a --exclude=node_modules --exclude=.git --exclude=dist "$ROOT/" /home/runner/workspace/
rm -rf "$TMP"

# ── Install ───────────────────────────────────────────────────────────────────
echo "[3/4] Installing dependencies..."
cd /home/runner/workspace
pnpm install

# ── Database ──────────────────────────────────────────────────────────────────
echo "[4/4] Setting up database..."
pnpm run db:push
pnpm run db:seed

# ── Restart servers ───────────────────────────────────────────────────────────
echo ""
echo "Restarting servers..."
pkill -f "tsx server/index.ts" 2>/dev/null || true
pkill -f "vite --config client/vite.config.ts" 2>/dev/null || true
sleep 2

nohup pnpm run dev:server >> /tmp/server.log 2>&1 &
nohup env PORT=8081 BASE_PATH=/mew-mew-pos/ pnpm run dev:client >> /tmp/client.log 2>&1 &

echo ""
echo "=============================="
echo " All done! App is starting up."
echo " Login: admin / admin123"
echo "=============================="
echo ""
