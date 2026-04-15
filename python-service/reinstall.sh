#!/bin/bash
set -e

PYTHON_BIN=${PYTHON_BIN:-python3}

"$PYTHON_BIN" -m pip uninstall google-generativeai -y || true
"$PYTHON_BIN" -m pip install --upgrade pip
"$PYTHON_BIN" -m pip install google-genai
echo "Done! google-genai installed"
