/**
 * Apple Music JWT Token Generator
 * Generates properly formatted JWT tokens for Apple Music API authentication
 */

class AppleMusicJWT {
    constructor(teamId, keyId, privateKey) {
        this.teamId = teamId;     // 10-character Team ID from Apple Developer account
        this.keyId = keyId;       // 10-character Key ID from your MusicKit private key
        this.privateKey = privateKey; // Private key content (.p8 file)
    }

    /**
     * Generate a properly formatted JWT token for Apple Music API
     * @param {number} expirationHours - Token expiration in hours (default: 24, max: 4320 = 6 months)
     * @param {string[]} origins - Optional array of allowed origins for web apps
     * @returns {string} JWT token
     */
    async generateToken(expirationHours = 24, origins = null) {
        // Validate inputs
        if (!this.teamId || this.teamId.length !== 10) {
            throw new Error('Team ID must be exactly 10 characters');
        }
        if (!this.keyId || this.keyId.length !== 10) {
            throw new Error('Key ID must be exactly 10 characters');
        }
        if (!this.privateKey) {
            throw new Error('Private key is required');
        }

        // Calculate timestamps
        const now = Math.floor(Date.now() / 1000);
        const maxExpiration = now + (15777000); // 6 months max per Apple
        const requestedExpiration = now + (expirationHours * 3600);
        const expiration = Math.min(requestedExpiration, maxExpiration);

        // JWT Header - MUST use ES256 algorithm
        const header = {
            alg: "ES256",  // Required: ECDSA using P-256 and SHA-256
            kid: this.keyId // Required: 10-character Key ID
        };

        // JWT Payload (Claims)
        const payload = {
            iss: this.teamId,    // Required: 10-character Team ID
            iat: now,            // Required: Issued at time (Unix timestamp)
            exp: expiration      // Required: Expiration time (Unix timestamp)
        };

        // Add origin claim for web applications (optional but recommended)
        if (origins && Array.isArray(origins) && origins.length > 0) {
            payload.origin = origins;
        }

        try {
            // Import the private key for ES256 signing
            const privateKeyObject = await this.importPrivateKey(this.privateKey);
            
            // Create and sign the JWT
            const token = await this.signJWT(header, payload, privateKeyObject);
            
            return token;
        } catch (error) {
            throw new Error(`Failed to generate JWT token: ${error.message}`);
        }
    }

    /**
     * Import private key for ES256 signing
     * @param {string} privateKeyPem - Private key in PEM format
     * @returns {CryptoKey} Imported private key
     */
    async importPrivateKey(privateKeyPem) {
        // Clean the private key format
        let cleanKey = privateKeyPem
            .replace(/-----BEGIN PRIVATE KEY-----/, '')
            .replace(/-----END PRIVATE KEY-----/, '')
            .replace(/\s/g, '');

        try {
            // Convert base64 to ArrayBuffer
            const keyData = Uint8Array.from(atob(cleanKey), c => c.charCodeAt(0));
            
            // Import the key for ES256 signing
            return await crypto.subtle.importKey(
                'pkcs8',
                keyData,
                {
                    name: 'ECDSA',
                    namedCurve: 'P-256'
                },
                false,
                ['sign']
            );
        } catch (error) {
            throw new Error(`Invalid private key format: ${error.message}`);
        }
    }

    /**
     * Sign JWT using ES256 algorithm
     * @param {object} header - JWT header
     * @param {object} payload - JWT payload
     * @param {CryptoKey} privateKey - Private key for signing
     * @returns {string} Signed JWT token
     */
    async signJWT(header, payload, privateKey) {
        // Encode header and payload
        const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
        const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
        
        // Create signing input
        const signingInput = `${encodedHeader}.${encodedPayload}`;
        const signingInputBuffer = new TextEncoder().encode(signingInput);
        
        // Sign with ES256
        const signature = await crypto.subtle.sign(
            {
                name: 'ECDSA',
                hash: 'SHA-256'
            },
            privateKey,
            signingInputBuffer
        );
        
        // Encode signature
        const encodedSignature = this.base64UrlEncode(signature);
        
        // Return complete JWT
        return `${signingInput}.${encodedSignature}`;
    }

    /**
     * Base64 URL-safe encoding
     * @param {string|ArrayBuffer} data - Data to encode
     * @returns {string} Base64 URL-safe encoded string
     */
    base64UrlEncode(data) {
        let base64;
        
        if (typeof data === 'string') {
            base64 = btoa(data);
        } else {
            // ArrayBuffer
            const bytes = new Uint8Array(data);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            base64 = btoa(binary);
        }
        
        // Convert to URL-safe format
        return base64
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    /**
     * Validate token format and claims
     * @param {string} token - JWT token to validate
     * @returns {object} Decoded token information
     */
    validateTokenFormat(token) {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid JWT format: must have 3 parts');
        }

        try {
            const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            
            // Validate required fields
            if (header.alg !== 'ES256') {
                throw new Error('Invalid algorithm: must be ES256');
            }
            if (!header.kid || header.kid.length !== 10) {
                throw new Error('Invalid Key ID: must be 10 characters');
            }
            if (!payload.iss || payload.iss.length !== 10) {
                throw new Error('Invalid Team ID: must be 10 characters');
            }
            if (!payload.iat || !payload.exp) {
                throw new Error('Missing required claims: iat and exp are required');
            }
            
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp <= now) {
                throw new Error('Token has expired');
            }
            if (payload.iat > now + 60) { // Allow 60 seconds clock skew
                throw new Error('Token issued in the future');
            }
            
            return { header, payload, isValid: true };
        } catch (error) {
            throw new Error(`Token validation failed: ${error.message}`);
        }
    }
}

// Usage example and helper functions
const AppleMusicAuth = {
    /**
     * Create a new JWT token for Apple Music API
     * @param {string} teamId - 10-character Team ID
     * @param {string} keyId - 10-character Key ID  
     * @param {string} privateKey - Private key content
     * @param {object} options - Additional options
     * @returns {Promise<string>} JWT token
     */
    async createToken(teamId, keyId, privateKey, options = {}) {
        const {
            expirationHours = 24,
            origins = null
        } = options;
        
        const jwt = new AppleMusicJWT(teamId, keyId, privateKey);
        return await jwt.generateToken(expirationHours, origins);
    },

    /**
     * Test Apple Music API connection with generated token
     * @param {string} token - JWT token
     * @returns {Promise<object>} API response
     */
    async testConnection(token) {
        try {
            const response = await fetch('https://api.music.apple.com/v1/catalog/us/songs/203709340', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API request failed: ${response.status} - ${errorText}`);
            }
            
            return await response.json();
        } catch (error) {
            throw new Error(`Connection test failed: ${error.message}`);
        }
    }
};

/**
 * Apple Music Service with Netlify Integration
 * Uses environment configuration to generate tokens automatically
 */
class AppleMusicService {
    constructor() {
        this.token = null;
        this.tokenExpiry = null;
        this.credentials = {
            teamId: '5S855HB895',  // Your Apple Team ID
            keyId: 'F9Q8YRKX3T',   // Your Apple Key ID
            privateKey: null       // Will be loaded from config
        };
    }

    /**
     * Initialize service with credentials from environment config
     */
    async initialize() {
        try {
            // Wait for environment config to be ready
            if (!window.envConfig?.initialized) {
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => reject(new Error('Config timeout')), 5000);
                    
                    window.addEventListener('configReady', () => {
                        clearTimeout(timeout);
                        resolve();
                    }, { once: true });
                    
                    window.addEventListener('configError', (e) => {
                        clearTimeout(timeout);
                        reject(new Error(e.detail.error));
                    }, { once: true });
                });
            }

            // Try to get Apple Music private key from Netlify function
            await this.loadPrivateKeyFromNetlify();
            
            console.log('✅ Apple Music Service initialized');
            return true;
        } catch (error) {
            console.warn('⚠️ Apple Music Service initialization failed:', error.message);
            // Continue with fallback method
            return false;
        }
    }

    /**
     * Load private key from Netlify function
     */
    async loadPrivateKeyFromNetlify() {
        try {
            let headers = {};
            if (window.authService?.isAuthenticated) {
                const token = await window.authService.client.getTokenSilently();
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('/.netlify/functions/get-apple-music-key', { headers });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            this.credentials.privateKey = data.privateKey;
            
            console.log('🔑 Apple Music private key loaded from Netlify');
        } catch (error) {
            throw new Error(`Failed to load Apple Music private key: ${error.message}`);
        }
    }

    /**
     * Get or generate a valid Apple Music developer token
     */
    async getDeveloperToken() {
        // Check if current token is still valid
        if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry - 300000) { // 5 min buffer
            return this.token;
        }

        // Generate new token
        if (!this.credentials.privateKey) {
            const initialized = await this.initialize();
            if (!initialized) {
                throw new Error('Apple Music Service not properly initialized');
            }
        }

        try {
            const jwt = new AppleMusicJWT(
                this.credentials.teamId,
                this.credentials.keyId,
                this.credentials.privateKey
            );

            this.token = await jwt.generateToken(24); // 24 hour expiration
            this.tokenExpiry = Date.now() + (23 * 60 * 60 * 1000); // 23 hours

            console.log('🎵 New Apple Music developer token generated');
            return this.token;
        } catch (error) {
            throw new Error(`Failed to generate Apple Music token: ${error.message}`);
        }
    }

    /**
     * Test Apple Music API connection
     */
    async testConnection() {
        try {
            const token = await this.getDeveloperToken();
            return await AppleMusicAuth.testConnection(token);
        } catch (error) {
            throw new Error(`Apple Music connection test failed: ${error.message}`);
        }
    }

    /**
     * Search Apple Music catalog
     */
    async search(query, types = ['songs'], limit = 10) {
        try {
            const token = await this.getDeveloperToken();
            const typesParam = types.join(',');
            
            const response = await fetch(
                `https://api.music.apple.com/v1/catalog/us/search?term=${encodeURIComponent(query)}&types=${typesParam}&limit=${limit}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Search failed: ${response.status} - ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            throw new Error(`Apple Music search failed: ${error.message}`);
        }
    }

    /**
     * Get album details
     */
    async getAlbum(albumId) {
        try {
            const token = await this.getDeveloperToken();
            
            const response = await fetch(
                `https://api.music.apple.com/v1/catalog/us/albums/${albumId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Get album failed: ${response.status} - ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            throw new Error(`Failed to get album: ${error.message}`);
        }
    }
}

// Create global Apple Music service instance
window.appleMusicService = new AppleMusicService();

// Auto-initialize when config is ready
window.addEventListener('configReady', async () => {
    try {
        await window.appleMusicService.initialize();
    } catch (error) {
        console.warn('Failed to auto-initialize Apple Music service:', error.message);
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AppleMusicJWT, AppleMusicAuth, AppleMusicService };
}