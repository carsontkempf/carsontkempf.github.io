const jwt = require('jsonwebtoken');

exports.handler = async () => {
  const { APPLE_KEY_ID, APPLE_TEAM_ID, APPLE_PRIVATE_KEY_B64 } = process.env;

  if (!APPLE_KEY_ID || !APPLE_TEAM_ID || !APPLE_PRIVATE_KEY_B64) {
    console.error("Missing Apple credentials in environment variables.");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error: missing Apple credentials.' }),
    };
  }

  // Decode the Base64 key
  const privateKey = Buffer.from(APPLE_PRIVATE_KEY_B64, 'base64').toString('utf8');

  const now = Math.floor(Date.now() / 1000);
  const expiration = now + 3600; // Expires in 1 hour (3600 seconds)

  const header = { alg: 'ES256', kid: APPLE_KEY_ID };
  const payload = { iss: APPLE_TEAM_ID, iat: now, exp: expiration };

  try {
    const token = jwt.sign(payload, privateKey, { header });
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    };
  } catch (error) {
    console.error('JWT Signing Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate developer token.' }),
    };
  }
};