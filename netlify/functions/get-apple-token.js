const jwt = require('jsonwebtoken');

exports.handler = async function(event, context) {
  try {
    // 1. Get vars
    const teamId = process.env.APPLE_TEAM_ID;
    const keyId = process.env.APPLE_KEY_ID;
    // Handle both raw text or base64, and fix newlines
    let privateKey = process.env.APPLE_P8_KEY;

    if (!teamId || !keyId || !privateKey) {
      return { statusCode: 500, body: "Missing Environment Variables" };
    }

    // 2. Format Key: Ensure standard PEM format with correct line breaks
    // If user pasted "one long line", this puts the headers/footers on their own lines
    privateKey = privateKey.replace(/\\n/g, '\n');

    if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
        // If the variable doesn't have headers, maybe it's just the body or B64
        // Let's assume standard PEM format for now as per instructions
        return { statusCode: 500, body: "APPLE_P8_KEY is not in PEM format" };
    }

    // 3. Generate JWT
    const token = jwt.sign({}, privateKey, {
      algorithm: 'ES256',
      expiresIn: '180d', // Max 6 months
      issuer: teamId,
      header: {
        alg: 'ES256',
        kid: keyId
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ token: token })
    };

  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  }
};
