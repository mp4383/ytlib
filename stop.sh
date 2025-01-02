#!/bin/bash

# Function to kill process by PID file
kill_by_pid() {
    if [ -f "logs/$1.pid" ]; then
        pid=$(cat "logs/$1.pid")
        if ps -p $pid > /dev/null; then
            echo "Stopping $1 (PID: $pid)..."
            kill $pid
            # Wait up to 5 seconds for process to stop
            for i in {1..5}; do
                if ! ps -p $pid > /dev/null; then
                    break
                fi
                sleep 1
            done
            # Force kill if still running
            if ps -p $pid > /dev/null; then
                echo "Force stopping $1 (PID: $pid)..."
                kill -9 $pid
            fi
            rm "logs/$1.pid"
        else
            echo "$1 is not running"
            rm "logs/$1.pid"
        fi
    else
        echo "No PID file found for $1"
    fi
}

echo "Stopping services..."

# Stop services using PID files first
kill_by_pid "backend"
kill_by_pid "frontend"

# Kill any remaining processes as backup
pkill -f "node.*server/index.js"
pkill -f "vite"

# Clean up any stale log files
echo "Cleaning up log files..."
rm -f logs/*.log

echo "All services stopped and cleaned up"
