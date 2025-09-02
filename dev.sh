#!/usr/bin/env bash
set -euo pipefail

# Start FastAPI (activate its venv)
pushd paprly-server > /dev/null
source ./venv/bin/activate
uvicorn server:app --reload --port 8000 &
API_PID=$!
popd > /dev/null

# Wait until health check responds before starting Next
until curl -sf http://127.0.0.1:8000/health >/dev/null; do
  echo "Waiting for FastAPI..."
  sleep 1
done

npm run dev &
NEXT_PID=$!

trap "kill $API_PID $NEXT_PID 2>/dev/null || true" EXIT
wait
