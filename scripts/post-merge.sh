#!/usr/bin/env bash
set -e

echo "Installing dependencies..."
pnpm install --frozen-lockfile || pnpm install

echo "Done! The app will start automatically."
