const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Get Apple Music credentials from environment variables
    const keyId = process.env.APPLE_KEY_ID || 'F9Q8YRKX3T';
    const teamId = process.env.APPLE_TEAM_ID || '5S855HB895';
    const privateKey = process.env.APPLE_PRIVATE_KEY_B64 
      ? Buffer.from(process.env.APPLE_PRIVATE_KEY_B64, 'base64').toString('ascii')
      : `-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgcl9PiirEqKTJUTIe
JoZ9GsZoeuKnA4uZwESXe2p1UjagCgYIKoZIzj0DAQehRANCAASJmZZx1CJ4snvS
UFDJBDw5qZC8uzGc2F4e5v1rAdBzNofWeAce76/4IX5q2TsD1fomTiRST08/TAzp
EW2Of+Hx
-----END PRIVATE KEY-----`;

    // Generate JWT token
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: teamId,
      iat: now,
      exp: now + 15777000 // 6 months
    };

    const token = jwt.sign(payload, privateKey, {
      algorithm: 'ES256',
      header: {
        alg: 'ES256',
        kid: keyId
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        token: token,
        keyId: keyId,
        teamId: teamId
      })
    };

  } catch (error) {
    console.error('Apple Music JWT generation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to generate Apple Music token',
        details: error.message
      })
    };
  }
};