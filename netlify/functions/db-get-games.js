/**
 * Database Get Games Function
 * Fetches all games for authenticated user from games-history.json
 * Returns filtered list of games matching user's auth0_id
 */

const { withAuth } = require('../lib/auth');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json'
};

/**
 * Main handler (wrapped with Auth0 verification)
 */
async function handler(event, context, user) {
  try {
    const auth0Id = user.sub;

    // GitHub configuration
    const githubToken = process.env.GITHUB_DB_TOKEN;
    const repoOwner = 'carsontkempf';
    const repoName = 'carsontkempf.github.io';
    const branch = 'db-storage';
    const filePath = '_data/chess/games-history.json';

    // Fetch games-history.json from GitHub
    const getUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}?ref=${branch}`;

    const response = await fetch(getUrl, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${githubToken}`,
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    // Handle file not found (empty history)
    if (response.status === 404) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          games: [],
          count: 0
        })
      };
    }

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    let allGames;

    try {
      allGames = JSON.parse(content);
    } catch (parseError) {
      console.error('[db-get-games] JSON parse error:', parseError);
      // Return empty array if JSON is corrupted
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          games: [],
          count: 0,
          warning: 'Failed to parse game history'
        })
      };
    }

    // Filter games by auth0_id
    const userGames = allGames.filter(game => game.auth0_id === auth0Id);

    // Sort by timestamp (newest first)
    userGames.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateB - dateA;
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        games: userGames,
        count: userGames.length
      })
    };

  } catch (error) {
    console.error('[db-get-games] Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error.message
      })
    };
  }
}

/**
 * Handle OPTIONS requests (CORS preflight)
 */
function handleOptions() {
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: ''
  };
}

/**
 * Export handler with Auth0 middleware
 * Requires Chess Player or Admin role
 */
module.exports = {
  handler: async (event, context) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return handleOptions();
    }

    // Wrap with Auth0 authentication
    const authHandler = withAuth(handler, { roles: ['Chess Player', 'Admin'] });
    return authHandler(event, context);
  }
};
