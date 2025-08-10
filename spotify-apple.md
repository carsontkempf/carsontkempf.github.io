---
layout: default
title: Spotify Apple Integration
permalink: /spotify-apple/
---

<div id="spotify-apple-content-wrapper" style="display: none;">
  
  <header class="dashboard-header">
    <h1>{{ page.title }}</h1>
    <div id="user-profile-details"></div> 
  </header>

  <main class="dashboard-main-content">
    <!-- Spotify Authorization Section -->
    <div id="spotify-auth-section">
      <div id="spotify-connect-wrapper" style="display: none;">
        <h3>Connect Your Spotify Account</h3>
        <p>To access your playlists and music data, please authorize Spotify access.</p>
        <button id="spotify-connect-btn" class="dashboard-btn">Connect Spotify</button>
      </div>
      
      <div id="spotify-connected-wrapper" style="display: none;">
        <h3>Spotify Connected</h3>
        <div id="spotify-user-info"></div>
        <button id="spotify-disconnect-btn" class="dashboard-btn secondary">Disconnect Spotify</button>
      </div>
    </div>

    <!-- Spotify Data Section -->
    <div id="spotify-data-section" style="display: none;">
      <h3>Your Playlists</h3>
      <div id="playlists-container">
        <p>Loading playlists...</p>
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
// Spotify OAuth Configuration
const spotifyConfig = {
    clientId: '{{ site.spotify.client_id }}',
    redirectUri: window.location.origin + '/spotify-apple/',
    scopes: [
        'playlist-read-private',
        'playlist-read-collaborative',
        'user-read-private',
        'user-read-email'
    ]
};

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
        
        window.location = `https://accounts.spotify.com/authorize?${params}`;
    },
    
    // Handle authorization callback
    handleCallback: async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
            const codeVerifier = localStorage.getItem('spotify_code_verifier');
            
            try {
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
                
                if (data.access_token) {
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
                    
                    return true;
                }
            } catch (error) {
                console.error('Error exchanging code for token:', error);
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
    
    // Get user's playlists
    getUserPlaylists: async () => {
        try {
            const response = await window.spotifyService.apiRequest('/me/playlists?limit=20');
            return await response.json();
        } catch (error) {
            console.error('Error fetching playlists:', error);
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
    try {
        const playlistsData = await window.spotifyService.getUserPlaylists();
        const playlistsContainer = document.getElementById('playlists-container');
        
        if (playlistsData.items && playlistsData.items.length > 0) {
            const playlistsHtml = playlistsData.items.map(playlist => `
                <div class="playlist-item">
                    <h4>${playlist.name}</h4>
                    <p>Tracks: ${playlist.tracks.total}</p>
                    <p>Owner: ${playlist.owner.display_name}</p>
                </div>
            `).join('');
            
            playlistsContainer.innerHTML = playlistsHtml;
        } else {
            playlistsContainer.innerHTML = '<p>No playlists found.</p>';
        }
    } catch (error) {
        console.error('Error loading playlists:', error);
        document.getElementById('playlists-container').innerHTML = '<p>Error loading playlists.</p>';
    }
}

// Main initialization
document.addEventListener('authReady', async () => {
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
        
        // Handle Spotify authorization callback
        await window.spotifyService.handleCallback();
        
        // Check existing Spotify authorization
        await window.spotifyService.checkTokenValidity();
        
        // Update UI based on Spotify auth status
        updateSpotifyUI();
        
        // Set up event listeners
        document.getElementById('spotify-connect-btn').addEventListener('click', (e) => {
            e.preventDefault();
            window.spotifyService.authorize();
        });
        
        document.getElementById('spotify-disconnect-btn').addEventListener('click', (e) => {
            e.preventDefault();
            window.spotifyService.disconnect();
        });
        
    } else {
        document.getElementById('spotify-apple-login-prompt').style.display = 'block';
    }
});
</script>