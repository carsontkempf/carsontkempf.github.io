#!/bin/bash

# Enhanced Development Startup Script
#
# Usage:
#   ./start-dev.sh                  - Normal startup
#   ./start-dev.sh --test-cors      - Test CORS functionality  
#   ./start-dev.sh --test-langgraph - Test LangGraph functionality
#   ./start-dev.sh --test-dependencies - Test all critical dependencies
#
# The --test-dependencies flag will check:
# - Python environment and virtual environment
# - Critical packages: langchain_ollama, torch, langgraph, transformers
# - Node-specific imports and Flask app availability
# - Full LangGraph initialization test
#
# Use this flag to diagnose the "langchain_ollama not available" errors.

# Parse command line arguments
TEST_CORS=false
TEST_LANGGRAPH=false
TEST_DEPENDENCIES=false
for arg in "$@"; do
    case $arg in
        --test-cors)
        TEST_CORS=true
        shift
        ;;
        --test-langgraph)
        TEST_LANGGRAPH=true
        shift
        ;;
        --test-dependencies)
        TEST_DEPENDENCIES=true
        shift
        ;;
        *)
        # Unknown option, pass it through
        ;;
    esac
done

# Kill processes on ports 4000 and 5000 (local)
lsof -ti:4000 | xargs kill -9 2>/dev/null
lsof -ti:5000 | xargs kill -9 2>/dev/null
lsof -ti:22 | xargs kill -9 2>/dev/null

# Kill any existing SSH port forwarding sessions
pkill -f "ssh.*-L.*5000:127.0.0.1:5000" 2>/dev/null || true

# Load .env to get remote server info
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
    
    # Kill remote processes on port 5000
    if [ -n "$SERVER_USER" ] && [ -n "$SERVER_IP" ]; then
        ssh ${SERVER_USER}@${SERVER_IP} "lsof -ti:5000 | xargs kill -9 2>/dev/null || true"
    fi
fi

# Store the test flags for later use
export RUN_CORS_TEST=$TEST_CORS
export RUN_LANGGRAPH_TEST=$TEST_LANGGRAPH
export RUN_DEPENDENCY_TEST=$TEST_DEPENDENCIES
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

# Skip exporting git submodule info - using new deployment solution

# Run the enhanced startup script with progress bars
node startup-with-progress.js