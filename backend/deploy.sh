#!/usr/bin/env bash
set -euo pipefail

# deploy.sh - Install deps, build the project, and start containers
# Usage: ./deploy.sh

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
cd "$SCRIPT_DIR"

echo "[deploy] Installing npm dependencies..."
if ! npm install; then
  echo "[deploy][error] npm install failed"
  exit 1
fi

echo "[deploy] Building the project..."
if ! npm run build; then
  echo "[deploy][error] npm run build failed"
  exit 2
fi

# Determine docker compose command
DOCKER_COMPOSE_CMD=""
if command -v docker >/dev/null 2>&1; then
  if docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE_CMD="docker compose"
  else
    DOCKER_COMPOSE_CMD="docker-compose"
  fi
else
  echo "[deploy][error] docker is not installed or not in PATH"
  exit 3
fi

echo "[deploy] Starting containers (building images if needed)..."
if ! $DOCKER_COMPOSE_CMD up -d --build; then
  echo "[deploy][error] $DOCKER_COMPOSE_CMD up failed"
  exit 4
fi

echo "[deploy] Deployment complete. Services are starting in the background."
exit 0
