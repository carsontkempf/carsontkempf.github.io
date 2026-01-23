/**
 * Database Save Game Function
 * Appends game data to GitHub repository (_data/chess/games-history.json)
 * Handles concurrent writes with exponential backoff retry logic
 */

const { withAuth } = require('../lib/auth');
const { v4: uuidv4 } = require('uuid');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

/**
 * Validates game data
 */
function validateGame(game) {
  const errors = [];

  if (!game.timestamp) {
    errors.push('timestamp is required');
  }

  if (!game.result || !['win', 'loss', 'draw', 'abandoned'].includes(game.result)) {
    errors.push('result must be one of: win, loss, draw, abandoned');
  }

  if (!game.userColor || !['white', 'black'].includes(game.userColor)) {
    errors.push('userColor must be white or black');
  }

  if (!game.finalPosition) {
    errors.push('finalPosition (FEN) is required');
  }

  return errors;
}

/**
 * Retry with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      // Don't retry on non-conflict errors
      if (error.code !== 'CONFLICT' || attempt === maxRetries - 1) {
        throw error;
      }

      // Exponential backoff: 100ms, 200ms, 400ms
      const delay = 100 * Math.pow(2, attempt);
      console.log(`[db-save-game] Conflict detected, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Main handler (wrapped with Auth0 verification)
 */
async function handler(event, context, user) {
  try {
    // Parse request body
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Bad Request',
          message: 'Invalid JSON in request body'
        })
      };
    }

    const gameData = body;

    // Validate game data
    const validationErrors = validateGame(gameData);
    if (validationErrors.length > 0) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Validation Failed',
          details: validationErrors
        })
      };
    }

    // Extract auth0_id
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

    // Enrich game data
    const enrichedGame = {
      id: uuidv4(),
      auth0_id: auth0Id,
      ...gameData,
      savedAt: new Date().toISOString()
    };

    // GitHub API configuration
    const githubToken = process.env.GITHUB_DB_TOKEN || process.env.GITHUB_PAT;
    if (!githubToken) {
      throw new Error('GitHub token not configured');
    }

    const repoOwner = 'carsontkempf';
    const repoName = 'carsontkempf.github.io';
    const branch = 'db-storage';
    const filePath = '_data/chess/games-history.json';

    // Retry logic for handling concurrent writes
    const result = await retryWithBackoff(async (attempt) => {
      console.log(`[db-save-game] Saving game (attempt ${attempt + 1})`);

      // Fetch current games-history.json
      const getUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}?ref=${branch}`;

      const getResponse = await fetch(getUrl, {
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${githubToken}`,
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

      let currentGames = [];
      let currentSha = null;

      if (getResponse.status === 200) {
        const data = await getResponse.json();
        currentSha = data.sha;
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        currentGames = JSON.parse(content);
      } else if (getResponse.status === 404) {
        // File doesn't exist yet, will create
        console.log('[db-save-game] games-history.json not found, creating new file');
        currentGames = [];
      } else {
        throw new Error('Failed to fetch games history from GitHub');
      }

      // Append new game
      currentGames.push(enrichedGame);

      // Prepare content
      const newContent = JSON.stringify(currentGames, null, 2);
      const encodedContent = Buffer.from(newContent).toString('base64');

      // Prepare commit payload
      const payload = {
        message: `Add game ${enrichedGame.id} for ${user.email || auth0Id}`,
        content: encodedContent,
        branch: branch,
        committer: {
          name: "Chess Engine Bot",
          email: "chess-bot@carsontkempf.github.io"
        }
      };

      // Add SHA if file exists
      if (currentSha) {
        payload.sha = currentSha;
      }

      // Save to GitHub
      const putUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

      const putResponse = await fetch(putUrl, {
        method: 'PUT',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${githubToken}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // Handle 409 conflict - trigger retry
      if (putResponse.status === 409) {
        const error = new Error('Conflict detected');
        error.code = 'CONFLICT';
        throw error;
      }

      // Handle other errors
      if (!putResponse.ok) {
        const errorData = await putResponse.json().catch(() => ({}));
        console.error('[db-save-game] GitHub API error:', errorData);
        throw new Error(errorData.message || 'Failed to save game to GitHub');
      }

      const responseData = await putResponse.json();

      console.log(`[db-save-game] Game saved successfully: ${enrichedGame.id}`);

      return {
        success: true,
        gameId: enrichedGame.id,
        sha: responseData.content.sha,
        attemptNumber: attempt + 1
      };
    });

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('[db-save-game] Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error.message || 'Failed to save game'
      })
    };
  }
}

// Export with Auth0 verification
// Requires "Chess Player" or "Admin" role
module.exports = {
  handler: withAuth(handler, { roles: ['Chess Player', 'Admin'] })
};
