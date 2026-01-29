#!/bin/bash
set -e

# Build script for Netlify that substitutes environment variables

echo "========================================="
echo "Build Script - Environment Variable Debug"
echo "========================================="

# Debug: Show which environment variables are set
echo "Checking environment variables..."
echo "AUTH0_DOMAIN: ${AUTH0_DOMAIN:-(not set)}"
echo "AUTH0_CLIENT_ID: ${AUTH0_CLIENT_ID:-(not set)}"
echo "AUTH0_AUDIENCE_SERVER: ${AUTH0_AUDIENCE_SERVER:-(not set)}"
echo "AUTH0_CALLBACK_URL: ${AUTH0_CALLBACK_URL:-(not set)}"
echo "SPOTIFY_CLIENT_ID: ${SPOTIFY_CLIENT_ID:-(not set)}"
echo "APPLE_TEAM_ID: ${APPLE_TEAM_ID:-(not set)}"
echo "APPLE_KEY_ID: ${APPLE_KEY_ID:-(not set)}"
echo "========================================="

# Create a temporary config file with environment variables substituted
CONFIG_FILE="_config-prod-env.yml"

# Check if we're in production or using the production config
if [ -f "_config-prod.yml" ]; then
    echo "Creating production config with actual environment values..."

    # Manually substitute environment variables with actual values
    # This ensures proper YAML syntax (no shell variable syntax)
    cat > $CONFIG_FILE << EOF
# Production Configuration - Generated from environment variables
# Generated at: $(date)

auth0:
  domain: "${AUTH0_DOMAIN:-dev-l57dcpkhob0u7ykb.us.auth0.com}"
  client_id: "${AUTH0_CLIENT_ID:-Dq4tBsHjgcIGbXkVU8PPvjAq3WYmnSBC}"
  audience: "${AUTH0_AUDIENCE_SERVER:-https://carsontkempf.github.io/api/carsons-meditations}"
  callback_url: "${AUTH0_CALLBACK_URL:-https://carsontkempf.github.io}"

spotify:
  client_id: "${SPOTIFY_CLIENT_ID:-80826ef3daa547f49d843c254ad224b6}"

apple_music:
  team_id: "${APPLE_TEAM_ID:-5S855HB895}"
  key_id: "${APPLE_KEY_ID:-T5ZX676QRQ}"
  developer_token: "${APPLE_MUSIC_DEVELOPER_TOKEN:-}"
EOF

    echo ""
    echo "Generated config file contents:"
    echo "========================================="
    cat $CONFIG_FILE
    echo "========================================="

    echo ""
    echo "Building with config: _config.yml,$CONFIG_FILE"
    bundle exec jekyll build --config _config.yml,$CONFIG_FILE
else
    echo "Production config not found, building with default config"
    bundle exec jekyll build
fi

echo ""
echo "Build complete!"
echo ""
echo "Verifying generated auth.js config..."
if [ -f "_site/assets/js/auth.js" ]; then
    echo "First 50 lines of generated auth.js:"
    head -50 _site/assets/js/auth.js | grep -A 10 "const config"
fi
