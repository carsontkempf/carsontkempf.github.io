// Get GitHub Personal Access Token
// Protected: Requires Auth0 authentication + Admin or Writer role

const { withAuth } = require('../lib/auth');

async function handler(event, context, user) {
  try {
    const githubPat = process.env.GITHUB_PAT;

    if (!githubPat) {
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://carsontkempf.github.io',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
        },
        body: JSON.stringify({
          error: 'Configuration Error',
          message: 'GITHUB_PAT environment variable not set'
        })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://carsontkempf.github.io',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: JSON.stringify({
        token: githubPat,
        user: user.email
      })
    };

  } catch (err) {
    console.error('Error fetching GitHub token:', err);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://carsontkempf.github.io',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: JSON.stringify({
        error: 'Server Error',
        message: err.message
      })
    };
  }
}

// Export with auth middleware - only Admin or Writer roles can access
module.exports = {
  handler: withAuth(handler, { roles: ['Admin', 'Writer'] })
};
