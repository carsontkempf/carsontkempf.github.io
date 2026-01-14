#!/usr/bin/env node

const fs = require('fs');
const jwt = require('jsonwebtoken');

// Read the private key from .p8 file
const privateKey = fs.readFileSync('./_data/AuthKey_T5ZX676QRQ.p8', 'utf8');

// Your Apple Developer credentials
const teamId = '5S855HB895';
const keyId = 'T5ZX676QRQ';

// Generate the JWT token
const token = jwt.sign({}, privateKey, {
  algorithm: 'ES256',
  expiresIn: '180d', // 6 months (Apple's max)
  issuer: teamId,
  header: {
    alg: 'ES256',
    kid: keyId
  }
});

console.log('\nApple Music Developer Token:');
console.log('-'.repeat(80));
console.log(token);
console.log('-'.repeat(80));
console.log('\nCopy this token to _config.yml under apple_music.developer_token');
console.log('Token expires in 180 days\n');
