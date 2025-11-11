const jwt = require('jsonwebtoken');

// Helper function to generate the Developer Token
function generateDevToken() {
  const { APPLE_KEY_ID, APPLE_TEAM_ID, APPLE_PRIVATE_KEY_B64 } = process.env;

  if (!APPLE_KEY_ID || !APPLE_TEAM_ID || !APPLE_PRIVATE_KEY_B64) {
    throw new Error('Missing Apple credentials in environment variables');
  }

  // Decode the Base64 key
  const privateKey = Buffer.from(APPLE_PRIVATE_KEY_B64, 'base64').toString('utf8');

  const now = Math.floor(Date.now() / 1000);
  const expiration = now + 3600; // Expires in 1 hour

  const header = { alg: 'ES256', kid: APPLE_KEY_ID };
  const payload = { iss: APPLE_TEAM_ID, iat: now, exp: expiration };

  return jwt.sign(payload, privateKey, { header });
}

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Music-User-Token',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'POST' && event.httpMethod !== 'PUT') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed. Use POST or PUT.' })
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { songIds, userToken } = body;

    if (!songIds || !Array.isArray(songIds) || songIds.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'songIds array is required and must not be empty' })
      };
    }

    if (!userToken) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'userToken is required for library modifications' })
      };
    }

    const devToken = generateDevToken();
    
    // Apple Music API endpoint to add songs to library
    const addToLibraryUrl = 'https://api.music.apple.com/v1/me/library';
    
    const requestBody = {
      data: songIds.map(id => ({
        id: id,
        type: 'songs'
      }))
    };

    const response = await fetch(addToLibraryUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${devToken}`,
        'Music-User-Token': userToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Apple Music API error: ${response.status} ${response.statusText}`, errorText);
      
      if (response.status === 403) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ 
            error: 'Forbidden: Invalid user token or insufficient permissions',
            details: 'Make sure the user is authenticated and has authorized your app'
          })
        };
      }

      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: `Apple Music API error: ${response.status} ${response.statusText}`,
          details: errorText
        })
      };
    }

    const result = response.status === 204 ? { success: true } : await response.json();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: `Successfully added ${songIds.length} song(s) to library`,
        songIds,
        result
      })
    };
    
  } catch (error) {
    console.error('Add to library error:', error.message);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to add songs to library',
        details: error.message
      })
    };
  }
};