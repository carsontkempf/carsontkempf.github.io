/**
 * Example protected Netlify Function with role-based access control
 *
 * This function demonstrates:
 * 1. JWT token verification
 * 2. Role-based authorization
 * 3. Proper error handling
 *
 * Frontend usage:
 *   const token = await auth0Client.getTokenSilently();
 *   const response = await fetch('/.netlify/functions/protected-example', {
 *     headers: { 'Authorization': `Bearer ${token}` }
 *   });
 */

const { withAuth } = require('../lib/auth');

// Your actual function logic - receives verified user payload
async function handler(event, context, user) {
  // user object contains verified JWT payload with user info and roles
  console.log('Authenticated user:', user.sub);
  console.log('User roles:', user['https://carsontkempf.github.io/roles'] || user.roles);

  // Example: Different responses based on HTTP method
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Access granted to protected resource',
        user: {
          id: user.sub,
          email: user.email,
          roles: user['https://carsontkempf.github.io/roles'] || user.roles || []
        },
        data: {
          secret: 'This is protected data only visible to authenticated users'
        }
      })
    };
  }

  return {
    statusCode: 405,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ error: 'Method not allowed' })
  };
}

// Export with auth middleware
// No roles specified = any authenticated user can access
exports.handler = withAuth(handler);

// For role-restricted endpoints, use:
// exports.handler = withAuth(handler, { roles: ['admin'] });
// exports.handler = withAuth(handler, { roles: ['admin', 'editor'] }); // admin OR editor
