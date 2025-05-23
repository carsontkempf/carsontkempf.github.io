// Netlify serverless function to retrieve an API key.
// This function expects an Authorization header with an Auth0 access token.
// It verifies the token (TODO), checks user permissions (TODO),
// and then returns an API key stored in an environment variable.

exports.handler = async (event, context) => {
  try {
    // Check for Authorization header and extract token
    const authHeader = event.headers.authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Unauthorized - No token provided' }),
      };
    }

    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0].toLowerCase() !== 'bearer') {
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Unauthorized - Invalid token format' }),
      };
    }
    const accessToken = tokenParts[1];

    // TODO: Add Auth0 token verification logic here
    // This would involve using a library like 'jsonwebtoken' and your Auth0 public key
    // to verify the signature and claims of the accessToken.

    // TODO: Add user role/permission check logic here
    // After verifying the token, you would typically check if the user
    // associated with the token has the necessary roles or permissions
    // to access this function and retrieve an API key.

    // Attempt to read the API key from environment variables
    const apiKey = process.env.USER_API_KEY;

    if (apiKey) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ apiKey: apiKey }),
      };
    } else {
      console.error('USER_API_KEY not found in environment variables.');
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'API key not configured on server' }),
      };
    }
  } catch (error) {
    console.error('Error in get-api-key function:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
