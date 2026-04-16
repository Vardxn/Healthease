#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

API_URL="http://localhost:5001/health"
PY_URL="http://localhost:8000/health"
WEB_URL="http://localhost:3000/"
PROXY_URL="http://localhost:3000/api/health"
API_PORT=5001
PY_PORT=8000
WEB_PORT=3000

PIDS=()

cleanup() {
  local code=$?
  trap - INT TERM EXIT
  if [[ ${#PIDS[@]} -gt 0 ]]; then
    echo
    echo "Stopping services..."
    kill "${PIDS[@]}" 2>/dev/null || true
    wait "${PIDS[@]}" 2>/dev/null || true
  fi
  exit "$code"
}

wait_for_url() {
  local url="$1"
  local label="$2"
  local timeout_secs="${3:-60}"
  local start_ts now elapsed

  start_ts="$(date +%s)"
  while true; do
    if curl -fsS "$url" >/dev/null 2>&1; then
      echo "ready: $label"
      return 0
    fi

    now="$(date +%s)"
    elapsed=$((now - start_ts))
    if (( elapsed >= timeout_secs )); then
      echo "timeout: $label not ready after ${timeout_secs}s"
      return 1
    fi

    sleep 1
  done
}

is_healthy() {
  local url="$1"
  curl -fsS "$url" >/dev/null 2>&1
}

port_in_use() {
  local port="$1"
  lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1
}

print_health_summary() {
  local code
  echo
  echo "Health summary"

  code="$(curl -sS -o /tmp/he_api_health_devall.json -w "%{http_code}" "$API_URL" || true)"
  echo "API $API_URL -> $code"
  cat /tmp/he_api_health_devall.json 2>/dev/null || true
  echo

  code="$(curl -sS -o /tmp/he_py_health_devall.json -w "%{http_code}" "$PY_URL" || true)"
  echo "Python $PY_URL -> $code"
  cat /tmp/he_py_health_devall.json 2>/dev/null || true
  echo

  code="$(curl -sS -o /tmp/he_web_root_devall.html -w "%{http_code}" "$WEB_URL" || true)"
  echo "Frontend $WEB_URL -> $code"

  code="$(curl -sS -o /tmp/he_proxy_health_devall.json -w "%{http_code}" "$PROXY_URL" || true)"
  echo "Proxy $PROXY_URL -> $code"
  cat /tmp/he_proxy_health_devall.json 2>/dev/null || true
  echo
}

trap cleanup INT TERM EXIT

echo "Starting python service, API, and frontend..."
if is_healthy "$PY_URL"; then
  echo "Python OCR already healthy on port $PY_PORT, skipping launch"
else
  if port_in_use "$PY_PORT"; then
    echo "Port $PY_PORT is in use and Python OCR health check failed"
    exit 1
  fi

  (
    cd python-service
    ./start_service.sh
  ) &
  PIDS+=("$!")
fi

if is_healthy "$API_URL"; then
  echo "API already healthy on port $API_PORT, skipping launch"
else
  if port_in_use "$API_PORT"; then
    echo "Port $API_PORT is in use and API health check failed"
    exit 1
  fi

  (
    cd server
    npm run dev
  ) &
  PIDS+=("$!")
fi

if is_healthy "$WEB_URL" && is_healthy "$PROXY_URL"; then
  echo "Frontend already healthy on port $WEB_PORT, skipping launch"
else
  if port_in_use "$WEB_PORT"; then
    echo "Port $WEB_PORT is in use and frontend/proxy health check failed"
    exit 1
  fi

  (
    cd client
    npm run dev -- --strictPort
  ) &
  PIDS+=("$!")
fi

echo "Waiting for services to become healthy..."
wait_for_url "$API_URL" "API (5001)"
wait_for_url "$PY_URL" "Python OCR (8000)"
wait_for_url "$WEB_URL" "Frontend (3000)"
wait_for_url "$PROXY_URL" "Frontend proxy to API"

print_health_summary

if [[ ${#PIDS[@]} -eq 0 ]]; then
  echo "All services were already running."
  exit 0
fi

echo "All services are up. Press Ctrl+C to stop all."
wait
