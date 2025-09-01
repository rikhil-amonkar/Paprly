#!/usr/bin/env bash
set -euo pipefail

# Start FastAPI (activate its venv)
pushd paprly-server > /dev/null
source ./venv/bin/activate
uvicorn server:app --reload --port 8000 &
API_PID=$!
popd > /dev/null

# Wait until FastAPI responds before starting Next
until curl -s http://127.0.0.1:8000/summarize -X POST \
  -H 'Content-Type: application/json' \
  -d '{"text":"ping"}' >/dev/null 2>&1; do
  echo "Waiting for FastAPI..."
  sleep 1
done

# Start Next.js dev
npm run dev &
NEXT_PID=$!

# Kill both on exit
trap "kill $API_PID $NEXT_PID 2>/dev/null || true" EXIT

wait
