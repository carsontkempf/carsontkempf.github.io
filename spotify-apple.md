---
layout: default
title: Spotify Apple Integration
permalink: /spotify-apple/
---

<script src="/assets/js/role-protection.js"></script>

<style>
/* Mobile-First Responsive Design */

/* Playlist Controls - Responsive */
.playlist-controls {
    display: flex;
    flex-wrap: wrap;
    gap: clamp(12px, 2vw, 20px);
    align-items: center;
    margin-bottom: clamp(15px, 3vh, 20px);
    padding: clamp(12px, 2vh, 15px);
    background: rgba(0, 0, 0, 0.05);
    border-radius: clamp(6px, 1vw, 8px);
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: clamp(6px, 1vw, 8px);
    cursor: pointer;
    font-weight: 500;
    font-size: clamp(0.9rem, 2vw, 1rem);
}

.checkbox-label input[type="checkbox"] {
    width: clamp(16px, 3vw, 18px);
    height: clamp(16px, 3vw, 18px);
    cursor: pointer;
}

/* Playlist Item - Mobile Optimized */
.playlist-item {
    display: flex;
    gap: clamp(10px, 2vw, 15px);
    align-items: flex-start;
    padding: clamp(12px, 2.5vh, 15px);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: clamp(6px, 1vw, 8px);
    margin-bottom: clamp(8px, 1.5vh, 10px);
    min-height: 80px;
}

.playlist-checkbox {
    display: flex;
    align-items: flex-start;
    padding-top: clamp(3px, 0.5vh, 5px);
    flex-shrink: 0;
}

.playlist-checkbox input[type="checkbox"] {
    width: clamp(18px, 4vw, 20px);
    height: clamp(18px, 4vw, 20px);
    cursor: pointer;
}

.playlist-content {
    flex: 1;
    cursor: pointer;
    min-width: 0;
}

.playlist-content h4 {
    font-size: clamp(1rem, 3vw, 1.2rem);
    word-wrap: break-word;
}

.playlist-content p {
    font-size: clamp(0.85rem, 2.2vw, 0.9rem);
}

.playlist-content:hover {
    opacity: 0.8;
}

/* Convert Selected Button - Responsive */
#convert-selected-btn {
    font-size: clamp(0.9rem, 2.5vw, 1rem);
    padding: clamp(10px, 2vh, 12px) clamp(16px, 3vw, 20px);
    white-space: nowrap;
}

#convert-selected-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Dashboard Header - Mobile Friendly */
.dashboard-header {
    padding: clamp(1rem, 3vh, 1.5rem) 0;
}

.dashboard-header h1 {
    font-size: clamp(1.5rem, 5vw, 2rem);
}

/* Service Icons - Responsive Sizing */
.service-icons-container {
    padding: clamp(1rem, 3vh, 1.5rem);
    gap: clamp(1rem, 3vw, 2rem);
}

.service-logo {
    width: clamp(60px, 15vw, 112.5px) !important;
    height: clamp(60px, 15vw, 112.5px) !important;
}

.transfer-arrow svg {
    width: clamp(24px, 6vw, 32px);
    height: clamp(24px, 6vw, 32px);
}

/* Auth Sections - Mobile Optimized */
#spotify-auth-section,
#apple-music-auth-section {
    padding: clamp(1rem, 3vh, 1.5rem);
}

#spotify-auth-section h3,
#apple-music-auth-section h3 {
    font-size: clamp(1.1rem, 3.5vw, 1.3rem);
}

#spotify-auth-section p,
#apple-music-auth-section p {
    font-size: clamp(0.9rem, 2.5vw, 1rem);
}

/* Dashboard Buttons - Mobile Friendly */
.dashboard-btn {
    font-size: clamp(0.9rem, 2.5vw, 1rem);
    padding: clamp(10px, 2vh, 12px) clamp(20px, 4vw, 24px);
    min-width: min(200px, 90vw);
}

/* Playlists Summary - Responsive */
.playlists-summary h4 {
    font-size: clamp(1.1rem, 3.5vw, 1.3rem);
}

.playlists-summary p {
    font-size: clamp(0.9rem, 2.5vw, 1rem);
}

/* Track Items - Mobile Optimized */
.track-item {
    padding: clamp(0.75rem, 2vh, 1rem);
    gap: clamp(0.5rem, 2vw, 1rem);
}

.track-number {
    font-size: clamp(0.9rem, 2.5vw, 1rem);
}

.track-name {
    font-size: clamp(0.95rem, 2.8vw, 1rem);
}

.track-artist {
    font-size: clamp(0.85rem, 2.3vw, 0.9rem);
}

.track-album {
    font-size: clamp(0.8rem, 2.2vw, 0.85rem);
}

/* Progress Bar - Responsive */
.progress-bar {
    height: clamp(6px, 1vh, 8px);
    margin: clamp(0.75rem, 2vh, 1rem) 0;
}

/* Conversion Section - Mobile Friendly */
#conversion-progress,
#conversion-results {
    padding: clamp(1rem, 3vh, 2rem);
}

#progress-text {
    font-size: clamp(0.9rem, 2.5vw, 1rem);
    margin: clamp(0.75rem, 2vh, 1rem) 0;
}

#conversion-details p {
    font-size: clamp(0.85rem, 2.3vw, 0.9rem);
    margin: clamp(0.4rem, 1vh, 0.5rem) 0;
}

/* Conversion Summary - Responsive */
.conversion-summary h5 {
    font-size: clamp(1.1rem, 3.5vw, 1.3rem);
}

.stats p {
    font-size: clamp(0.9rem, 2.5vw, 1rem);
    padding: clamp(0.75rem, 2vh, 1rem);
}

/* Failed Tracks - Mobile Optimized */
#failed-tracks h5 {
    font-size: clamp(1rem, 3vw, 1.1rem);
}

.failed-track {
    padding: clamp(0.6rem, 1.5vh, 0.75rem);
    gap: clamp(0.5rem, 1.5vw, 1rem);
    font-size: clamp(0.85rem, 2.3vw, 0.9rem);
}

/* Back Button - Responsive */
.back-btn {
    font-size: clamp(0.9rem, 2.5vw, 1rem);
    padding: clamp(10px, 2vh, 12px) clamp(20px, 4vw, 24px);
    margin-bottom: clamp(0.75rem, 2vh, 1rem);
}

/* User Info - Mobile Friendly */
#spotify-user-info p,
#apple-music-user-info p {
    font-size: clamp(0.9rem, 2.5vw, 1rem);
    margin: clamp(0.4rem, 1vh, 0.5rem) 0;
}

/* Login Prompt - Responsive */
#spotify-apple-login-prompt {
    padding: clamp(2rem, 5vh, 3rem);
    text-align: center;
}

#spotify-apple-login-prompt h2 {
    font-size: clamp(1.3rem, 4vw, 1.5rem);
    margin-bottom: clamp(0.75rem, 2vh, 1rem);
}

#spotify-apple-login-prompt p {
    font-size: clamp(0.95rem, 2.8vw, 1rem);
    margin-bottom: clamp(1.5rem, 3vh, 2rem);
}

#spotify-apple-login-prompt .login-btn {
    font-size: clamp(1rem, 3vw, 1.1rem) !important;
    padding: clamp(12px, 2.5vh, 15px) clamp(24px, 5vw, 30px) !important;
}

/* Mobile Breakpoint - Tablet */
@media (max-width: 768px) {
    .playlist-controls {
        flex-direction: column;
        align-items: stretch;
    }

    .checkbox-label {
        justify-content: center;
    }

    #convert-selected-btn {
        width: 100%;
    }

    .playlists-grid {
        grid-template-columns: 1fr !important;
    }

    .track-item {
        grid-template-columns: 30px 1fr !important;
    }

    .track-meta {
        grid-column: 2;
        align-items: flex-start !important;
        margin-top: 0.5rem;
    }

    .track-number {
        grid-row: 1 / 3;
    }

    .stats {
        grid-template-columns: 1fr !important;
    }

    .failed-track {
        grid-template-columns: 1fr !important;
        text-align: left;
    }

    .service-icons-container {
        flex-direction: column;
    }

    .transfer-arrow svg {
        transform: rotate(90deg);
    }
}

/* Mobile Breakpoint - Small Phone */
@media (max-width: 480px) {
    .playlist-item {
        flex-direction: column;
        gap: clamp(8px, 2vw, 12px);
    }

    .playlist-checkbox {
        padding-top: 0;
    }

    .playlist-content h4 {
        margin-top: 0;
    }

    .dashboard-btn {
        width: 100%;
        max-width: 100%;
    }

    .track-item {
        grid-template-columns: 1fr !important;
        gap: 0.5rem !important;
    }

    .track-number {
        grid-row: auto;
    }

    .track-meta {
        margin-top: 0;
    }
}

/* Landscape Mobile Optimization */
@media (max-height: 500px) and (orientation: landscape) {
    .dashboard-header {
        padding: clamp(0.5rem, 2vh, 1rem) 0;
    }

    .service-icons-container {
        flex-direction: row;
        gap: 1rem;
    }

    .service-logo {
        width: clamp(40px, 10vw, 60px) !important;
        height: clamp(40px, 10vw, 60px) !important;
    }

    .transfer-arrow svg {
        transform: none;
    }
}

/* Desktop Breakpoint - Smaller Title and Button */
@media (min-width: 1024px) {
    .dashboard-header h1 {
        font-size: 1.2rem;
    }

    #convert-selected-btn {
        font-size: 0.85rem;
        padding: 8px 16px;
    }
}
</style>

<div id="spotify-apple-content-wrapper" style="display: none;">
  
  <header class="dashboard-header">
    <h1>{{ page.title }}</h1>
    <div id="user-profile-details"></div>
    
    <!-- Service Icons with Arrow -->
    <div class="service-icons-container">
      <div class="service-icon">
        <img src="{{ '/assets/img/Spotify-Icon.png' | relative_url }}" alt="Spotify" class="service-logo spotify-logo">
      </div>
      <div class="transfer-arrow">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 12L20 12M20 12L14 6M20 12L14 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="service-icon">
        <img src="{{ '/assets/img/Apple-Music-Icon.png' | relative_url }}" alt="Apple Music" class="service-logo apple-music-logo">
      </div>
    </div>
  </header>

  <main class="dashboard-main-content">
    <!-- Spotify Authorization Section -->
    <div id="spotify-auth-section">
      <div id="spotify-connect-wrapper" style="display: none; text-align: center;">
        <h3>Connect Your Spotify Account</h3>
        <p>To access your playlists and music data, please authorize Spotify access.</p>
        <div style="display: flex; justify-content: center;">
          <button id="spotify-connect-btn" class="dashboard-btn">Connect Spotify</button>
        </div>
      </div>
      
      <div id="spotify-connected-wrapper" style="display: none;">
        <h3>Spotify Connected</h3>
        <div id="spotify-user-info"></div>
        <button id="spotify-disconnect-btn" class="dashboard-btn secondary">Disconnect Spotify</button>
      </div>
    </div>

    <!-- Apple Music Authorization Section -->
    <div id="apple-music-auth-section" style="display: none;">
      <div id="apple-music-connect-wrapper" style="display: none; text-align: center;">
        <h3>Connect Your Apple Music Account</h3>
        <p>To create playlists in Apple Music, please authorize access.</p>
        <div style="display: flex; justify-content: center;">
          <button id="apple-music-connect-btn" class="dashboard-btn">Connect Apple Music</button>
        </div>
      </div>
      
      <div id="apple-music-connected-wrapper" style="display: none;">
        <h3>Apple Music Connected</h3>
        <div id="apple-music-user-info"></div>
        <button id="apple-music-disconnect-btn" class="dashboard-btn secondary">Disconnect Apple Music</button>
      </div>
    </div>

    <!-- Spotify Data Section -->
    <div id="spotify-data-section" style="display: none;">
      <h3>Your Playlists</h3>
      <div class="playlist-controls">
        <label class="checkbox-label">
          <input type="checkbox" id="select-all-playlists"> Select All
        </label>
        <button id="convert-selected-btn" class="dashboard-btn" style="display: none;" disabled>
          Convert Selected to Apple Music
        </button>
      </div>
      <div id="playlists-container">
        <p>Loading playlists...</p>
      </div>
    </div>

    <!-- Conversion Section -->
    <div id="conversion-section" style="display: none;">
      <h3>Convert to Apple Music</h3>
      <div id="conversion-container">
        <div id="conversion-progress" style="display: none;">
          <h4>Converting Playlist...</h4>
          <div class="progress-bar">
            <div id="progress-fill"></div>
          </div>
          <div id="progress-text">Preparing conversion...</div>
          <div id="conversion-details"></div>
          <button id="cancel-conversion-btn" class="dashboard-btn secondary" style="margin-top: 15px;">
            Cancel Transfer
          </button>
        </div>
        
        <div id="conversion-results" style="display: none;">
          <h4>Conversion Complete!</h4>
          <div id="results-summary"></div>
          <div id="failed-tracks" style="display: none;">
            <h5>Tracks that couldn't be converted:</h5>
            <div id="failed-tracks-list"></div>
          </div>
          <button onclick="hideConversionResults()" class="dashboard-btn secondary">Close</button>
        </div>
      </div>
    </div>
  </main>
</div>

<div id="spotify-apple-login-prompt" style="display: none;">
    <h2>Access Denied</h2>
    <p>You must be logged in to view this page.</p>
    <button onclick="authService.login()" class="login-btn">Log In</button>
</div>

<script>
// Conversion cancellation flag
let conversionCancelled = false;
let conversionInProgress = false;

// User-friendly error messages mapping
const ERROR_MESSAGES = {
    'Not authorized with Apple Music': 'Please connect your Apple Music account to continue.',
    'Not authorized': 'Please connect your Spotify account to continue.',
    'Authorization expired': 'Your Spotify session has expired. Please reconnect.',
    '401': 'Your session has expired. Please reconnect.',
    '403': 'Access denied. Please check your Apple Music subscription and permissions.',
    '404': 'The requested content was not found.',
    '429': 'Too many requests. The system is slowing down to respect rate limits...',
    '500': 'Server error. Please try again in a few moments.',
    '502': 'Service temporarily unavailable. Please try again.',
    '503': 'Service temporarily unavailable. Please try again.',
    '504': 'Request timeout. Please try again.',
    'NetworkError': 'Connection lost. Please check your internet connection.',
    'Failed to fetch': 'Connection lost. Please check your internet connection.',
    'Network request failed': 'Connection lost. Please check your internet connection.',
    'timeout': 'Request timed out. Please try again.',
    'No tracks found in playlist': 'This playlist appears to be empty.',
    'No tracks could be converted': 'None of the tracks could be found in Apple Music. This might be a region restriction issue.',
    'Transfer cancelled by user': 'Transfer cancelled'
};

function getUserFriendlyError(technicalError) {
    const errorString = typeof technicalError === 'string' ? technicalError : technicalError.message || technicalError.toString();

    // Check each error pattern
    for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
        if (errorString.includes(key)) {
            return message;
        }
    }

    // Default: return a generic friendly message
    return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
}

// Spotify OAuth Configuration - Wait for envConfig to be ready
let spotifyConfig = null;

// Initialize Spotify config when envConfig is ready
const initSpotifyConfig = () => {
    if (window.envConfig && window.envConfig.isReady()) {
        const config = window.envConfig.getSpotifyConfig();
        spotifyConfig = {
            clientId: config.client_id,
            redirectUri: config.callback_url || (window.location.origin + '/spotify-apple/'),
            scopes: [
                'playlist-read-private',
                'playlist-read-collaborative',
                'user-read-private',
                'user-read-email'
            ]
        };

        // Debug: Log the redirect URI being used
        console.log('[SPOTIFY] Redirect URI configured:', spotifyConfig.redirectUri);
        console.log('[SPOTIFY] Client ID configured:', spotifyConfig.clientId);
        return true;
    }
    return false;
};

// Try to initialize immediately
if (!initSpotifyConfig()) {
    // If not ready, wait for configReady event
    window.addEventListener('configReady', initSpotifyConfig);
}

// Spotify Service Object
window.spotifyService = {
    accessToken: null,
    refreshToken: null,
    isAuthorized: false,
    
    // Generate PKCE challenge
    generateCodeChallenge: async (codeVerifier) => {
        const data = new TextEncoder().encode(codeVerifier);
        const digest = await window.crypto.subtle.digest('SHA-256', data);
        return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    },
    
    // Generate random string for PKCE
    generateRandomString: (length) => {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    },
    
    // Start Spotify authorization
    authorize: async () => {
        if (!spotifyConfig) {
            console.error('[SPOTIFY] Configuration not loaded. Attempting to initialize...');
            if (!initSpotifyConfig()) {
                alert('Spotify configuration not ready. Please refresh the page.');
                return;
            }
        }

        console.log('[SPOTIFY] ========================================');
        console.log('[SPOTIFY] Starting Spotify authorization...');
        console.log('[SPOTIFY] Client ID:', spotifyConfig.clientId);
        console.log('[SPOTIFY] Redirect URI:', spotifyConfig.redirectUri);
        console.log('[SPOTIFY] ========================================');

        const codeVerifier = window.spotifyService.generateRandomString(128);
        const codeChallenge = await window.spotifyService.generateCodeChallenge(codeVerifier);

        // Store code verifier for later use
        localStorage.setItem('spotify_code_verifier', codeVerifier);

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: spotifyConfig.clientId,
            scope: spotifyConfig.scopes.join(' '),
            redirect_uri: spotifyConfig.redirectUri,
            code_challenge_method: 'S256',
            code_challenge: codeChallenge,
        });

        const authUrl = `https://accounts.spotify.com/authorize?${params}`;
        console.log('[SPOTIFY] Authorization URL:', authUrl);
        console.log('[SPOTIFY] Redirecting to Spotify...');

        window.location = authUrl;
    },
    
    // Handle authorization callback
    handleCallback: async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        console.log('[SPOTIFY] ========================================');
        console.log('[SPOTIFY] Handling callback from Spotify...');
        console.log('[SPOTIFY] Current URL:', window.location.href);
        console.log('[SPOTIFY] Code present:', !!code);
        console.log('[SPOTIFY] Error:', error || 'none');
        console.log('[SPOTIFY] ========================================');

        if (error) {
            console.error('[SPOTIFY] Authorization error:', error);
            alert(`Spotify authorization failed: ${error}`);
            return false;
        }

        if (code) {
            const codeVerifier = localStorage.getItem('spotify_code_verifier');
            console.log('[SPOTIFY] Code verifier found:', !!codeVerifier);

            try {
                console.log('[SPOTIFY] Exchanging code for token...');
                console.log('[SPOTIFY] Using redirect URI:', spotifyConfig.redirectUri);

                const response = await fetch('https://accounts.spotify.com/api/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        grant_type: 'authorization_code',
                        code: code,
                        redirect_uri: spotifyConfig.redirectUri,
                        client_id: spotifyConfig.clientId,
                        code_verifier: codeVerifier,
                    }),
                });

                const data = await response.json();
                console.log('[SPOTIFY] Token response status:', response.status);

                if (!response.ok) {
                    console.error('[SPOTIFY] Token exchange failed:', data);
                    alert(`Spotify token exchange failed: ${data.error_description || data.error || 'Unknown error'}`);
                    return false;
                }

                if (data.access_token) {
                    console.log('[SPOTIFY] ✓ Successfully received access token');
                    window.spotifyService.accessToken = data.access_token;
                    window.spotifyService.refreshToken = data.refresh_token;
                    window.spotifyService.isAuthorized = true;

                    // Store tokens securely
                    localStorage.setItem('spotify_access_token', data.access_token);
                    localStorage.setItem('spotify_refresh_token', data.refresh_token);
                    localStorage.setItem('spotify_token_expires', Date.now() + (data.expires_in * 1000));

                    // Clean up
                    localStorage.removeItem('spotify_code_verifier');

                    // Remove code from URL
                    window.history.replaceState(null, null, window.location.pathname);

                    console.log('[SPOTIFY] ✓ Authorization complete!');
                    return true;
                }
            } catch (error) {
                console.error('[SPOTIFY] Error exchanging code for token:', error);
                alert(`Spotify authorization failed: ${error.message}`);
            }
        }
        return false;
    },
    
    // Refresh access token
    refreshAccessToken: async () => {
        const refreshToken = localStorage.getItem('spotify_refresh_token');
        if (!refreshToken) return false;
        
        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken,
                    client_id: spotifyConfig.clientId,
                }),
            });
            
            const data = await response.json();
            
            if (data.access_token) {
                window.spotifyService.accessToken = data.access_token;
                localStorage.setItem('spotify_access_token', data.access_token);
                localStorage.setItem('spotify_token_expires', Date.now() + (data.expires_in * 1000));
                
                if (data.refresh_token) {
                    window.spotifyService.refreshToken = data.refresh_token;
                    localStorage.setItem('spotify_refresh_token', data.refresh_token);
                }
                
                return true;
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
        }
        return false;
    },
    
    // Check if token is valid
    checkTokenValidity: async () => {
        const accessToken = localStorage.getItem('spotify_access_token');
        const tokenExpires = localStorage.getItem('spotify_token_expires');
        
        if (!accessToken) return false;
        
        // Check if token is expired
        if (tokenExpires && Date.now() >= parseInt(tokenExpires)) {
            const refreshed = await window.spotifyService.refreshAccessToken();
            return refreshed;
        }
        
        window.spotifyService.accessToken = accessToken;
        window.spotifyService.refreshToken = localStorage.getItem('spotify_refresh_token');
        window.spotifyService.isAuthorized = true;
        return true;
    },
    
    // Make authenticated Spotify API request
    apiRequest: async (endpoint, options = {}) => {
        if (!window.spotifyService.accessToken) {
            throw new Error('Not authorized');
        }

        const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
            ...options,
            headers: {
                'Authorization': `Bearer ${window.spotifyService.accessToken}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        // Handle rate limiting (429 Too Many Requests)
        if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After') || '60';
            const waitSeconds = parseInt(retryAfter);
            console.log(`Spotify API rate limited. Waiting ${waitSeconds} seconds...`);
            await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000));
            // Retry the request
            return window.spotifyService.apiRequest(endpoint, options);
        }

        if (response.status === 401) {
            // Token might be expired, try to refresh
            const refreshed = await window.spotifyService.refreshAccessToken();
            if (refreshed) {
                // Retry the request with new token
                return fetch(`https://api.spotify.com/v1${endpoint}`, {
                    ...options,
                    headers: {
                        'Authorization': `Bearer ${window.spotifyService.accessToken}`,
                        'Content-Type': 'application/json',
                        ...options.headers,
                    },
                });
            }
            throw new Error('Authorization expired');
        }

        return response;
    },
    
    // Get user's playlists (all of them, including those in folders)
    getUserPlaylists: async () => {
        try {
            const allPlaylists = [];
            let offset = 0;
            const limit = 50; // Maximum allowed by Spotify API
            let hasMore = true;
            
            while (hasMore) {
                const response = await window.spotifyService.apiRequest(`/me/playlists?limit=${limit}&offset=${offset}`);
                const data = await response.json();
                
                if (data.items && data.items.length > 0) {
                    allPlaylists.push(...data.items);
                    offset += limit;
                    hasMore = data.next !== null; // Continue if there's a next page
                } else {
                    hasMore = false;
                }
            }
            
            return {
                href: '',
                items: allPlaylists,
                limit: limit,
                next: null,
                offset: 0,
                previous: null,
                total: allPlaylists.length
            };
        } catch (error) {
            console.error('Error fetching playlists:', error);
            throw error;
        }
    },
    
    // Get playlist tracks (all of them, with pagination)
    getPlaylistTracks: async (playlistId) => {
        try {
            const allTracks = [];
            let offset = 0;
            const limit = 50; // Maximum allowed by Spotify API
            let hasMore = true;
            
            while (hasMore) {
                const response = await window.spotifyService.apiRequest(`/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`);
                const data = await response.json();
                
                if (data.items && data.items.length > 0) {
                    allTracks.push(...data.items);
                    offset += limit;
                    hasMore = data.next !== null; // Continue if there's a next page
                } else {
                    hasMore = false;
                }
            }
            
            return {
                href: '',
                items: allTracks,
                limit: limit,
                next: null,
                offset: 0,
                previous: null,
                total: allTracks.length
            };
        } catch (error) {
            console.error('Error fetching playlist tracks:', error);
            throw error;
        }
    },
    
    // Get user profile
    getUserProfile: async () => {
        try {
            const response = await window.spotifyService.apiRequest('/me');
            return await response.json();
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    },
    
    // Disconnect Spotify
    disconnect: () => {
        window.spotifyService.accessToken = null;
        window.spotifyService.refreshToken = null;
        window.spotifyService.isAuthorized = false;
        
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('spotify_token_expires');
        
        updateSpotifyUI();
    }
};

// UI Update Functions
function updateSpotifyUI() {
    const connectWrapper = document.getElementById('spotify-connect-wrapper');
    const connectedWrapper = document.getElementById('spotify-connected-wrapper');
    const dataSection = document.getElementById('spotify-data-section');
    
    if (window.spotifyService.isAuthorized) {
        connectWrapper.style.display = 'none';
        connectedWrapper.style.display = 'block';
        dataSection.style.display = 'block';
        
        loadSpotifyUserInfo();
        loadUserPlaylists();
    } else {
        connectWrapper.style.display = 'block';
        connectedWrapper.style.display = 'none';
        dataSection.style.display = 'none';
    }
}

async function loadSpotifyUserInfo() {
    try {
        const userProfile = await window.spotifyService.getUserProfile();
        const userInfoDiv = document.getElementById('spotify-user-info');
        userInfoDiv.innerHTML = `
            <p><strong>Spotify User:</strong> ${userProfile.display_name || userProfile.id}</p>
            <p><strong>Followers:</strong> ${userProfile.followers.total}</p>
        `;
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

async function loadUserPlaylists() {
    const playlistsContainer = document.getElementById('playlists-container');
    playlistsContainer.innerHTML = '<p>Loading all playlists (including those in folders)...</p>';
    
    try {
        const playlistsData = await window.spotifyService.getUserPlaylists();
        
        if (playlistsData.items && playlistsData.items.length > 0) {
            const playlistsHtml = `
                <div class="playlists-summary">
                    <h4>Found ${playlistsData.total} playlists</h4>
                    <p>Select playlists to convert to Apple Music</p>
                </div>
                <div class="playlists-grid">
                    ${playlistsData.items.map(playlist => `
                        <div class="playlist-item" data-playlist-id="${playlist.id}" data-playlist-name="${playlist.name.replace(/"/g, '&quot;')}" data-track-count="${playlist.tracks.total}">
                            <div class="playlist-checkbox">
                                <input type="checkbox" class="playlist-select" value="${playlist.id}">
                            </div>
                            <div class="playlist-content" onclick="showPlaylistTracks('${playlist.id}', '${playlist.name.replace(/'/g, "\\'")}')">
                                <h4>${playlist.name}</h4>
                                <p>Tracks: ${playlist.tracks.total}</p>
                                <p>Owner: ${playlist.owner.display_name || playlist.owner.id}</p>
                                <p class="playlist-type">${playlist.public ? 'Public' : 'Private'} • ${playlist.collaborative ? 'Collaborative' : 'Solo'}</p>
                                <p class="click-hint">Click to view tracks</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            playlistsContainer.innerHTML = playlistsHtml;

            // Show convert button and enable selection
            document.getElementById('convert-selected-btn').style.display = 'inline-block';
            setupPlaylistSelection();
        } else {
            playlistsContainer.innerHTML = '<p>No playlists found.</p>';
        }
    } catch (error) {
        console.error('Error loading playlists:', error);
        playlistsContainer.innerHTML = '<p>Error loading playlists. Please try reconnecting to Spotify.</p>';
    }
}

// Show tracks for a specific playlist
async function showPlaylistTracks(playlistId, playlistName) {
    const playlistsContainer = document.getElementById('playlists-container');
    playlistsContainer.innerHTML = `<p>Loading tracks from "${playlistName}"...</p>`;
    
    try {
        const tracksData = await window.spotifyService.getPlaylistTracks(playlistId);
        
        if (tracksData.items && tracksData.items.length > 0) {
            const tracksHtml = `
                <div class="playlist-tracks-header">
                    <button onclick="loadUserPlaylists()" class="back-btn">← Back to Playlists</button>
                    <h3>${playlistName}</h3>
                    <p>Found ${tracksData.total} tracks</p>
                </div>
                <div class="tracks-list">
                    ${tracksData.items.map((item, index) => {
                        const track = item.track;
                        if (!track) return '';
                        
                        const artistNames = track.artists ? track.artists.map(artist => artist.name).join(', ') : 'Unknown Artist';
                        const albumName = track.album ? track.album.name : 'Unknown Album';
                        const duration = formatDuration(track.duration_ms);
                        const addedDate = formatDate(item.added_at);
                        
                        return `
                            <div class="track-item">
                                <div class="track-number">${index + 1}</div>
                                <div class="track-info">
                                    <div class="track-name">
                                        ${track.name}
                                        ${track.explicit ? '<span class="explicit-badge">E</span>' : ''}
                                    </div>
                                    <div class="track-artist">${artistNames}</div>
                                    <div class="track-album">${albumName}</div>
                                </div>
                                <div class="track-meta">
                                    <div class="track-duration">${duration}</div>
                                    <div class="track-added">Added: ${addedDate}</div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
            
            playlistsContainer.innerHTML = tracksHtml;
        } else {
            playlistsContainer.innerHTML = `
                <div class="playlist-tracks-header">
                    <button onclick="loadUserPlaylists()" class="back-btn">← Back to Playlists</button>
                    <h3>${playlistName}</h3>
                    <p>This playlist is empty.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading playlist tracks:', error);
        playlistsContainer.innerHTML = `
            <div class="playlist-tracks-header">
                <button onclick="loadUserPlaylists()" class="back-btn">← Back to Playlists</button>
                <h3>${playlistName}</h3>
                <p>Error loading tracks. Please try again.</p>
            </div>
        `;
    }
}

// Format duration from milliseconds to mm:ss
function formatDuration(durationMs) {
    if (!durationMs) return '0:00';
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Format date to readable format
function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// Apple Music Integration Functions

// Update Apple Music UI based on auth status
function updateAppleMusicUI() {
    const connectWrapper = document.getElementById('apple-music-connect-wrapper');
    const connectedWrapper = document.getElementById('apple-music-connected-wrapper');
    const authSection = document.getElementById('apple-music-auth-section');
    
    if (window.appleMusicService.isAuthorized) {
        connectWrapper.style.display = 'none';
        connectedWrapper.style.display = 'block';
        
        // Update user info
        document.getElementById('apple-music-user-info').innerHTML = `
            <p><strong>Apple Music:</strong> Connected and ready to create playlists</p>
        `;
        
        // Show conversion section
        document.getElementById('conversion-section').style.display = 'block';
    } else {
        connectWrapper.style.display = 'block';
        connectedWrapper.style.display = 'none';
        
        // Hide conversion section
        document.getElementById('conversion-section').style.display = 'none';
    }
    
    authSection.style.display = 'block';
    
    // Update convert buttons in playlist grid
    updateConvertButtons();
}

// Update convert button states
function updateConvertButtons() {
    const convertButtons = document.querySelectorAll('.convert-btn');
    convertButtons.forEach(button => {
        if (window.appleMusicService.isAuthorized || window.appleMusicService.catalogOnlyMode) {
            button.disabled = false;
            if (window.appleMusicService.catalogOnlyMode) {
                button.setAttribute('title', 'Preview mode - will show matching songs without creating playlist');
            } else {
                button.removeAttribute('title');
            }
        } else {
            button.disabled = true;
            button.setAttribute('title', 'Connect Apple Music first');
        }
    });
}

// Convert playlist to Apple Music (preserves explicit content by default)
async function convertPlaylistToAppleMusic(playlistId, playlistName, trackCount) {
    if (!window.appleMusicService.isAuthorized && !window.appleMusicService.catalogOnlyMode) {
        alert('Please connect to Apple Music first');
        return;
    }

    if (!window.spotifyService.isAuthorized) {
        alert('Spotify connection lost. Please reconnect.');
        return;
    }

    try {
        // Reset and set cancellation flags
        conversionCancelled = false;
        conversionInProgress = true;

        // Show progress
        showConversionProgress();
        updateProgressText(`Loading tracks from "${playlistName}"...`);

        // Get all tracks from Spotify playlist
        const spotifyTracks = await window.spotifyService.getPlaylistTracks(playlistId);

        // Handle empty playlist
        if (!spotifyTracks.items || spotifyTracks.items.length === 0) {
            hideConversionProgress();
            alert(`Playlist "${playlistName}" is empty. No tracks to convert.`);
            return;
        }

        // Check for cancellation
        if (conversionCancelled) {
            throw new Error('Transfer cancelled by user');
        }

        // Count explicit tracks for info
        const explicitCount = spotifyTracks.items.filter(item => item.track && item.track.explicit).length;
        console.log(`[INFO] Playlist contains ${explicitCount}/${spotifyTracks.items.length} explicit tracks`);

        // Get playlist details
        const spotifyPlaylist = {
            id: playlistId,
            name: playlistName,
            track_count: trackCount
        };

        // Convert playlist with explicit preservation enabled by default
        const result = await window.appleMusicService.convertSpotifyPlaylist(
            spotifyPlaylist,
            spotifyTracks.items,
            (progress) => {
                updateConversionProgress(progress);
            },
            {
                maintainExplicit: true,
                checkCancellation: () => conversionCancelled
            }
        );

        // Check if cancelled
        if (result.cancelled) {
            showConversionResults({
                ...result,
                message: 'Transfer cancelled by user. Partial results shown below.'
            });
        } else {
            // Show results
            showConversionResults(result);
        }

    } catch (error) {
        console.error('Conversion failed:', error);
        hideConversionProgress();

        // Show user-friendly error message
        const friendlyMessage = getUserFriendlyError(error);
        alert(friendlyMessage);
    } finally {
        conversionInProgress = false;
    }
}

// Show conversion progress
function showConversionProgress() {
    document.getElementById('conversion-progress').style.display = 'block';
    document.getElementById('conversion-results').style.display = 'none';
    document.getElementById('progress-fill').style.width = '0%';
}

// Hide conversion progress
function hideConversionProgress() {
    document.getElementById('conversion-progress').style.display = 'none';
}

// Update progress text
function updateProgressText(text) {
    document.getElementById('progress-text').textContent = text;
}

// Update conversion progress with explicit tracking
function updateConversionProgress(progress) {
    const percentage = Math.round((progress.current / progress.total) * 100);
    document.getElementById('progress-fill').style.width = `${percentage}%`;
    
    const explicitIndicator = progress.currentExplicit ? ' [E]' : '';
    updateProgressText(`Converting track ${progress.current} of ${progress.total}: ${progress.currentTrack}${explicitIndicator}`);
    
    const explicitMatchRate = progress.successful > 0 
        ? Math.round((progress.explicitMatches / progress.successful) * 100) 
        : 0;
    
    document.getElementById('conversion-details').innerHTML = `
        <p>Successfully converted: ${progress.successful}</p>
        <p>Failed to convert: ${progress.failed}</p>
        <p>Explicit matches: ${progress.explicitMatches || 0}/${progress.successful || 0} (${explicitMatchRate}%)</p>
        <p>Explicit mismatches: ${progress.explicitMismatches || 0}</p>
    `;
}

// Show conversion results
function showConversionResults(result) {
    hideConversionProgress();
    
    const resultsDiv = document.getElementById('conversion-results');
    const summaryDiv = document.getElementById('results-summary');
    const failedDiv = document.getElementById('failed-tracks');
    const failedListDiv = document.getElementById('failed-tracks-list');
    
    const modeMessage = result.catalogOnlyMode
        ? `<div class="catalog-only-notice"><strong>Preview Mode:</strong> ${result.message}</div>`
        : `<p>The playlist has been added to your Apple Music library.</p>`;

    summaryDiv.innerHTML = `
        <div class="conversion-summary">
            <h5>Playlist "${result.appleMusicPlaylist.attributes.name}" ${result.catalogOnlyMode ? 'analyzed' : 'created'} successfully!</h5>
            <div class="stats">
                <p><strong>Original tracks:</strong> ${result.summary.originalTracks}</p>
                <p><strong>Successfully converted:</strong> ${result.summary.convertedTracks}</p>
                <p><strong>Success rate:</strong> ${result.summary.successRate}%</p>
                <p><strong>Explicit matches:</strong> ${result.summary.explicitMatches || 0}/${result.summary.convertedTracks || 0} (${result.summary.explicitMatchRate || 0}%)</p>
                <p><strong>Explicit mismatches:</strong> ${result.summary.explicitMismatches || 0}</p>
            </div>
            ${modeMessage}
        </div>
    `;
    
    if (result.conversionResults.failed.length > 0) {
        failedDiv.style.display = 'block';
        failedListDiv.innerHTML = result.conversionResults.failed.map(failed => `
            <div class="failed-track">
                <span class="track-name">
                    ${failed.originalTrack?.name || 'Unknown'}
                    ${failed.explicitInfo?.spotify ? '<span class="explicit-badge">E</span>' : ''}
                </span>
                <span class="track-artist">${failed.originalTrack?.artists?.[0]?.name || 'Unknown Artist'}</span>
                <span class="error-reason">${failed.error}</span>
            </div>
        `).join('');
    } else {
        failedDiv.style.display = 'none';
    }
    
    resultsDiv.style.display = 'block';
}

// Hide conversion results
function hideConversionResults() {
    document.getElementById('conversion-results').style.display = 'none';
}

// Wait for both auth and config to be ready
function initializeServices() {
    console.log('Checking service initialization readiness...');
    console.log('Auth ready:', window.authService?.isAuthenticated);
    console.log('Config ready:', window.envConfig?.initialized);
    
    if (window.authService?.isAuthenticated && window.envConfig?.initialized) {
        console.log('Both auth and config ready, initializing services...');
        initializeAppleMusicService();
    }
}

// Initialize Apple Music service
async function initializeAppleMusicService() {
    try {
        console.log('Starting Apple Music service initialization...');
        const appleMusicConfig = window.envConfig.getAppleMusicConfig();
        if (appleMusicConfig && appleMusicConfig.developer_token) {
            await window.appleMusicService.initialize(appleMusicConfig.developer_token);
            console.log('Apple Music service initialized successfully');
            updateAppleMusicUI();
        } else {
            console.warn('Apple Music developer token not configured');
        }
    } catch (error) {
        console.error('Failed to initialize Apple Music:', error);
    }
}

// Listen for config ready event
document.addEventListener('configReady', () => {
    console.log('Config ready event received');
    initializeServices();
});

// Main initialization
document.addEventListener('authReady', async () => {
    console.log('Auth ready event received');

    // Check role-based access: Spotify-Apple, Admin, or Root
    const hasAccess = window.authService.isAuthenticated &&
                     (window.authService.hasRole(['Spotify-Apple', 'Admin', 'Root']));

    if (!hasAccess) {
        document.getElementById('spotify-apple-login-prompt').style.display = 'block';
        if (!window.authService.isAuthenticated) {
            document.getElementById('spotify-apple-login-prompt').innerHTML = `
                <h2>Access Denied</h2>
                <p>You must be logged in to view this page.</p>
                <button onclick="authService.login()" class="login-btn">Log In</button>
            `;
        } else {
            document.getElementById('spotify-apple-login-prompt').innerHTML = `
                <h2>Access Denied</h2>
                <p>You do not have permission to access this page.</p>
                <p>This page requires the Spotify-Apple, Admin, or Root role.</p>
                <p>Your roles: ${window.authService.roles.join(', ') || 'None'}</p>
            `;
        }
        return;
    }

    if (window.authService.isAuthenticated) {
        document.getElementById('spotify-apple-content-wrapper').style.display = 'block';
        
        const user = window.authService.user;
        const profileDiv = document.getElementById('user-profile-details');
        
        if (user && profileDiv) {
            profileDiv.innerHTML = `
                <p class="welcome-message">Welcome, ${user.name}!</p>
                <p class="login-status">Your login status is confirmed.</p>
            `;
        }
        
        // Check if we can initialize services now
        initializeServices();
        
        // Handle Spotify authorization callback
        await window.spotifyService.handleCallback();
        
        // Check existing Spotify authorization
        await window.spotifyService.checkTokenValidity();
        
        // Update UI based on auth status
        updateSpotifyUI();
        updateAppleMusicUI();
        
        // Set up Spotify event listeners
        document.getElementById('spotify-connect-btn').addEventListener('click', (e) => {
            e.preventDefault();
            window.spotifyService.authorize();
        });
        
        document.getElementById('spotify-disconnect-btn').addEventListener('click', (e) => {
            e.preventDefault();
            window.spotifyService.disconnect();
        });
        
        // Set up Apple Music event listeners
        document.getElementById('apple-music-connect-btn').addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                if (!window.appleMusicService.isInitialized) {
                    console.log('Apple Music service not initialized, trying to initialize...');
                    await initializeAppleMusicService();
                }
                await window.appleMusicService.authorize();
            } catch (error) {
                console.error('Apple Music authorization failed:', error);
                alert('Apple Music authorization failed. Please try again.');
            }
        });
        
        document.getElementById('apple-music-disconnect-btn').addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await window.appleMusicService.disconnect();
            } catch (error) {
                console.error('Apple Music disconnect failed:', error);
            }
        });

        // Set up cancel button event listener
        document.getElementById('cancel-conversion-btn').addEventListener('click', (e) => {
            e.preventDefault();
            if (conversionInProgress) {
                if (confirm('Are you sure you want to cancel the transfer? Partial progress will be lost.')) {
                    conversionCancelled = true;
                    console.log('User cancelled conversion');
                }
            }
        });

        // Listen for Apple Music auth changes
        window.addEventListener('appleMusicAuthChanged', (event) => {
            console.log('Apple Music auth changed event:', event.detail);
            updateAppleMusicUI();
        });

        // Set up convert selected button
        document.getElementById('convert-selected-btn').addEventListener('click', async (e) => {
            e.preventDefault();
            await convertSelectedPlaylists();
        });

    } else {
        document.getElementById('spotify-apple-login-prompt').style.display = 'block';
    }
});

// Setup playlist selection functionality
function setupPlaylistSelection() {
    const selectAllCheckbox = document.getElementById('select-all-playlists');
    const convertSelectedBtn = document.getElementById('convert-selected-btn');
    const playlistCheckboxes = document.querySelectorAll('.playlist-select');

    // Handle select all
    selectAllCheckbox.addEventListener('change', (e) => {
        playlistCheckboxes.forEach(checkbox => {
            checkbox.checked = e.target.checked;
        });
        updateConvertButtonState();
    });

    // Handle individual checkbox changes
    playlistCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateConvertButtonState();

            // Update select all state
            const allChecked = Array.from(playlistCheckboxes).every(cb => cb.checked);
            const someChecked = Array.from(playlistCheckboxes).some(cb => cb.checked);
            selectAllCheckbox.checked = allChecked;
            selectAllCheckbox.indeterminate = someChecked && !allChecked;
        });
    });
}

// Update convert button state based on selection
function updateConvertButtonState() {
    const convertSelectedBtn = document.getElementById('convert-selected-btn');
    const selectedCheckboxes = document.querySelectorAll('.playlist-select:checked');
    const count = selectedCheckboxes.length;

    if (count > 0) {
        convertSelectedBtn.disabled = false;
        convertSelectedBtn.textContent = `Convert ${count} Selected Playlist${count > 1 ? 's' : ''} to Apple Music`;
    } else {
        convertSelectedBtn.disabled = true;
        convertSelectedBtn.textContent = 'Convert Selected to Apple Music';
    }
}

// Convert selected playlists to Apple Music
async function convertSelectedPlaylists() {
    if (!window.appleMusicService.isAuthorized && !window.appleMusicService.catalogOnlyMode) {
        alert('Please connect to Apple Music first');
        return;
    }

    if (!window.spotifyService.isAuthorized) {
        alert('Spotify connection lost. Please reconnect.');
        return;
    }

    const selectedCheckboxes = document.querySelectorAll('.playlist-select:checked');
    if (selectedCheckboxes.length === 0) {
        alert('Please select at least one playlist to convert');
        return;
    }

    // Get playlist data from DOM
    const selectedPlaylists = Array.from(selectedCheckboxes).map(checkbox => {
        const playlistItem = checkbox.closest('.playlist-item');
        return {
            id: playlistItem.dataset.playlistId,
            name: playlistItem.dataset.playlistName,
            trackCount: parseInt(playlistItem.dataset.trackCount)
        };
    });

    const totalPlaylists = selectedPlaylists.length;
    const totalEstimatedTracks = selectedPlaylists.reduce((sum, p) => sum + p.trackCount, 0);

    if (!confirm(`Convert ${totalPlaylists} playlist${totalPlaylists > 1 ? 's' : ''} (approximately ${totalEstimatedTracks} tracks) to Apple Music?\n\nThis may take several minutes.`)) {
        return;
    }

    try {
        conversionCancelled = false;
        conversionInProgress = true;

        showConversionProgress();

        let overallProgress = {
            current: 0,
            total: totalPlaylists,
            successful: 0,
            failed: 0,
            tracksConverted: 0,
            tracksFailed: 0
        };

        const results = [];

        for (let i = 0; i < selectedPlaylists.length; i++) {
            if (conversionCancelled) {
                break;
            }

            const playlist = selectedPlaylists[i];
            updateProgressText(`Converting playlist ${i + 1} of ${totalPlaylists}: ${playlist.name}...`);

            try {
                // Get playlist tracks
                const spotifyTracks = await window.spotifyService.getPlaylistTracks(playlist.id);

                if (!spotifyTracks.items || spotifyTracks.items.length === 0) {
                    overallProgress.failed++;
                    results.push({
                        playlist: playlist.name,
                        success: false,
                        error: 'Empty playlist'
                    });
                    continue;
                }

                // Convert playlist
                const result = await window.appleMusicService.convertSpotifyPlaylist(
                    playlist,
                    spotifyTracks.items,
                    (progress) => {
                        const percentage = Math.round(((i + (progress.current / progress.total)) / totalPlaylists) * 100);
                        document.getElementById('progress-fill').style.width = `${percentage}%`;
                    },
                    {
                        maintainExplicit: true,
                        checkCancellation: () => conversionCancelled
                    }
                );

                if (result.cancelled) {
                    break;
                }

                overallProgress.successful++;
                overallProgress.tracksConverted += result.conversionResults.successful.length;
                overallProgress.tracksFailed += result.conversionResults.failed.length;

                results.push({
                    playlist: playlist.name,
                    success: true,
                    result: result
                });

            } catch (error) {
                console.error(`Failed to convert playlist ${playlist.name}:`, error);
                overallProgress.failed++;
                results.push({
                    playlist: playlist.name,
                    success: false,
                    error: error.message
                });
            }

            overallProgress.current = i + 1;
        }

        // Show batch results
        showBatchConversionResults(overallProgress, results);

    } catch (error) {
        console.error('Batch conversion failed:', error);
        hideConversionProgress();
        alert(getUserFriendlyError(error));
    } finally {
        conversionInProgress = false;
    }
}

// Show batch conversion results
function showBatchConversionResults(overallProgress, results) {
    hideConversionProgress();

    const resultsDiv = document.getElementById('conversion-results');
    const summaryDiv = document.getElementById('results-summary');
    const failedDiv = document.getElementById('failed-tracks');

    const successfulPlaylists = results.filter(r => r.success);
    const failedPlaylists = results.filter(r => !r.success);

    summaryDiv.innerHTML = `
        <div class="conversion-summary">
            <h5>Batch Conversion Complete</h5>
            <div class="stats">
                <p><strong>Playlists converted:</strong> ${overallProgress.successful} / ${overallProgress.total}</p>
                <p><strong>Tracks converted:</strong> ${overallProgress.tracksConverted}</p>
                <p><strong>Tracks failed:</strong> ${overallProgress.tracksFailed}</p>
            </div>

            ${successfulPlaylists.length > 0 ? `
                <h5>Successfully Converted Playlists:</h5>
                <ul>
                    ${successfulPlaylists.map(r => `<li>${r.playlist}</li>`).join('')}
                </ul>
            ` : ''}

            ${failedPlaylists.length > 0 ? `
                <h5>Failed Playlists:</h5>
                <ul>
                    ${failedPlaylists.map(r => `<li>${r.playlist} - ${r.error}</li>`).join('')}
                </ul>
            ` : ''}
        </div>
    `;

    failedDiv.style.display = 'none';
    resultsDiv.style.display = 'block';
}

// Warn user before leaving page during conversion
window.addEventListener('beforeunload', (e) => {
    if (conversionInProgress) {
        e.preventDefault();
        e.returnValue = 'Playlist transfer is in progress. Are you sure you want to leave? Progress will be lost.';
        return e.returnValue;
    }
});
</script>