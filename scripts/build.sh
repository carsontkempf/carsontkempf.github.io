#!/bin/bash
set -e

# Build script for Netlify that substitutes environment variables

echo "Starting build with environment variable substitution..."

# Create a temporary config file with environment variables substituted
CONFIG_FILE="_config-prod-env.yml"

# Check if we're in production or using the production config
if [ -f "_config-prod.yml" ]; then
    echo "Substituting environment variables in production config..."

    # Use envsubst to replace ${VAR} with actual environment variable values
    # Fall back to placeholder if env var is not set
    envsubst < _config-prod.yml > $CONFIG_FILE 2>/dev/null || {
        echo "Warning: envsubst not available, creating config with defaults"
        cat > $CONFIG_FILE << EOF
# Production Configuration - Generated from environment variables

auth0:
  domain: "${AUTH0_DOMAIN:-dev-l57dcpkhob0u7ykb.us.auth0.com}"
  client_id: "${AUTH0_CLIENT_ID:-Dq4tBsHjgcIGbXkVU8PPvjAq3WYmnSBC}"
  audience: "${AUTH0_AUDIENCE_SERVER:-https://carsontkempf.github.io/api/carsons-meditations}"

spotify:
  client_id: "${SPOTIFY_CLIENT_ID:-80826ef3daa547f49d843c254ad224b6}"

apple_music:
  team_id: "${APPLE_TEAM_ID:-5S855HB895}"
  key_id: "${APPLE_KEY_ID:-T5ZX676QRQ}"
  developer_token: "${APPLE_MUSIC_DEVELOPER_TOKEN:-}"
EOF
    }

    echo "Building with config: _config.yml,$CONFIG_FILE"
    bundle exec jekyll build --config _config.yml,$CONFIG_FILE
else
    echo "Production config not found, building with default config"
    bundle exec jekyll build
fi

echo "Build complete!"
