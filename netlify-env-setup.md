# Netlify Environment Variables Setup

## Required Environment Variables

Set these in your Netlify dashboard under: **Site settings > Environment variables**

### Auth0 Variables
- `AUTH0_DOMAIN` - Your Auth0 tenant domain (e.g., `dev-l57dcpkhob0u7ykb.us.auth0.com`)
- `AUTH0_CLIENT_ID` - Your Auth0 application client ID
- `AUTH0_AUDIENCE_SERVER` - Your Auth0 API audience/identifier

### Spotify Variables
- `SPOTIFY_CLIENT_ID` - Your Spotify application client ID

### Apple Music Variables (Optional)
- `APPLE_TEAM_ID` - Your Apple Developer Team ID
- `APPLE_KEY_ID` - Your Apple Music API Key ID
- `APPLE_MUSIC_DEVELOPER_TOKEN` - Your Apple Music developer token

## How to Set Environment Variables in Netlify

1. Log into Netlify
2. Go to your site dashboard
3. Click **Site settings** in the top menu
4. Click **Environment variables** in the left sidebar
5. Click **Add a variable**
6. For each variable:
   - Enter the key (e.g., `AUTH0_DOMAIN`)
   - Enter the value (the actual credential, NOT `${AUTH0_DOMAIN}`)
   - Select scope: **All scopes** (or just Production if preferred)
   - Click **Create variable**

## Verify Setup

After setting the variables and redeploying:

1. Visit `https://your-site.netlify.app/debug-config.html`
2. Check that all values are properly loaded (no `${...}` placeholders)
3. Verify no error messages appear

## How It Works

### Production Flow
1. Page loads and `env-config.js` runs
2. Detects it's not localhost, so calls Netlify function
3. Netlify function reads `process.env.AUTH0_DOMAIN` etc.
4. Function returns actual values to frontend
5. Auth0 initializes with real credentials

### Local Development Flow
1. Page loads and `env-config.js` runs
2. Detects localhost, skips Netlify function
3. Uses values from `_config-dev.yml`
4. Development credentials are used

## Troubleshooting

If you see `${AUTH0_DOMAIN}` in the browser:
- Environment variables are NOT set in Netlify dashboard
- OR variables are set but site hasn't been redeployed
- Solution: Set variables, then trigger a new deploy

If Netlify function fails:
- Check function logs in Netlify dashboard
- Verify `netlify/functions/get-api-key.js` is deployed
- Check that function has access to environment variables
