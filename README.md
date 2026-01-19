# carsontkempf.github.io

Visit: https://carsontkempf.github.io

## Writer's Admin Setup

The Writer's Admin panel allows authorized users (Admin/Writer roles) to manage YouTube videos and write articles directly through the GitHub API.

### Required Environment Variables in Netlify

Add the following environment variable in Netlify:

**Site Settings > Environment Variables**

| Variable Name | Description | Required Scopes |
|--------------|-------------|-----------------|
| `GITHUB_PAT` | GitHub Personal Access Token for content management | `repo` (Full control of private repositories) |

### Creating a GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name it: "Writer's Admin - carsontkempf.github.io"
4. Select expiration (recommend: No expiration for production)
5. Select scopes:
   - ✅ `repo` (Full control of private repositories)
     - This grants access to read/write repository contents
6. Click "Generate token"
7. **Copy the token immediately** (you won't see it again)
8. Add to Netlify as `GITHUB_PAT`

### Security Notes

- The GitHub PAT is stored securely in Netlify environment variables
- Access to the token is protected by Auth0 authentication + role checking
- Only users with Admin or Writer roles can retrieve the token
- The token is never exposed to the client or logged
- Uses sessionStorage for temporary caching (cleared on browser close)

### Deployment

After adding the environment variable:
1. Trigger a new deploy in Netlify (or push to gh-pages branch)
2. Visit https://carsontkempf.github.io/admin/
3. Authenticate with Auth0
4. GitHub connection happens automatically
5. Start managing content

### Existing Environment Variables

Make sure these are also configured in Netlify:

**Auth0:**
- `AUTH0_DOMAIN`
- `AUTH0_CLIENT_ID`
- `AUTH0_AUDIENCE_SERVER`
- `AUTH0_ISSUER`

**Spotify:**
- `SPOTIFY_CLIENT_ID`

**Apple Music:**
- `APPLE_TEAM_ID`
- `APPLE_KEY_ID`
- `APPLE_P8_KEY`