const { withAuth } = require('../lib/auth');
const { managementApiRequest } = require('../lib/management-api');

/**
 * Netlify Function: Get all Auth0 users with their roles
 * Requires: Admin or Root role
 * Method: GET
 */
async function handler(event, context, user) {
  console.log('[auth0-get-users] Handler called');
  console.log('[auth0-get-users] HTTP Method:', event.httpMethod);
  console.log('[auth0-get-users] Headers:', JSON.stringify(event.headers));
  console.log('[auth0-get-users] User:', user ? user.email : 'No user');

  try {
    // Fetch all users (paginated, max 100 per page)
    const usersResponse = await managementApiRequest('/users?per_page=100');

    if (!usersResponse.ok) {
      const error = await usersResponse.text();
      console.error('Error fetching users:', error);
      return {
        statusCode: usersResponse.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://carsontkempf.github.io',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
        },
        body: JSON.stringify({
          error: 'Failed to fetch users from Auth0',
          details: error
        })
      };
    }

    const users = await usersResponse.json();

    // Fetch roles for each user
    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        try {
          const rolesResponse = await managementApiRequest(`/users/${user.user_id}/roles`);

          if (rolesResponse.ok) {
            const roles = await rolesResponse.json();
            return {
              user_id: user.user_id,
              email: user.email,
              name: user.name,
              created_at: user.created_at,
              identities: user.identities,
              roles: roles
            };
          } else {
            // If roles fetch fails, return user without roles
            return {
              user_id: user.user_id,
              email: user.email,
              name: user.name,
              created_at: user.created_at,
              identities: user.identities,
              roles: []
            };
          }
        } catch (error) {
          console.error(`Error fetching roles for user ${user.user_id}:`, error);
          return {
            user_id: user.user_id,
            email: user.email,
            name: user.name,
            created_at: user.created_at,
            identities: user.identities,
            roles: []
          };
        }
      })
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://carsontkempf.github.io',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body: JSON.stringify(usersWithRoles)
    };

  } catch (error) {
    console.error('Error in auth0-get-users:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://carsontkempf.github.io',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
}

// Export with auth middleware - requires Admin or Root role
exports.handler = withAuth(handler, { roles: ['Admin', 'Root'] });
