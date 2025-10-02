/**
 * Environment Configuration Handler
 * Securely loads API credentials from environment variables or secure sources
 */
class EnvironmentConfig {
    constructor() {
        this.config = {};
        this.initialized = false;
    }

    /**
     * Initialize configuration from various secure sources
     */
    async initialize() {
        // Skip Netlify function for now since it's not deployed
        // TODO: Re-enable this once Netlify function is deployed
        const skipNetlifyFunction = true;
        
        if (!skipNetlifyFunction) {
            try {
                // Method 1: Try to load from Netlify Functions (most secure for production)
                await this.loadFromNetlifyFunction();
                this.initialized = true;
                console.log('Environment configuration initialized');
                return;
            } catch (error) {
                console.warn('Failed to load from Netlify function:', error.message);
            }
        }
        
        try {
            // Method 2: Try Jekyll/site configuration as fallback
            await this.loadFromSiteConfig();
        } catch (siteError) {
            console.warn('Failed to load from site config:', siteError.message);
            
            // Method 3: Final fallback to environment variables (for local development)
            this.loadFromEnvironment();
        }
        
        this.initialized = true;
        console.log('Environment configuration initialized');
    }

    /**
     * Load configuration from Netlify Functions (secure for production)
     */
    async loadFromNetlifyFunction() {
        try {
            // Try to get Auth0 token for authenticated request
            let headers = {};
            if (window.authService && window.authService.client && window.authService.isAuthenticated) {
                try {
                    const token = await window.authService.client.getTokenSilently();
                    headers['Authorization'] = `Bearer ${token}`;
                } catch (tokenError) {
                    console.warn('Could not get Auth0 token for API request:', tokenError);
                }
            }
            
            const response = await fetch('/.netlify/functions/get-api-key', { headers });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            this.config = {
                googleDrive: {
                    client_id: data.googleDriveClientId,
                    api_key: data.googleDriveApiKey
                },
                auth0: {
                    domain: data.auth0Domain,
                    client_id: data.auth0ClientId,
                    audience: data.auth0Audience
                },
                spotify: {
                    client_id: data.spotifyClientId
                }
            };
            
            console.log('Configuration loaded from Netlify function');
        } catch (error) {
            throw new Error(`Failed to load from Netlify function: ${error.message}`);
        }
    }

    /**
     * Load configuration from Jekyll site config (fallback method)
     */
    async loadFromSiteConfig() {
        // This uses hardcoded values as a temporary fallback
        // In production, this should be replaced with environment variables
        this.config = {
            googleDrive: {
                client_id: '53684428529-27609a7n7fd3rtov2a86vrq1gvffs62t.apps.googleusercontent.com',
                api_key: 'AIzaSyBeYgUCi017eGe7Gt1_aSbNXn96LgcE18o'
            },
            auth0: {
                domain: 'dev-l57dcpkhob0u7ykb.us.auth0.com',
                client_id: 'ql8ttR4YSmZXZbGE30wP8foWCUuZs2jh',
                audience: 'https://carsontkempf.github.io/api/carsons-meditations'
            },
            spotify: {
                client_id: '80826ef3daa547f49d843c254ad224b6'
            }
        };
        
        console.log('Configuration loaded from site config (fallback)');
    }

    /**
     * Load from environment variables (for local development)
     */
    loadFromEnvironment() {
        // For Jekyll sites, environment variables need to be passed differently
        // This is a fallback method for local development
        this.config = {
            googleDrive: {
                client_id: process.env.GOOGLE_DRIVE_CLIENT_ID || '',
                api_key: process.env.GOOGLE_DRIVE_API_KEY || ''
            },
            auth0: {
                domain: process.env.AUTH0_DOMAIN || '',
                client_id: process.env.AUTH0_CLIENT_ID || '',
                audience: process.env.AUTH0_AUDIENCE_SERVER || ''
            },
            spotify: {
                client_id: process.env.SPOTIFY_CLIENT_ID || ''
            }
        };
        
        console.log('Configuration loaded from environment variables');
    }

    /**
     * Get Google Drive configuration
     */
    getGoogleDriveConfig() {
        if (!this.initialized) {
            throw new Error('Configuration not initialized. Call initialize() first.');
        }
        
        const config = this.config.googleDrive;
        if (!config.client_id || !config.api_key) {
            throw new Error('Google Drive API credentials not found in configuration');
        }
        
        return {
            client_id: config.client_id,
            api_key: config.api_key,
            scopes: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/userinfo.email'
        };
    }

    /**
     * Get Auth0 configuration
     */
    getAuth0Config() {
        if (!this.initialized) {
            throw new Error('Configuration not initialized. Call initialize() first.');
        }
        
        return this.config.auth0;
    }

    /**
     * Get Spotify configuration
     */
    getSpotifyConfig() {
        if (!this.initialized) {
            throw new Error('Configuration not initialized. Call initialize() first.');
        }
        
        const config = this.config.spotify;
        if (!config.client_id) {
            throw new Error('Spotify client ID not found in configuration');
        }
        
        return config;
    }

    /**
     * Check if configuration is ready
     */
    isReady() {
        return this.initialized && 
               this.config.googleDrive?.client_id && 
               this.config.googleDrive?.api_key &&
               this.config.auth0?.client_id &&
               this.config.spotify?.client_id;
    }
}

// Create global instance
window.envConfig = new EnvironmentConfig();

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await window.envConfig.initialize();
        
        // Set global Google Drive config for compatibility
        window.googleDriveConfig = window.envConfig.getGoogleDriveConfig();
        
        // Dispatch event when config is ready
        window.dispatchEvent(new CustomEvent('configReady', {
            detail: { envConfig: window.envConfig }
        }));
    } catch (error) {
        console.error('Failed to initialize environment configuration:', error);
        
        // Dispatch error event
        window.dispatchEvent(new CustomEvent('configError', {
            detail: { error: error.message }
        }));
    }
});