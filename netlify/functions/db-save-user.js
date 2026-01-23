/**
 * Database Save User Function
 * Saves/updates user profile to GitHub repository (_data/chess/user-profiles/{auth0_id}.json)
 * Uses SHA-based locking to prevent concurrent write conflicts
 */

const { withAuth } = require('../lib/auth');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

/**
 * Validates user profile data
 */
function validateProfile(profile) {
  const errors = [];

  // Validate preferences
  if (profile.preferences) {
    const { ttSizePower, depthPriority, agePriority } = profile.preferences;

    if (ttSizePower !== undefined) {
      if (typeof ttSizePower !== 'number' || ttSizePower < 16 || ttSizePower > 28) {
        errors.push('ttSizePower must be between 16 and 28');
      }
    }

    if (depthPriority !== undefined) {
      if (typeof depthPriority !== 'number' || depthPriority < 1.0 || depthPriority > 3.0) {
        errors.push('depthPriority must be between 1.0 and 3.0');
      }
    }

    if (agePriority !== undefined) {
      if (typeof agePriority !== 'number' || agePriority < 1.0 || agePriority > 2.0) {
        errors.push('agePriority must be between 1.0 and 2.0');
      }
    }
  }

  // Validate stats
  if (profile.stats) {
    const { wins, losses, draws, gamesPlayed, elo } = profile.stats;

    if (wins !== undefined && (typeof wins !== 'number' || wins < 0)) {
      errors.push('wins must be a non-negative number');
    }

    if (losses !== undefined && (typeof losses !== 'number' || losses < 0)) {
      errors.push('losses must be a non-negative number');
    }

    if (draws !== undefined && (typeof draws !== 'number' || draws < 0)) {
      errors.push('draws must be a non-negative number');
    }

    if (gamesPlayed !== undefined && (typeof gamesPlayed !== 'number' || gamesPlayed < 0)) {
      errors.push('gamesPlayed must be a non-negative number');
    }

    if (elo !== undefined && (typeof elo !== 'number' || elo < 0 || elo > 4000)) {
      errors.push('elo must be between 0 and 4000');
    }
  }

  return errors;
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

    const { profile, sha } = body;

    if (!profile) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Bad Request',
          message: 'profile field is required'
        })
      };
    }

    // Validate profile data
    const validationErrors = validateProfile(profile);
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

    // Enrich profile with metadata
    const enrichedProfile = {
      ...profile,
      auth0_id: auth0Id,
      email: user.email || null,
      lastUpdated: new Date().toISOString()
    };

    // If this is a new profile, add created timestamp
    if (!sha) {
      enrichedProfile.created = new Date().toISOString();
    }

    // Prepare content
    const newContent = JSON.stringify(enrichedProfile, null, 2);
    const encodedContent = Buffer.from(newContent).toString('base64');

    // Prepare commit payload
    const payload = {
      message: `Update profile for ${user.email || auth0Id}`,
      content: encodedContent,
      branch: branch,
      committer: {
        name: "Chess Engine Bot",
        email: "chess-bot@carsontkempf.github.io"
      }
    };

    // Add SHA if updating existing file
    if (sha) {
      payload.sha = sha;
    }

    console.log(`[db-save-user] Saving profile for ${sanitizedId}`);

    // Save to GitHub
    const putUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

    const response = await fetch(putUrl, {
      method: 'PUT',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${githubToken}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    // Handle 409 conflict
    if (response.status === 409) {
      console.warn(`[db-save-user] Conflict detected for ${sanitizedId}`);
      return {
        statusCode: 409,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Conflict',
          message: 'Profile has been modified elsewhere. Please refresh and try again.'
        })
      };
    }

    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[db-save-user] GitHub API error:', errorData);
      throw new Error(errorData.message || 'Failed to save profile to GitHub');
    }

    const responseData = await response.json();

    console.log(`[db-save-user] Profile saved successfully for ${sanitizedId}`);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        sha: responseData.content.sha,
        message: 'Profile saved successfully'
      })
    };

  } catch (error) {
    console.error('[db-save-user] Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error.message || 'Failed to save user profile'
      })
    };
  }
}

// Export with Auth0 verification
// Requires "Chess Player" or "Admin" role
module.exports = {
  handler: withAuth(handler, { roles: ['Chess Player', 'Admin'] })
};
