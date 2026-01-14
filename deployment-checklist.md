# Deployment Checklist - Fix Environment Variables

## Changes Made

### 1. Updated Frontend to Use Environment Config Service
- `assets/js/auth.js.liquid` - Now waits for and uses `envConfig` service instead of directly embedding Jekyll site variables
- This ensures production uses Netlify function (which reads actual environment variables)

### 2. Created Debug Page
- `debug-config.html` - Visit this page after deployment to verify configuration

### 3. Build Script (Fallback)
- `scripts/build.sh` - Substitutes environment variables during build
- `netlify.toml` - Updated to use build script

## Critical Action Required: Set Environment Variables in Netlify

You MUST set these environment variables in your Netlify dashboard:

### Go to Netlify Dashboard
1. Log into netlify.com
2. Select your site
3. Click **Site settings**
4. Click **Environment variables** in sidebar
5. Add each variable below:

### Required Variables

**Auth0 (Required)**
- Key: `AUTH0_DOMAIN`
  Value: `dev-l57dcpkhob0u7ykb.us.auth0.com` (or your actual Auth0 domain)

- Key: `AUTH0_CLIENT_ID`
  Value: `Dq4tBsHjgcIGbXkVU8PPvjAq3WYmnSBC` (or your actual client ID)

- Key: `AUTH0_AUDIENCE_SERVER`
  Value: `https://carsontkempf.github.io/api/carsons-meditations` (or your actual audience)

**Spotify (Required)**
- Key: `SPOTIFY_CLIENT_ID`
  Value: `80826ef3daa547f49d843c254ad224b6` (or your actual Spotify client ID)

**Apple Music (Optional)**
- Key: `APPLE_TEAM_ID`
  Value: Your Apple Developer Team ID

- Key: `APPLE_KEY_ID`
  Value: Your Apple Music Key ID

- Key: `APPLE_MUSIC_DEVELOPER_TOKEN`
  Value: Your Apple Music developer token

## Deployment Steps

1. Commit and push these changes:
   ```bash
   git add .
   git commit -m "Fix environment variable configuration for production"
   git push
   ```

2. Set environment variables in Netlify (see above)

3. Trigger a new deploy in Netlify
   - Either push new commit OR
   - Go to Deploys tab and click "Trigger deploy" → "Clear cache and deploy site"

4. After deployment, visit:
   - `https://your-site.netlify.app/debug-config.html`
   - Verify all values are correct (no `${...}` placeholders)

## How It Works Now

### Production (Netlify)
1. User visits site
2. `env-config.js` detects it's not localhost
3. Calls `/.netlify/functions/get-api-key`
4. Function reads `process.env.AUTH0_DOMAIN` etc. from Netlify environment variables
5. Returns actual values to frontend
6. `auth.js` initializes with real credentials

### Local Development
1. User visits site on localhost
2. `env-config.js` detects localhost
3. Uses values from `_config-dev.yml`
4. Development credentials used

## Troubleshooting

### If you still see `${AUTH0_DOMAIN}` error:

**Problem:** Environment variables not set in Netlify
**Solution:** Follow "Required Variables" section above

**Problem:** Variables set but not taking effect
**Solution:** Trigger a fresh deploy (clear cache and redeploy)

**Problem:** Netlify function failing
**Solution:**
- Check function logs in Netlify dashboard (Functions tab)
- Verify `netlify/functions/get-api-key.js` exists
- Check that `express-oauth2-jwt-bearer` dependency is installed

### If function works but auth fails:

Check that Auth0 application settings have:
- Allowed Callback URLs: `https://your-site.netlify.app/dashboard/`
- Allowed Logout URLs: `https://your-site.netlify.app/`
- Allowed Web Origins: `https://your-site.netlify.app`
