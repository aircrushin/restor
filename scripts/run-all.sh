#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PY_DIR="$ROOT_DIR/python"

PY_HOST="${PY_HOST:-127.0.0.1}"
PY_PORT="${PY_PORT:-8000}"
NEXT_PORT="${NEXT_PORT:-3000}"

if [[ ! -d "$PY_DIR" ]]; then
  echo "Python service directory not found: $PY_DIR" >&2
  exit 1
fi

if [[ -x "$PY_DIR/.venv/bin/python" ]]; then
  PYTHON_BIN="$PY_DIR/.venv/bin/python"
elif command -v python3 >/dev/null 2>&1; then
  PYTHON_BIN="python3"
else
  echo "python3 is required but not installed." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required but not installed." >&2
  exit 1
fi

if [[ "$PYTHON_BIN" == "python3" && ! -x "$PY_DIR/.venv/bin/python" ]]; then
  echo "Creating python virtual environment at python/.venv ..."
  python3 -m venv "$PY_DIR/.venv"
  PYTHON_BIN="$PY_DIR/.venv/bin/python"
fi

echo "Ensuring Python dependencies are installed ..."
"$PYTHON_BIN" -m pip install -q --upgrade pip
"$PYTHON_BIN" -m pip install -q -r "$PY_DIR/requirements.txt"

cleanup() {
  if [[ -n "${PY_PID:-}" ]]; then
    kill "$PY_PID" >/dev/null 2>&1 || true
  fi
  if [[ -n "${NEXT_PID:-}" ]]; then
    kill "$NEXT_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

echo "Starting Python worker on http://$PY_HOST:$PY_PORT ..."
(
  cd "$PY_DIR"
  "$PYTHON_BIN" -m uvicorn main:app --reload --host "$PY_HOST" --port "$PY_PORT"
) &
PY_PID=$!

echo "Starting Next.js on http://127.0.0.1:$NEXT_PORT ..."
(
  cd "$ROOT_DIR"
  PYTHON_API_URL="http://$PY_HOST:$PY_PORT" PORT="$NEXT_PORT" npm run dev
) &
NEXT_PID=$!

# Bash 3.2 on macOS does not support `wait -n`, so use a portable loop:
# keep running until either child exits, then stop both via trap cleanup.
while true; do
  if ! kill -0 "$PY_PID" >/dev/null 2>&1; then
    wait "$PY_PID" || true
    break
  fi
  if ! kill -0 "$NEXT_PID" >/dev/null 2>&1; then
    wait "$NEXT_PID" || true
    break
  fi
  sleep 1
done
