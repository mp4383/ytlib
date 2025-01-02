#!/bin/bash

# Create logs directory if it doesn't exist
mkdir -p logs

# Kill any existing processes
pkill -f "node.*server/index.js"
pkill -f "vite"

# Start backend server
echo "Starting backend server..."
cd server
nohup node index.js > ../logs/backend.log 2>&1 &
echo $! > ../logs/backend.pid
cd ..

# Wait a moment for backend to initialize
sleep 2

# Start frontend server
echo "Starting frontend server..."
# Use exec to run npm directly without shell wrapper
NODE_ENV=production nohup npx vite > logs/frontend.log 2>&1 &
frontend_pid=$!
echo $frontend_pid > logs/frontend.pid

# Verify processes started
echo "Verifying services..."
sleep 3

if ps -p $(cat logs/backend.pid) > /dev/null; then
    echo "✓ Backend server running (PID: $(cat logs/backend.pid))"
else
    echo "✗ Backend server failed to start"
    exit 1
fi

if ps -p $frontend_pid > /dev/null; then
    echo "✓ Frontend server running (PID: $frontend_pid)"
else
    echo "✗ Frontend server failed to start"
    exit 1
fi

echo "Services started. Check logs directory for output."
echo "Backend log: logs/backend.log"
echo "Frontend log: logs/frontend.log"
