// Auth0 JWT verification helper for Netlify Functions
// Based on Netlify documentation: https://docs.netlify.com/platform/integrations/auth0/

const { createRemoteJWKSet, jwtVerify } = require("jose");

// Cache the JWKS for performance
let jwksCache = null;

/**
 * Verifies an Auth0 JWT token from the Authorization header
 * @param {Request|Object} request - Netlify event or Request object
 * @returns {Promise<Object>} Verified JWT payload with user info and roles
 * @throws {Error} If token is invalid or missing
 */
async function verifyAuth0Token(request) {
  // Handle both Netlify event format and Request objects
  const headers = request.headers || {};
  const authorization = typeof headers.get === 'function'
    ? headers.get("Authorization")
    : headers.authorization || headers.Authorization || "";

  const [type, token] = authorization.trim().split(" ");

  if (type !== "Bearer") {
    throw new Error("Invalid Authorization header - expected Bearer token");
  }

  if (!token) {
    throw new Error("No token provided in Authorization header");
  }

  // Initialize JWKS if not cached
  if (!jwksCache) {
    const issuer = process.env.AUTH0_ISSUER || `https://${process.env.AUTH0_DOMAIN}/`;
    jwksCache = createRemoteJWKSet(
      new URL(".well-known/jwks.json", issuer)
    );
  }

  // Verify the JWT
  const issuer = process.env.AUTH0_ISSUER || `https://${process.env.AUTH0_DOMAIN}/`;
  const audience = process.env.AUTH0_AUDIENCE_SERVER;

  const { payload } = await jwtVerify(token, jwksCache, {
    issuer: issuer,
    audience: audience,
  });

  return payload;
}

/**
 * Checks if user has required role(s) - case-insensitive
 * Roles are expected in the JWT payload under namespace/roles
 * @param {Object} payload - Verified JWT payload
 * @param {string|string[]} requiredRoles - Single role or array of roles (user needs at least one)
 * @returns {boolean} True if user has at least one of the required roles
 */
function hasRole(payload, requiredRoles) {
  // Auth0 custom claims use namespaced keys
  // Common patterns: 'https://yourapp.com/roles' or metadata fields
  const roles = payload['https://carsontkempf.github.io/roles']
    || payload['roles']
    || payload['user_metadata']?.roles
    || payload['app_metadata']?.roles
    || [];

  if (!Array.isArray(roles)) {
    return false;
  }

  const required = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  // Case-insensitive comparison
  const rolesLower = roles.map(r => String(r).toLowerCase());
  return required.some(role => rolesLower.includes(String(role).toLowerCase()));
}

/**
 * Middleware wrapper for Netlify Functions
 * Verifies token and optionally checks roles
 * @param {Function} handler - Your function handler (receives event, context, user)
 * @param {Object} options - Options: { roles: string[] } for role checking
 * @returns {Function} Wrapped Netlify function handler
 */
function withAuth(handler, options = {}) {
  return async (event, context) => {
    // Handle CORS preflight (OPTIONS) requests
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': 'https://carsontkempf.github.io',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        },
        body: ''
      };
    }

    try {
      // Verify the token
      const payload = await verifyAuth0Token(event);

      // Check roles if specified
      if (options.roles && options.roles.length > 0) {
        if (!hasRole(payload, options.roles)) {
          return {
            statusCode: 403,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': 'https://carsontkempf.github.io',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: JSON.stringify({
              error: 'Forbidden',
              message: 'You do not have permission to access this resource'
            })
          };
        }
      }

      // Call the actual handler with verified user info
      return await handler(event, context, payload);

    } catch (error) {
      console.error('Auth error:', error.message);
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://carsontkempf.github.io',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        },
        body: JSON.stringify({
          error: 'Unauthorized',
          message: error.message || 'Invalid or missing authentication token'
        })
      };
    }
  };
}

module.exports = {
  verifyAuth0Token,
  hasRole,
  withAuth
};
