#!/bin/bash

# Usage: ./run.sh [--prod]
#
# Starts Jekyll server, killing any process on port 4000 first
# Prevents SSL timeout errors from GitHub metadata plugin
#
# Default (no args): Development mode using _config.yml
# --prod: Production mode (for testing, not recommended locally)

# Kill any process using port 4000
echo "Killing any process on port 4000..."
lsof -ti:4000 | xargs kill -9 2>/dev/null || true

# Determine which config to use
# NOTE: _config.yml uses ${} env var placeholders that are overridden by dev/prod configs
# For local development, use _config-dev.yml which has hardcoded development values
# For production testing, use _config-prod.yml (env vars won't be substituted locally)
if [[ "$1" == "--prod" ]]; then
    echo "Starting Jekyll in PRODUCTION mode (testing prod config locally)..."
    echo "WARNING: Using _config-prod.yml locally - env vars won't be substituted!"
    CONFIG_FILE="_config.yml,_config-prod.yml"
else
    echo "Starting Jekyll in DEVELOPMENT mode..."
    CONFIG_FILE="_config.yml,_config-dev.yml"
fi

# Disable GitHub Metadata to avoid SSL timeout
export JEKYLL_GITHUB_TOKEN=""

# Run Jekyll with livereload
bundle exec jekyll serve \
    --config "$CONFIG_FILE" \
    --livereload
