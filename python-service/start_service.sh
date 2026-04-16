#!/bin/bash
cd /Users/vardxn/Developer/personal/health-ease/python-service
export PYTHONPATH=/Users/vardxn/Developer/personal/health-ease/python-service:$PYTHONPATH

if [ ! -x "venv/bin/python" ]; then
	echo "Python virtual environment not found at python-service/venv"
	echo "Run: python3 -m venv venv && source venv/bin/activate && python -m pip install -r requirements.txt"
	exit 1
fi

PORT="${PORT:-8000}"
HOST="${HOST:-0.0.0.0}"

venv/bin/python -m uvicorn main:app --port "$PORT" --host "$HOST" --reload
