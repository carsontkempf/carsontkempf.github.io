#!/bin/bash

# Download Stockfish.js Lite Single-Threaded Version
# This script downloads the recommended version of Stockfish.js

set -e

echo "Downloading Stockfish.js (Lite Single-Threaded)..."

# GitHub release URL
RELEASE_URL="https://api.github.com/repos/nmrugg/stockfish.js/releases/latest"

# Get latest release info
echo "Fetching latest release info..."
RELEASE_INFO=$(curl -s "$RELEASE_URL")

# Extract download URLs for lite-single files
JS_URL=$(echo "$RELEASE_INFO" | grep -o "https://github.com/nmrugg/stockfish.js/releases/download/[^\"]*stockfish-nnue-17.1-lite-single-[^\"]*\.js" | head -1)
WASM_URL=$(echo "$RELEASE_INFO" | grep -o "https://github.com/nmrugg/stockfish.js/releases/download/[^\"]*stockfish-nnue-17.1-lite-single-[^\"]*\.wasm" | head -1)

if [ -z "$JS_URL" ] || [ -z "$WASM_URL" ]; then
    echo "Error: Could not find download URLs"
    echo "Please download manually from: https://github.com/nmrugg/stockfish.js/releases"
    exit 1
fi

echo "Downloading JavaScript file..."
curl -L -o stockfish.js "$JS_URL"

echo "Downloading WASM file..."
WASM_FILENAME=$(basename "$WASM_URL")
curl -L -o "$WASM_FILENAME" "$WASM_URL"

echo ""
echo "Download complete!"
echo "Files downloaded:"
echo "  - stockfish.js"
echo "  - $WASM_FILENAME"
echo ""
echo "The engine is now ready to use."
