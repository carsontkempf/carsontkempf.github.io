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
console.log('Dashboard Script - Script loaded');

// Use the successful pattern from Code Comprehension Project
document.addEventListener('siteAuthReady', async () => {
    console.log('Dashboard - siteAuthReady event fired');
    
    const authenticatedContent = document.getElementById('authenticated-content');
    const loginRequiredContent = document.getElementById('login-required-content');
    const userProfileSection = document.getElementById('user-profile-section');
    const subscriberContent = document.getElementById('subscriber-content');
    const freeUserContent = document.getElementById('free-user-content');
    
    console.log('Dashboard - Elements found:', {
        authenticatedContent: !!authenticatedContent,
        loginRequiredContent: !!loginRequiredContent,
        userProfileSection: !!userProfileSection,
        subscriberContent: !!subscriberContent,
        freeUserContent: !!freeUserContent,
        siteAuthExists: !!window.siteAuth,
        isAuthenticated: window.siteAuth?.isAuthenticated
    });

    if (window.siteAuth && window.siteAuth.isAuthenticated) {
        console.log('Dashboard - User is authenticated');
        
        // Hide login prompt and show authenticated content
        if (loginRequiredContent) loginRequiredContent.style.display = 'none';
        if (authenticatedContent) authenticatedContent.style.display = 'block';

        // Get user data directly from siteAuth (which should match auth0Client.getUser())
        const user = window.siteAuth.user;
        console.log('Dashboard - User data:', user);
        
        // Check user roles using the same pattern as Code Comprehension Project
        const customRoles = user['https://carsontkempf.github.io/auth/roles'] || [];
        const auth0Roles = user['https://auth0.com/roles'] || [];
        const appMetadataRoles = user.app_metadata?.roles || [];
        const userMetadataRoles = user.user_metadata?.roles || [];
        const rolesArray = user.roles || [];
        
        // Combine all possible role sources
        const allRoles = [...customRoles, ...auth0Roles, ...appMetadataRoles, ...userMetadataRoles, ...rolesArray];
        
        console.log('Dashboard - Role Debug Info:', {
            customRoles: customRoles,
            auth0Roles: auth0Roles,
            appMetadataRoles: appMetadataRoles,
            userMetadataRoles: userMetadataRoles,
            rolesArray: rolesArray,
            allRoles: allRoles,
            userEmail: user.email,
            userSub: user.sub
        });
        
        // Check for various admin/premium roles
        const hasAdminRole = allRoles.includes('admin');
        const hasVipRole = allRoles.includes('VIP');
        const hasSubscriberRole = allRoles.includes('subscriber');
        const hasCodeComprehensionRole = allRoles.includes('Code-Comprehension-Project');
        const isSiteOwner = user.email === 'ctkfdp@umsystem.edu';
        
        // User has premium access if they have any elevated role
        const hasPremiumAccess = hasAdminRole || hasVipRole || hasSubscriberRole || hasCodeComprehensionRole || isSiteOwner;
        
        console.log('Dashboard - Access Check:', {
            hasAdminRole,
            hasVipRole, 
            hasSubscriberRole,
            hasCodeComprehensionRole,
            isSiteOwner,
            hasPremiumAccess
        });

        // Display user profile information
        if (user && userProfileSection) {
            userProfileSection.innerHTML = `
                <div class="user-profile">
                    <p><strong>Name:</strong> ${user.name || 'N/A'}</p>
                    <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
                    <p><strong>Account Type:</strong> <span id="account-type">Loading...</span></p>
                    <p><strong>Roles:</strong> ${allRoles.join(', ') || 'None'}</p>
                </div>
            `;
        }
        
        if (hasPremiumAccess) {
            console.log('Dashboard - User has premium access, showing subscriber content');
            // User has premium access
            if (subscriberContent) subscriberContent.style.display = 'block';
            if (freeUserContent) freeUserContent.style.display = 'none';
            
            let accountType = 'Free';
            if (hasAdminRole) accountType = 'Admin';
            else if (hasVipRole) accountType = 'VIP';  
            else if (hasSubscriberRole) accountType = 'Subscriber';
            else if (hasCodeComprehensionRole) accountType = 'Project Access';
            else if (isSiteOwner) accountType = 'Site Owner';
            
            const accountTypeElement = document.getElementById('account-type');
            if (accountTypeElement) accountTypeElement.textContent = accountType;
            
        } else {
            console.log('Dashboard - User does not have premium access, showing free content');
            // User is a free user
            if (subscriberContent) subscriberContent.style.display = 'none';
            if (freeUserContent) freeUserContent.style.display = 'block';
            
            const accountTypeElement = document.getElementById('account-type');
            if (accountTypeElement) accountTypeElement.textContent = 'Free';
        }

    } else {
        console.log('Dashboard - User not authenticated, showing login prompt');
        // User is not authenticated
        if (loginRequiredContent) loginRequiredContent.style.display = 'block';
        if (authenticatedContent) authenticatedContent.style.display = 'none';
    }
});

console.log('Dashboard - Setting up timeout fallback');

// Timeout fallback like in Code Comprehension Project
setTimeout(() => {
    console.log('Dashboard - Timeout check - siteAuth available:', !!window.siteAuth);
    console.log('Dashboard - Timeout check - isAuthenticated:', window.siteAuth?.isAuthenticated);
    
    const authenticatedContent = document.getElementById('authenticated-content');
    const loginRequiredContent = document.getElementById('login-required-content');
    
    if (!window.siteAuth || !window.siteAuth.isAuthenticated) {
        console.log('Dashboard - Timeout triggered, showing login prompt');
        if (loginRequiredContent) loginRequiredContent.style.display = 'block';
        if (authenticatedContent) authenticatedContent.style.display = 'none';
    } else if (authenticatedContent && authenticatedContent.style.display !== 'block') {
        console.log('Dashboard - Auth available but content not shown, triggering manual auth check');
        // Manually trigger auth check
        const event = new CustomEvent('siteAuthReady');
        document.dispatchEvent(event);
    }
}, 5000);

console.log('Dashboard - Script setup completed');
</script>