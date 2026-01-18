/**
 * Admin-only protected Netlify Function
 * Only users with 'admin' role can access this endpoint
 */

const { withAuth } = require('../lib/auth');

async function handler(event, context, user) {
  // This code only runs if user has 'admin' role
  console.log('Admin access granted to:', user.email);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Admin access granted',
      adminData: {
        sensitiveInfo: 'Only admins can see this',
        userCount: 42,
        systemStatus: 'operational'
      }
    })
  };
}

// Require 'admin' role
exports.handler = withAuth(handler, { roles: ['admin'] });
