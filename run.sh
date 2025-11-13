#!/bin/bash

# Jekyll Development Launcher
# This script uses uv to manage Python dependencies and launch the Jekyll development environment.
#
# Usage:
#   ./run.sh dev              # Start development server
#   ./run.sh prod             # Build for production
#   ./run.sh dev --verbose    # Start development server with verbose output

set -e  # Exit on any error

# Check if netlify is available
if ! command -v netlify &> /dev/null; then
    echo "Error: netlify CLI is not installed. Please install it with:"
    echo "npm install netlify-cli -g"
    exit 1
fi

# Check if uv is available
if ! command -v uv &> /dev/null; then
    echo "Error: uv is not installed. Please install it with:"
    echo "curl -LsSf https://astral.sh/uv/install.sh | sh"
    exit 1
fi

# Check if bundle is available
if ! command -v bundle &> /dev/null; then
    echo "Error: bundle is not installed. Please install it with:"
    echo "gem install bundler"
    exit 1
fi

# Create virtual environment and install dependencies using uv
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    uv venv --quiet
fi

echo "Installing Python dependencies..."
uv pip install -r script-requirements.txt --quiet

# Run main.py with uv
uv run python main.py "$@"