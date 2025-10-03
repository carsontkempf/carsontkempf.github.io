// Netlify serverless function to retrieve an API key.
// This function expects an Authorization header with an Auth0 access token.
// It verifies the token, checks user permissions (basic check here),
// and then returns an API key stored in an environment variable.

const { auth } = require('express-oauth2-jwt-bearer');

// This would be set via Netlify environment variables
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_AUDIENCE_SERVER = process.env.AUTH0_AUDIENCE_SERVER; // This should be the same API Identifier used in client-side auth.js

if (!AUTH0_DOMAIN || !AUTH0_AUDIENCE_SERVER) {
  console.error('CRITICAL: AUTH0_DOMAIN or AUTH0_AUDIENCE_SERVER environment variables are not set for the get-api-key function.');
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
      connection: { remoteAddress: event.headers['x-nf-client-connection-ip'] || 'unknown' }, // for rate limiting if enabled in jwksRsa
      // body: event.body // if needed by middleware
    };
    const res = { // Mock res object
      getHeader: () => {},
      setHeader: (key, value) => { /* store if needed, e.g. for WWW-Authenticate */ },
      send: (body) => resolve({ statusCode: res.statusCode || 200, body }),
      status: (code) => { res.statusCode = code; return res; },
      end: () => resolve({ statusCode: res.statusCode || 204, body: '' })
    };
    const next = (err) => {
      if (err) {
        console.error('JWT validation error:', err.message, err.status, err.code);
        // Map express-oauth2-jwt-bearer errors to appropriate HTTP responses
        let statusCode = err.status || 500;
        if (err.code === 'invalid_token') statusCode = 401;
        if (err.code === 'insufficient_scope') statusCode = 403;

        resolve({
          statusCode: statusCode,
          body: JSON.stringify({ error: err.message || 'Authorization error' })
        });
      } else {
        // If next() is called without error, it means auth succeeded.
        // We don't actually proceed to another "middleware" here,
        // so we resolve indicating success to proceed with function logic.
        resolve({ authenticated: true, user: req.auth }); // req.auth is populated by express-oauth2-jwt-bearer
      }
    };
    middleware(req, res, next);
  });

exports.handler = async (event, context) => {
  if (!jwtCheck) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Authentication service not configured correctly on the server (missing env vars).' })
    };
  }

  try {
    const authResult = await promisifyMiddleware(jwtCheck)(event, context);
    if (!authResult.authenticated) {
      // If not authenticated, authResult itself is the error response
      return authResult;
    }
    // console.log('Authenticated user (from token sub):', authResult.user.payload.sub);

    // Attempt to read the API keys from environment variables
    const googleDriveClientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
    const googleDriveApiKey = process.env.GOOGLE_DRIVE_API_KEY;
    const auth0Domain = process.env.AUTH0_DOMAIN;
    const auth0ClientId = process.env.AUTH0_CLIENT_ID;
    const auth0Audience = process.env.AUTH0_AUDIENCE_SERVER;
    const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
    const appleMusicDeveloperToken = process.env.APPLE_MUSIC_DEVELOPER_TOKEN;

    if (googleDriveClientId && googleDriveApiKey && spotifyClientId) {
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          googleDriveClientId,
          googleDriveApiKey,
          auth0Domain,
          auth0ClientId,
          auth0Audience,
          spotifyClientId,
          appleMusicDeveloperToken
        }),
      };
    } else {
      console.error('CRITICAL: Required API credentials not found in environment variables.');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API credentials not configured on server' }),
      };
    }
  } catch (error) {
    console.error('Unexpected error in get-api-key function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
