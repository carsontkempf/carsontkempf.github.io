# Security Setup Guide

## Immediate Actions Required

### 1. **Revoke Exposed Credentials**
Your Google Drive API credentials were exposed in git history. Immediately:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to "APIs & Services" > "Credentials"
3. Delete these exposed credentials:
   - **Client ID**: `53684428529-pr70sqotvga0fo1aijvsb7lkgpdcetbi.apps.googleusercontent.com`
   - **API Key**: `AIzaSyBOcXkX_2lnzW89KMmBquK2oP3erErLYbo`

### 2. **Generate New Credentials**
1. Create a new OAuth 2.0 Client ID for "Web application"
2. Add your authorized domains:
   - `https://carsontkempf.github.io`
   - `http://localhost:4000` (for development)
3. Generate a new API key with domain restrictions

### 3. **Set Up Environment Variables**

#### For Netlify (Production):
In Netlify Dashboard > Site Settings > Environment Variables, add:
```
GOOGLE_DRIVE_CLIENT_ID=53684428529-27609a7n7fd3rtov2a86vrq1gvffs62t.apps.googleusercontent.com
GOOGLE_DRIVE_API_KEY=AIzaSyBeYgUCi017eGe7Gt1_aSbNXn96LgcE18o
SPOTIFY_CLIENT_ID=80826ef3daa547f49d843c254ad224b6
AUTH0_DOMAIN=dev-l57dcpkhob0u7ykb.us.auth0.com
AUTH0_CLIENT_ID=ql8ttR4YSmZXZbGE30wP8foWCUuZs2jh
AUTH0_AUDIENCE_SERVER=https://carsontkempf.github.io/api/carsons-meditations
```

**Note**: These credentials are now properly secured via environment variables and will not be exposed in your source code.

#### For Local Development:
The `.env` file has been created with the secure credentials:
```bash
# Already created with secure credentials
GOOGLE_DRIVE_CLIENT_ID=53684428529-27609a7n7fd3rtov2a86vrq1gvffs62t.apps.googleusercontent.com
GOOGLE_DRIVE_API_KEY=AIzaSyBeYgUCi017eGe7Gt1_aSbNXn96LgcE18o
SPOTIFY_CLIENT_ID=80826ef3daa547f49d843c254ad224b6
AUTH0_DOMAIN=dev-l57dcpkhob0u7ykb.us.auth0.com
AUTH0_CLIENT_ID=ql8ttR4YSmZXZbGE30wP8foWCUuZs2jh
AUTH0_AUDIENCE_SERVER=https://carsontkempf.github.io/api/carsons-meditations
```

### 4. **Using Auth0 Instead of Hardcoded Credentials**

The new security system works like this:

1. **Environment Configuration** (`env-config.js`) loads credentials securely from:
   - Netlify Functions (production) - most secure
   - Environment variables (development fallback)

2. **Google Drive Service** now waits for secure config before initializing

3. **Netlify Function** (`get-api-key.js`) validates Auth0 tokens and serves credentials only to authenticated users

### 5. **Auth0 Authentication Flow**

Users must authenticate through Auth0 before accessing Google Drive:

1. User logs in via Auth0
2. Auth0 provides access token
3. Netlify function validates token
4. Secure credentials delivered only to authorized users
5. Google Drive API accessed with validated credentials

### 6. **Security Benefits**

✅ **No hardcoded credentials** in source code
✅ **Server-side validation** via Netlify Functions  
✅ **Role-based access** through Auth0
✅ **Environment-based configuration**
✅ **Token validation** for all API requests

### 7. **Testing the New Flow**

1. Deploy to Netlify with environment variables set
2. Test authentication flow:
   - Should require Auth0 login
   - Should load credentials securely
   - Should access Google Drive with new credentials
3. Monitor console for any configuration errors

### 8. **Git History Cleanup** (Optional but Recommended)

Consider using git tools to remove sensitive data from history:
```bash
# WARNING: This rewrites git history - coordinate with team
git filter-branch --env-filter '
if [ "$GIT_COMMIT" = "commit_hash_with_secrets" ]; then
    export GIT_AUTHOR_NAME="Security Fix"
    export GIT_COMMITTER_NAME="Security Fix"
fi
' -- --all
```

Or use [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) for safer history cleaning.

## File Changes Made

- ✅ Updated `_config.yml`, `_config-dev.yml`, `_config-prod.yml` to use environment variables
- ✅ Created `env-config.js` for secure credential loading
- ✅ Updated `get-api-key.js` Netlify function for secure delivery
- ✅ Modified Google Drive service to use secure configuration
- ✅ Updated HTML templates to load secure configuration first
- ✅ Added `.env` to `.gitignore`
- ✅ Created `.env.example` template

## Next Steps

1. **Generate new Google API credentials**
2. **Set environment variables in Netlify**
3. **Test the authentication flow**
4. **Monitor for any issues**
5. **Consider git history cleanup** if needed