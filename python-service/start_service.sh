#!/bin/bash
# Resolve to this script's own directory so it works regardless of where the
# project lives or where it is invoked from.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
export PYTHONPATH="$SCRIPT_DIR:$PYTHONPATH"

if [ ! -x "venv/bin/python" ]; then
	echo "Python virtual environment not found at python-service/venv"
	echo "Run: python3 -m venv venv && source venv/bin/activate && python -m pip install -r requirements.txt"
	exit 1
fi

PORT="${PORT:-8000}"
HOST="${HOST:-0.0.0.0}"

venv/bin/python -m uvicorn main:app --port "$PORT" --host "$HOST" --reload
