# Netlify Environment Variables Configuration

## Required Environment Variables

The following environment variables must be configured in Netlify for the production deployment:

### Auth0 Configuration
- `AUTH0_DOMAIN` - Your Auth0 domain (e.g., "dev-xxxxx.us.auth0.com")
- `AUTH0_CLIENT_ID` - Your Auth0 application client ID
- `AUTH0_AUDIENCE_SERVER` - Your Auth0 API audience identifier

### Spotify Configuration
- `SPOTIFY_CLIENT_ID` - Your Spotify application client ID

### Apple Music Configuration
- `APPLE_TEAM_ID` - Your Apple Developer Team ID
- `APPLE_KEY_ID` - Your Apple Music Key ID
- `APPLE_MUSIC_DEVELOPER_TOKEN` - Your Apple Music developer JWT token

## How to Set Environment Variables in Netlify

1. Log in to Netlify
2. Navigate to your site
3. Go to Site Settings > Environment Variables
4. Add each variable with its corresponding value
5. Deploy the site for changes to take effect

## Local Development

For local development, values are read from `_config-dev.yml` which contains hardcoded development values.

## Security Notes

- Never commit real secrets to the Git repository
- The `.p8` private key file is in `.gitignore` and should never be committed
- Environment variable placeholders in `_config.yml` and `_config-prod.yml` are safe to commit
- Development values in `_config-dev.yml` are public client IDs and can be committed
