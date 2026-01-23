/**
 * Database Get User Function
 * Fetches user profile from GitHub repository (_data/chess/user-profiles/{auth0_id}.json)
 * Returns default schema for new users (404 from GitHub)
 */

const { withAuth } = require('../lib/auth');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json'
};

// Default user profile schema
const DEFAULT_PROFILE = {
  preferences: {
    boardTheme: 'brown',
    ttSizePower: 22,
    depthPriority: 2.0,
    agePriority: 1.5
  },
  stats: {
    wins: 0,
    losses: 0,
    draws: 0,
    gamesPlayed: 0,
    elo: 1200
  },
  created: new Date().toISOString(),
  lastUpdated: new Date().toISOString()
};

/**
 * Main handler (wrapped with Auth0 verification)
 */
async function handler(event, context, user) {
  try {
    // Extract and sanitize auth0_id
    const auth0Id = user.sub;
    if (!auth0Id) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Bad Request',
          message: 'auth0_id (sub) not found in token'
        })
      };
    }

    // Sanitize auth0_id to prevent path traversal
    const sanitizedId = auth0Id.replace(/[^a-zA-Z0-9|_-]/g, '_');

    // GitHub API configuration
    const githubToken = process.env.GITHUB_DB_TOKEN || process.env.GITHUB_PAT;
    if (!githubToken) {
      throw new Error('GitHub token not configured');
    }

    const repoOwner = 'carsontkempf';
    const repoName = 'carsontkempf.github.io';
    const branch = 'db-storage';
    const filePath = `_data/chess/user-profiles/${sanitizedId}.json`;

    // Fetch user profile from GitHub
    const getUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}?ref=${branch}`;

    console.log(`[db-get-user] Fetching profile for ${sanitizedId}`);

    const response = await fetch(getUrl, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${githubToken}`,
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    // Handle 404 - new user
    if (response.status === 404) {
      console.log(`[db-get-user] New user detected: ${sanitizedId}`);
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          profile: DEFAULT_PROFILE,
          isNew: true,
          sha: null
        })
      };
    }

    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[db-get-user] GitHub API error:', errorData);
      throw new Error(errorData.message || 'Failed to fetch profile from GitHub');
    }

    // Parse existing profile
    const data = await response.json();
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    const profile = JSON.parse(content);

    console.log(`[db-get-user] Profile loaded successfully for ${sanitizedId}`);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        profile: profile,
        isNew: false,
        sha: data.sha
      })
    };

  } catch (error) {
    console.error('[db-get-user] Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error.message || 'Failed to retrieve user profile'
      })
    };
  }
}

// Export with Auth0 verification
// Requires "Chess Player" or "Admin" role
module.exports = {
  handler: withAuth(handler, { roles: ['Chess Player', 'Admin'] })
};
