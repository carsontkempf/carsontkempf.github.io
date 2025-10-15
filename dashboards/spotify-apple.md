---
layout: dashboard-tool
title: Spotify Apple Integration
permalink: /spotify-apple/
dashboard_id: spotify-apple
parent_dashboard: apps
auth_required: true
---

{% include code-comprehension/auth-wrapper.html %}

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

<script src="{{ '/assets/js/spotify-integration.js' | relative_url }}"></script>