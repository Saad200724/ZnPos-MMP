#!/bin/bash

# Kill any existing processes on these ports
fuser -k 8080/tcp 2>/dev/null || true
fuser -k 8081/tcp 2>/dev/null || true
sleep 1

# Start the API server in background
PORT=8080 pnpm run dev:server &
SERVER_PID=$!

# Start the Vite client in background
PORT=8081 BASE_PATH=/mew-mew-pos/ pnpm run dev:client &
CLIENT_PID=$!

# Wait for both
wait $SERVER_PID $CLIENT_PID
