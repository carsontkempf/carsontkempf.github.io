const { withAuth } = require('../lib/auth');
const { managementApiRequest } = require('../lib/management-api');

/**
 * Netlify Function: Remove a role from a user
 * Requires: Admin or Root role
 * Method: POST
 * Body: { email: string, roleId: string }
 */
async function handler(event, context, user) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { email, roleId } = JSON.parse(event.body);

    // Validate input
    if (!email || !roleId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://carsontkempf.github.io',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
        },
        body: JSON.stringify({
          error: 'Missing required fields',
          message: 'Both email and roleId are required'
        })
      };
    }

    // Get user by email
    const userResponse = await managementApiRequest(`/users-by-email?email=${encodeURIComponent(email)}`);

    if (!userResponse.ok) {
      const error = await userResponse.text();
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://carsontkempf.github.io',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
        },
        body: JSON.stringify({
          error: 'User not found',
          details: error
        })
      };
    }

    const users = await userResponse.json();

    if (!users || users.length === 0) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://carsontkempf.github.io',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
        },
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    const userId = users[0].user_id;

    // Remove role from user
    const removeResponse = await managementApiRequest(`/users/${userId}/roles`, {
      method: 'DELETE',
      body: JSON.stringify({ roles: [roleId] })
    });

    if (!removeResponse.ok) {
      const error = await removeResponse.text();
      console.error('Error removing role:', error);
      return {
        statusCode: removeResponse.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://carsontkempf.github.io',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
        },
        body: JSON.stringify({
          error: 'Failed to remove role',
          details: error
        })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: `Role successfully removed from ${email}`
      })
    };

  } catch (error) {
    console.error('Error in auth0-remove-role:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
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
