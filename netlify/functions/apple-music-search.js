// Apple Music search function for server-side JWT token generation and API search
// This function generates Apple Music Developer Tokens and searches the catalog

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

// The main serverless function handler
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  // Get search parameters from the query string
  const { term: searchTerm, types = 'songs', limit = '25' } = event.queryStringParameters || {};
  
  if (!searchTerm) {
    return { 
      statusCode: 400, 
      headers,
      body: JSON.stringify({ error: 'Missing search term parameter' })
    };
  }

  try {
    const devToken = generateDevToken();
    const searchUrl = `https://api.music.apple.com/v1/catalog/us/search?types=${types}&term=${encodeURIComponent(searchTerm)}&limit=${limit}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${devToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`Apple Music API error: ${response.status} ${response.statusText}`);
      return { 
        statusCode: response.status, 
        headers,
        body: JSON.stringify({ 
          error: `Apple Music API error: ${response.status} ${response.statusText}`,
          searchTerm,
          types
        })
      };
    }

    const data = await response.json();
    
    // Return enriched search results
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        results: data.results,
        searchTerm,
        types,
        limit: parseInt(limit)
      })
    };
    
  } catch (error) {
    console.error('Apple Music search error:', error.message);
    
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ 
        error: 'Apple Music search failed',
        details: error.message,
        searchTerm
      })
    };
  }
};