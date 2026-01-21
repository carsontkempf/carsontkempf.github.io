const { withAuth } = require('../lib/auth');
const { managementApiRequest } = require('../lib/management-api');

/**
 * Netlify Function: Get all Auth0 roles
 * Requires: Admin or Root role
 * Method: GET
 */
async function handler(event, context, user) {
  try {
    const rolesResponse = await managementApiRequest('/roles');

    if (!rolesResponse.ok) {
      const error = await rolesResponse.text();
      console.error('Error fetching roles:', error);
      return {
        statusCode: rolesResponse.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Failed to fetch roles from Auth0',
          details: error
        })
      };
    }

    const roles = await rolesResponse.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(roles)
    };

  } catch (error) {
    console.error('Error in auth0-get-roles:', error);
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
