// Netlify function to securely provide Apple Music private key
// This function requires authentication and returns the private key for JWT generation

const { auth } = require('express-oauth2-jwt-bearer');

// Environment variables for Auth0
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_AUDIENCE_SERVER = process.env.AUTH0_AUDIENCE_SERVER;

if (!AUTH0_DOMAIN || !AUTH0_AUDIENCE_SERVER) {
  console.error('CRITICAL: AUTH0_DOMAIN or AUTH0_AUDIENCE_SERVER environment variables are not set for the get-apple-music-key function.');
}

const jwtCheck = AUTH0_DOMAIN && AUTH0_AUDIENCE_SERVER ? auth({
  audience: AUTH0_AUDIENCE_SERVER,
  issuerBaseURL: `https://${AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256'
}) : null;

// Helper to adapt Netlify event/context to Express-like req/res for the middleware
const promisifyMiddleware = (middleware) => (event, context) =>
  new Promise((resolve, reject) => {
    const req = {
      headers: event.headers,
      method: event.httpMethod,
      url: event.path,
      connection: { remoteAddress: event.headers['x-nf-client-connection-ip'] || 'unknown' }
    };
    const res = {
      getHeader: () => {},
      setHeader: (key, value) => {},
      send: (body) => resolve({ statusCode: res.statusCode || 200, body }),
      status: (code) => { res.statusCode = code; return res; },
      end: () => resolve({ statusCode: res.statusCode || 204, body: '' })
    };
    const next = (err) => {
      if (err) {
        console.error('JWT validation error:', err.message, err.status, err.code);
        let statusCode = err.status || 500;
        if (err.code === 'invalid_token') statusCode = 401;
        if (err.code === 'insufficient_scope') statusCode = 403;

        resolve({
          statusCode: statusCode,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: err.message || 'Authorization error' })
        });
      } else {
        resolve({ authenticated: true, user: req.auth });
      }
    };
    middleware(req, res, next);
  });

exports.handler = async (event, context) => {
  // Check if auth is configured
  if (!jwtCheck) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Authentication service not configured correctly on the server (missing env vars).' })
    };
  }

  try {
    // Verify authentication
    const authResult = await promisifyMiddleware(jwtCheck)(event, context);
    if (!authResult.authenticated) {
      return authResult;
    }

    // Check if Apple Music private key is available
    const privateKey = process.env.APPLE_MUSIC_PRIVATE_KEY;
    
    if (!privateKey) {
      console.error('CRITICAL: APPLE_MUSIC_PRIVATE_KEY environment variable not set.');
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Apple Music private key not configured on server' }),
      };
    }

    // Return the private key securely
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        privateKey: privateKey,
        keyId: process.env.APPLE_KEY_ID || 'F9Q8YRKX3T',
        teamId: process.env.APPLE_TEAM_ID || '5S855HB895'
      }),
    };

  } catch (error) {
    console.error('Unexpected error in get-apple-music-key function:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};