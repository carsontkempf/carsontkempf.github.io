---
layout: dashboard
title: Dashboard
permalink: /dashboard/
---

<div id="authenticated-content" style="display: none;">
  <!-- User Profile Section -->
  <div class="dashboard-section">
    <h3>Profile</h3>
    <div id="user-profile-section">
      <p>Loading profile...</p>
    </div>
  </div>

  <!-- Subscriber-Only Content Section -->
  <div id="subscriber-content" class="dashboard-section" style="display: none;">
    <h3>Subscriber Features</h3>
    <div class="feature-grid">
      
      <!-- Spotify to Apple Music Transfer Feature -->
      <div class="feature-card">
        <h4>Spotify to Apple Music Transfer</h4>
        <p>Transfer your playlists between Spotify and Apple Music.</p>
        <a href="{{ '/spotify-apple/' | relative_url }}" class="dashboard-btn">Access Transfer Tool</a>
      </div>

      <!-- Add more subscriber features here -->
      
    </div>
  </div>

  <!-- Free User Content Section -->
  <div id="free-user-content" class="dashboard-section" style="display: none;">
    <h3>Available Features</h3>
    <div class="feature-grid">
      
      <!-- Basic Features for Free Users -->
      <div class="feature-card">
        <h4>Basic Features</h4>
        <p>Access basic functionality available to all registered users.</p>
      </div>
      
      <!-- Upgrade Prompt -->
      <div class="feature-card upgrade-prompt">
        <h4>Unlock More Features</h4>
        <p>Upgrade to subscriber access to unlock playlist transfer tools and more.</p>
        <button class="dashboard-btn">Upgrade Account</button>
      </div>
      
    </div>
  </div>
</div>

<div id="login-required-content" style="display: block;">
  <div class="login-prompt">
    <h2>Login Required</h2>
    <p>Please log in to access your dashboard.</p>
    <button onclick="window.siteAuth.login()" class="dashboard-btn">Log In</button>
  </div>
</div>

<script>
// Dashboard initialization
document.addEventListener('siteAuthReady', async () => {
  const authenticatedContent = document.getElementById('authenticated-content');
  const loginRequiredContent = document.getElementById('login-required-content');
  const userProfileSection = document.getElementById('user-profile-section');
  const subscriberContent = document.getElementById('subscriber-content');
  const freeUserContent = document.getElementById('free-user-content');

  if (window.siteAuth.isAuthenticated) {
    // Hide login prompt and show authenticated content
    loginRequiredContent.style.display = 'none';
    authenticatedContent.style.display = 'block';

    // Display user profile information
    const user = window.siteAuth.user;
    if (user && userProfileSection) {
      userProfileSection.innerHTML = `
        <div class="user-profile">
          <p><strong>Name:</strong> ${user.name || 'N/A'}</p>
          <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
          <p><strong>Account Type:</strong> <span id="account-type">Loading...</span></p>
        </div>
      `;
    }

    // Check user's subscription status - support both VIP and subscriber roles
    const user = await window.siteAuth.auth0Client.getUser();
    const rolesNamespace = 'https://carsontkempf.github.io/auth/roles';
    const userRoles = user && user[rolesNamespace] ? user[rolesNamespace] : [];
    
    const hasVipAccess = userRoles.includes('VIP');
    const hasSubscriberAccess = userRoles.includes('subscriber');
    const hasPremiumAccess = hasVipAccess || hasSubscriberAccess;
    
    if (hasPremiumAccess) {
      // User has VIP or subscriber access
      subscriberContent.style.display = 'block';
      freeUserContent.style.display = 'none';
      
      if (hasVipAccess) {
        document.getElementById('account-type').textContent = 'VIP';
      } else {
        document.getElementById('account-type').textContent = 'Subscriber';
      }
    } else {
      // User is a free user
      subscriberContent.style.display = 'none';
      freeUserContent.style.display = 'block';
      document.getElementById('account-type').textContent = 'Free';
    }

  } else {
    // User is not authenticated
    loginRequiredContent.style.display = 'block';
    authenticatedContent.style.display = 'none';
  }
});

// Fallback initialization in case siteAuthReady event doesn't fire
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit for auth to initialize, then check if we missed the event
  setTimeout(() => {
    if (!document.getElementById('authenticated-content').style.display && 
        window.siteAuth && 
        typeof window.siteAuth.isAuthenticated !== 'undefined') {
      // Manually trigger the auth check
      const event = new CustomEvent('siteAuthReady');
      document.dispatchEvent(event);
    }
  }, 2000);
});
</script>