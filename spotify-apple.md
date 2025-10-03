---
layout: default
title: Spotify Apple Integration
permalink: /spotify-apple/
---

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

    <!-- Apple Music Authorization Section -->
    <div id="apple-music-auth-section" style="display: none;">
      <div id="apple-music-connect-wrapper" style="display: none;">
        <h3>Connect Your Apple Music Account</h3>
        <p>To create playlists in Apple Music, please authorize access.</p>
        <button id="apple-music-connect-btn" class="dashboard-btn">Connect Apple Music</button>
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
                    <p>Showing all playlists including those in folders</p>
                </div>
                <div class="playlists-grid">
                    ${playlistsData.items.map(playlist => `
                        <div class="playlist-item clickable-playlist">
                            <div onclick="showPlaylistTracks('${playlist.id}', '${playlist.name.replace(/'/g, "\\'")}')">
                                <h4>${playlist.name}</h4>
                                <p>Tracks: ${playlist.tracks.total}</p>
                                <p>Owner: ${playlist.owner.display_name || playlist.owner.id}</p>
                                <p class="playlist-type">${playlist.public ? 'Public' : 'Private'} • ${playlist.collaborative ? 'Collaborative' : 'Solo'}</p>
                                <p class="click-hint">Click to view tracks</p>
                            </div>
                            <div class="playlist-actions">
                                <button onclick="event.stopPropagation(); convertPlaylistToAppleMusic('${playlist.id}', '${playlist.name.replace(/'/g, "\\'")}', ${playlist.tracks.total})" 
                                        class="convert-btn" 
                                        ${!window.appleMusicService?.isAuthorized && !window.appleMusicService?.catalogOnlyMode ? 'disabled title="Connect Apple Music first"' : ''}>
                                    🍎 Add to Apple Music
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            playlistsContainer.innerHTML = playlistsHtml;
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
        // Show progress
        showConversionProgress();
        updateProgressText(`Loading tracks from "${playlistName}"...`);
        
        // Get all tracks from Spotify playlist
        const spotifyTracks = await window.spotifyService.getPlaylistTracks(playlistId);
        
        if (!spotifyTracks.items || spotifyTracks.items.length === 0) {
            throw new Error('No tracks found in playlist');
        }
        
        // Count explicit tracks for info
        const explicitCount = spotifyTracks.items.filter(item => item.track && item.track.explicit).length;
        console.log(`📊 Playlist contains ${explicitCount}/${spotifyTracks.items.length} explicit tracks`);
        
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
            { maintainExplicit: true }
        );
        
        // Show results
        showConversionResults(result);
        
    } catch (error) {
        console.error('Conversion failed:', error);
        hideConversionProgress();
        alert(`Conversion failed: ${error.message}`);
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
    
    const explicitIndicator = progress.currentExplicit ? ' 🔞' : '';
    updateProgressText(`Converting track ${progress.current} of ${progress.total}: ${progress.currentTrack}${explicitIndicator}`);
    
    const explicitMatchRate = progress.successful > 0 
        ? Math.round((progress.explicitMatches / progress.successful) * 100) 
        : 0;
    
    document.getElementById('conversion-details').innerHTML = `
        <p>✅ Successfully converted: ${progress.successful}</p>
        <p>❌ Failed to convert: ${progress.failed}</p>
        <p>🎯 Explicit matches: ${progress.explicitMatches || 0}/${progress.successful || 0} (${explicitMatchRate}%)</p>
        <p>⚠️ Explicit mismatches: ${progress.explicitMismatches || 0}</p>
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
        ? `<div class="catalog-only-notice">📋 <strong>Preview Mode:</strong> ${result.message}</div>`
        : `<p>The playlist has been added to your Apple Music library.</p>`;
    
    summaryDiv.innerHTML = `
        <div class="conversion-summary">
            <h5>🎉 Playlist "${result.appleMusicPlaylist.attributes.name}" ${result.catalogOnlyMode ? 'analyzed' : 'created'} successfully!</h5>
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
        
        // Listen for Apple Music auth changes
        window.addEventListener('appleMusicAuthChanged', (event) => {
            console.log('🍎 Apple Music auth changed event:', event.detail);
            updateAppleMusicUI();
        });
        
    } else {
        document.getElementById('spotify-apple-login-prompt').style.display = 'block';
    }
});
</script>