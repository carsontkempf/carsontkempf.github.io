const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Configuration
const TEAM_ID = '5S855HB895';
const KEY_ID = 'T5ZX676QRQ';
const PRIVATE_KEY_PATH = path.join(__dirname, '..', '_data', 'AuthKey_T5ZX676QRQ.p8');

// Read the private key
const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');

// Token expires in 6 months (maximum allowed by Apple)
const iat = Math.floor(Date.now() / 1000); // Current timestamp
const exp = iat + (6 * 30 * 24 * 60 * 60); // 6 months from now

// Generate the token
const token = jwt.sign({}, privateKey, {
    algorithm: 'ES256',
    expiresIn: '180d', // 6 months
    issuer: TEAM_ID,
    header: {
        alg: 'ES256',
        kid: KEY_ID
    }
});

console.log('========================================');
console.log('Apple Music Developer Token Generated');
console.log('========================================');
console.log('\nToken:');
console.log(token);
console.log('\nIssued at:', new Date(iat * 1000).toISOString());
console.log('Expires at:', new Date(exp * 1000).toISOString());
console.log('\nAdd this to your .netlify_env file as:');
console.log('APPLE_MUSIC_DEVELOPER_TOKEN=' + token);
console.log('========================================\n');
