---
layout: default
title: Spotify Apple Integration
permalink: /spotify-apple/
---

<script src="/assets/js/role-protection.js"></script>

<style>
/* Mobile-First Responsive Design */

/* Disable all hover transforms in portrait mode (mobile) */
@media (orientation: portrait) {
    * {
        &:hover {
            transform: none !important;
        }
    }
}

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

@media (orientation: landscape) {
    .playlist-content:hover {
        opacity: 0.8;
    }
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

/* Apple Music Icon - White Background */
.apple-music-logo {
    background: white;
    border-radius: 16px;
    padding: 8px;
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
    <!-- Spotify Browse Section -->
    <div id="spotify-auth-section">
      <!-- FUTURE: Connect Spotify (OAuth) — re-enable when Spotify Premium API access is available
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
      -->

      <div id="spotify-search-idle" style="text-align: center;">
        <h3>Browse Spotify</h3>
        <p>Search for a public playlist or browse a user's playlists.</p>
        <div style="display: flex; justify-content: center; gap: 1rem; margin-top: 1rem;">
          <button class="dashboard-btn" onclick="setSearchMode('playlist')">Find Playlist</button>
          <button class="dashboard-btn" onclick="setSearchMode('user')">Find User</button>
        </div>
      </div>

      <div id="spotify-search-playlist" style="display: none;">
        <button class="back-btn" onclick="setSearchMode('idle')">Back</button>
        <h3>Find Playlist</h3>
        <p>Paste a Spotify playlist URL or enter a playlist ID.</p>
        <div style="display: flex; gap: 0.75rem; margin-top: 1rem; align-items: center;">
          <input id="playlist-url-input" type="text" placeholder="https://open.spotify.com/playlist/..." style="flex: 1; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; font-size: 0.95rem;">
          <button class="dashboard-btn" onclick="loadPublicPlaylist()">Load Playlist</button>
        </div>
        <div id="playlist-search-error" style="display: none; color: #c0392b; margin-top: 0.5rem;"></div>
      </div>

      <div id="spotify-search-user" style="display: none;">
        <button class="back-btn" onclick="setSearchMode('idle')">Back</button>
        <h3>Find User</h3>
        <p>Enter a Spotify username to browse their public playlists.</p>
        <div style="display: flex; gap: 0.75rem; margin-top: 1rem; align-items: center;">
          <input id="user-input" type="text" placeholder="Spotify username" style="flex: 1; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; font-size: 0.95rem;">
          <button class="dashboard-btn" onclick="loadPublicUserPlaylists()">Find User</button>
        </div>
        <div id="user-search-error" style="display: none; color: #c0392b; margin-top: 0.5rem;"></div>
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
      <div id="playlists-container"></div>
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

// Anonymous Spotify token service — no OAuth, no Premium required
// Proxy via Netlify function to avoid CORS on the token endpoint
const spotifyAnonService = {
    _token: null,
    _tokenExpires: 0,

    async getToken() {
        if (this._token && Date.now() < this._tokenExpires - 30000) {
            return this._token;
        }
        const resp = await fetch('/.netlify/functions/spotify-anon-token');
        if (!resp.ok) throw new Error('Failed to get Spotify token');
        const data = await resp.json();
        this._token = data.accessToken;
        this._tokenExpires = data.accessTokenExpirationTimestampMs || (Date.now() + 3600000);
        return this._token;
    },

    async apiRequest(endpoint) {
        const token = await this.getToken();
        const resp = await fetch(`https://api.spotify.com/v1${endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resp.status === 401) {
            this._token = null;
            return this.apiRequest(endpoint);
        }
        if (resp.status === 429) {
            const wait = parseInt(resp.headers.get('Retry-After') || '5') * 1000;
            await new Promise(r => setTimeout(r, wait));
            return this.apiRequest(endpoint);
        }
        return resp;
    }
};

// Search mode management
function setSearchMode(mode) {
    document.getElementById('spotify-search-idle').style.display = mode === 'idle' ? 'block' : 'none';
    document.getElementById('spotify-search-playlist').style.display = mode === 'playlist' ? 'block' : 'none';
    document.getElementById('spotify-search-user').style.display = mode === 'user' ? 'block' : 'none';
    if (mode === 'idle') {
        document.getElementById('spotify-data-section').style.display = 'none';
    }
    ['playlist-search-error', 'user-search-error'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.style.display = 'none'; el.textContent = ''; }
    });
}

function parsePlaylistId(input) {
    input = (input || '').trim();
    const m = input.match(/playlist\/([A-Za-z0-9]+)/);
    if (m) return m[1];
    if (/^[A-Za-z0-9]{22}$/.test(input)) return input;
    return null;
}

function escapeHtml(str) {
    if (str == null) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

async function fetchAnonPlaylistTracks(playlistId) {
    const allTracks = [];
    let offset = 0;
    const limit = 50;
    while (true) {
        const resp = await spotifyAnonService.apiRequest(`/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`);
        if (!resp.ok) throw new Error(`Spotify API error ${resp.status}`);
        const data = await resp.json();
        allTracks.push(...(data.items || []).filter(i => i?.track));
        if (!data.next) break;
        offset += limit;
    }
    return { items: allTracks, total: allTracks.length };
}

async function loadPublicPlaylist() {
    const input = document.getElementById('playlist-url-input').value;
    const errorDiv = document.getElementById('playlist-search-error');
    const playlistId = parsePlaylistId(input);

    if (!playlistId) {
        errorDiv.textContent = 'Please enter a valid Spotify playlist URL or ID.';
        errorDiv.style.display = 'block';
        return;
    }

    errorDiv.style.display = 'none';
    const dataSection = document.getElementById('spotify-data-section');
    const container = document.getElementById('playlists-container');
    dataSection.style.display = 'block';
    container.innerHTML = '<p>Loading playlist...</p>';

    try {
        const resp = await spotifyAnonService.apiRequest(`/playlists/${playlistId}?fields=id,name,owner,tracks.total,description`);
        if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.error?.message || `Spotify API error ${resp.status}`);
        }
        const playlist = await resp.json();
        const total = playlist.tracks?.total ?? 0;
        container.innerHTML = `
            <div class="playlists-summary">
                <h4>${escapeHtml(playlist.name)}</h4>
                <p>${total} tracks &bull; Owner: ${escapeHtml(playlist.owner?.display_name || playlist.owner?.id || '')}</p>
            </div>
            <div style="margin-top: 1rem;">
                <button class="dashboard-btn" onclick="showPublicPlaylistTracks('${playlist.id}', '${playlist.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'")}', false)">View Tracks &amp; Convert</button>
            </div>
        `;
    } catch (err) {
        container.innerHTML = `<p style="color:#c0392b;">Error: ${escapeHtml(err.message)}</p>`;
    }
}

async function loadPublicUserPlaylists() {
    const username = document.getElementById('user-input').value.trim();
    const errorDiv = document.getElementById('user-search-error');

    if (!username) {
        errorDiv.textContent = 'Please enter a Spotify username.';
        errorDiv.style.display = 'block';
        return;
    }

    errorDiv.style.display = 'none';
    const dataSection = document.getElementById('spotify-data-section');
    const container = document.getElementById('playlists-container');
    dataSection.style.display = 'block';
    container.innerHTML = '<p>Loading playlists...</p>';

    try {
        const allPlaylists = [];
        let offset = 0;
        const limit = 50;
        while (true) {
            const resp = await spotifyAnonService.apiRequest(`/users/${encodeURIComponent(username)}/playlists?limit=${limit}&offset=${offset}`);
            if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                throw new Error(err.error?.message || `Spotify API error ${resp.status}`);
            }
            const data = await resp.json();
            allPlaylists.push(...(data.items || []));
            if (!data.next) break;
            offset += limit;
        }

        if (allPlaylists.length === 0) {
            container.innerHTML = '<p>No public playlists found for this user.</p>';
            return;
        }

        container.innerHTML = `
            <div class="playlists-summary">
                <h4>Found ${allPlaylists.length} playlist${allPlaylists.length !== 1 ? 's' : ''} for ${escapeHtml(username)}</h4>
                <p>Select playlists to convert to Apple Music</p>
            </div>
            <div class="playlist-controls">
                <label class="checkbox-label">
                    <input type="checkbox" id="select-all-playlists"> Select All
                </label>
                <button id="convert-selected-btn" class="dashboard-btn" style="display: none;" disabled>
                    Convert Selected to Apple Music
                </button>
            </div>
            <div class="playlists-grid">
                ${allPlaylists.map(p => `
                    <div class="playlist-item" data-playlist-id="${p.id}" data-playlist-name="${escapeHtml(p.name)}" data-track-count="${p.tracks?.total || 0}">
                        <div class="playlist-checkbox">
                            <input type="checkbox" class="playlist-select" value="${p.id}">
                        </div>
                        <div class="playlist-content" onclick="showPublicPlaylistTracks('${p.id}', '${p.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'")}', true)">
                            <h4>${escapeHtml(p.name)}</h4>
                            <p>Tracks: ${p.tracks?.total || 0}</p>
                            <p>Owner: ${escapeHtml(p.owner?.display_name || p.owner?.id || '')}</p>
                            <p class="playlist-type">${p.public ? 'Public' : 'Private'}</p>
                            <p class="click-hint">Click to view tracks</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        document.getElementById('convert-selected-btn').style.display = 'inline-block';
        setupPlaylistSelection();
    } catch (err) {
        container.innerHTML = `<p style="color:#c0392b;">Error: ${escapeHtml(err.message)}</p>`;
    }
}

let _loadedTracks = [];
let _loadedPlaylistId = null;
let _loadedPlaylistName = null;

async function showPublicPlaylistTracks(playlistId, playlistName, showBackToUser) {
    const container = document.getElementById('playlists-container');
    container.innerHTML = `<p>Loading tracks from "${escapeHtml(playlistName)}"...</p>`;

    try {
        const allTracks = [];
        let offset = 0;
        const limit = 50;
        while (true) {
            const resp = await spotifyAnonService.apiRequest(`/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`);
            if (!resp.ok) throw new Error(`Spotify API error ${resp.status}`);
            const data = await resp.json();
            allTracks.push(...(data.items || []).filter(i => i?.track));
            if (!data.next) break;
            offset += limit;
        }

        _loadedTracks = allTracks;
        _loadedPlaylistId = playlistId;
        _loadedPlaylistName = playlistName;

        const backFn = showBackToUser ? 'loadPublicUserPlaylists()' : "setSearchMode('playlist')";

        container.innerHTML = `
            <div class="playlist-tracks-header">
                <button onclick="${backFn}" class="back-btn">Back to Playlists</button>
                <h3>${escapeHtml(playlistName)}</h3>
                <p>${allTracks.length} tracks</p>
                <button class="dashboard-btn" onclick="convertPublicPlaylist()">Convert to Apple Music</button>
            </div>
            <div class="tracks-list">
                ${allTracks.map((item, i) => {
                    const t = item.track;
                    const artists = (t.artists || []).map(a => a.name).join(', ') || 'Unknown Artist';
                    return `
                        <div class="track-item">
                            <div class="track-number">${i + 1}</div>
                            <div class="track-info">
                                <div class="track-name">${escapeHtml(t.name)}${t.explicit ? '<span class="explicit-badge">E</span>' : ''}</div>
                                <div class="track-artist">${escapeHtml(artists)}</div>
                                <div class="track-album">${escapeHtml(t.album?.name || '')}</div>
                            </div>
                            <div class="track-meta">
                                <div class="track-duration">${formatDuration(t.duration_ms)}</div>
                                <div class="track-added">Added: ${formatDate(item.added_at)}</div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    } catch (err) {
        container.innerHTML = `<p style="color:#c0392b;">Error loading tracks: ${escapeHtml(err.message)}</p>`;
    }
}

async function convertPublicPlaylist() {
    if (!window.appleMusicService?.isAuthorized && !window.appleMusicService?.catalogOnlyMode) {
        alert('Please connect to Apple Music first.');
        return;
    }
    if (!_loadedTracks.length) {
        alert('No tracks loaded. Please load a playlist first.');
        return;
    }
    try {
        conversionCancelled = false;
        conversionInProgress = true;
        showConversionProgress();
        updateProgressText(`Starting conversion of "${_loadedPlaylistName}"...`);
        const playlist = { id: _loadedPlaylistId, name: _loadedPlaylistName, track_count: _loadedTracks.length };
        const result = await window.appleMusicService.convertSpotifyPlaylist(
            playlist,
            _loadedTracks,
            (progress) => updateConversionProgress(progress),
            { maintainExplicit: true, checkCancellation: () => conversionCancelled }
        );
        if (result.cancelled) {
            showConversionResults({ ...result, message: 'Transfer cancelled. Partial results shown.' });
        } else {
            showConversionResults(result);
        }
    } catch (err) {
        hideConversionProgress();
        alert(getUserFriendlyError(err));
    } finally {
        conversionInProgress = false;
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

// Initialize Apple Music once auth + config are both ready
function initializeServices() {
    if (window.authService?.isAuthenticated && window.envConfig?.initialized) {
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
window.addEventListener('auth:ready', async (event) => {
    console.log('Auth ready event received');

    const isAuthenticated = event.detail?.isAuthenticated;

    if (!isAuthenticated) {
        document.getElementById('spotify-apple-login-prompt').innerHTML = `
            <h2>Access Denied</h2>
            <p>You must be logged in to view this page.</p>
            <button onclick="authService.login()" class="login-btn">Log In</button>
        `;
        document.getElementById('spotify-apple-login-prompt').style.display = 'block';
        return;
    }

    const user = await window.authService.getUser();
    const role = (user?.role || '').toLowerCase();
    const roles = (user?.roles || []).map(r => r.toLowerCase());
    const isSiteOwner = user?.email === 'carsontkempf@gmail.com' || user?.email === 'ctkfdp@umsystem.edu';
    const hasAccess = role === 'admin' || roles.includes('admin') ||
                      role === 'spotify-apple' || roles.includes('spotify-apple') ||
                      isSiteOwner;

    if (!hasAccess) {
        const allRoles = await window.authService.getRoles();
        document.getElementById('spotify-apple-login-prompt').innerHTML = `
            <h2>Access Denied</h2>
            <p>You do not have permission to access this page.</p>
            <p>This page requires the Spotify-Apple or Admin role.</p>
            <p>Your roles: ${allRoles.join(', ') || 'None'}</p>
        `;
        document.getElementById('spotify-apple-login-prompt').style.display = 'block';
        return;
    }

    if (isAuthenticated) {
        document.getElementById('spotify-apple-content-wrapper').style.display = 'block';
        
        const profileDiv = document.getElementById('user-profile-details');
        
        if (user && profileDiv) {
            profileDiv.innerHTML = `
                <p class="welcome-message">Welcome, ${user.name || user.email}!</p>
                <p class="login-status">Your login status is confirmed.</p>
            `;
        }
        
        initializeServices();
        updateAppleMusicUI();

        document.getElementById('apple-music-connect-btn').addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                if (!window.appleMusicService.isInitialized) {
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

        document.getElementById('cancel-conversion-btn').addEventListener('click', (e) => {
            e.preventDefault();
            if (conversionInProgress) {
                if (confirm('Are you sure you want to cancel the transfer? Partial progress will be lost.')) {
                    conversionCancelled = true;
                }
            }
        });

        window.addEventListener('appleMusicAuthChanged', () => {
            updateAppleMusicUI();
        });

    } else {
        document.getElementById('spotify-apple-login-prompt').style.display = 'block';
    }
});

// Setup playlist selection functionality (called after user playlist grid is rendered)
function setupPlaylistSelection() {
    const selectAllCheckbox = document.getElementById('select-all-playlists');
    const convertSelectedBtn = document.getElementById('convert-selected-btn');
    const playlistCheckboxes = document.querySelectorAll('.playlist-select');

    convertSelectedBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await convertSelectedPlaylists();
    });

    selectAllCheckbox.addEventListener('change', (e) => {
        playlistCheckboxes.forEach(checkbox => {
            checkbox.checked = e.target.checked;
        });
        updateConvertButtonState();
    });

    playlistCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateConvertButtonState();
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
                const spotifyTracks = await fetchAnonPlaylistTracks(playlist.id);

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