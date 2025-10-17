#!/bin/bash

# Kill processes on ports 4000 and 5000 (local)
lsof -ti:4000 | xargs kill -9 2>/dev/null
lsof -ti:5000 | xargs kill -9 2>/dev/null

# Load .env to get remote server info
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
    
    # Kill remote processes on port 5000
    if [ -n "$SERVER_USER" ] && [ -n "$SERVER_IP" ]; then
        ssh ${SERVER_USER}@${SERVER_IP} "lsof -ti:5000 | xargs kill -9 2>/dev/null || true"
    fi
fi

# Get Error-Annotater submodule sync info
cd backends/Error-Annotater
SUBMODULE_COMMIT=$(git rev-parse HEAD)
SUBMODULE_BRANCH="feature/flask-api"
cd ../..

# Enhanced startup script with progress bars
# This script now uses Node.js with cli-progress for better visual feedback

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required for the enhanced startup script"
    echo "Please install Node.js or use the legacy startup method"
    exit 1
fi

# Check if npm dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

# Export submodule info for the Node.js script
export SUBMODULE_COMMIT
export SUBMODULE_BRANCH

# Run the enhanced startup script with progress bars
node startup-with-progress.js