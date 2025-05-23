---
layout: page
title: My Account
permalink: /account/
---

<h2>My Account</h2>
<div id="account-details"><p>Loading account information...</p></div>

<button id="btn-get-api-key" style="display: none;">Get My API Key</button> <!-- Uncomment if you want to test this -->
<p id="api-key-display" style="display: none;"></p>

<script>
document.addEventListener('DOMContentLoaded', () => {
  const accountDetailsDiv = document.getElementById('account-details');
  const getApiKeyButton = document.getElementById('btn-get-api-key'); // Uncomment if button is active
  const apiKeyDisplayP = document.getElementById('api-key-display'); // Uncomment if display P is active

  function renderAccountPage() {
    if (window.siteAuth && window.siteAuth.isAuthenticated && window.siteAuth.user) {
      accountDetailsDiv.innerHTML = `<p>Welcome, ${window.siteAuth.user.name}!</p><p>Email: ${window.siteAuth.user.email}</p>`;
      if (getApiKeyButton) getApiKeyButton.style.display = 'block'; // Uncomment if button is active
    } else {
      accountDetailsDiv.innerHTML = '<p>Please <a href="#" id="login-link">log in</a> to view your account details.</p>';
      const loginLink = document.getElementById('login-link');
      if (loginLink) {
        loginLink.addEventListener('click', (e) => {
          e.preventDefault();
          if (window.siteAuth && window.siteAuth.auth0Client) {
            const configuredAudience = window.siteAuth.auth0Client.options.authorizationParams.audience;
            if (!configuredAudience) {
              console.error("Audience is not configured in auth0Client options. Cannot log in.");
              alert("Authentication configuration error. Audience missing.");
              return;
            }
            window.siteAuth.auth0Client.loginWithRedirect({
              authorizationParams: {
                redirect_uri: window.location.origin, // Standardize redirect_uri
                audience: configuredAudience
              },
              appState: { targetUrl: '/account/' } // Specify targetUrl to return to /account/
            });
          } else {
            alert('Authentication system not ready. Please try again in a moment.');
          }
        });
      }
      if (getApiKeyButton) getApiKeyButton.style.display = 'none';
      if (apiKeyDisplayP) apiKeyDisplayP.style.display = 'none';
    }
  }

  const checkAuthReadyInterval = setInterval(() => {
    // Check for auth0Client for login link, and isAuthenticated for initial render logic
    if (window.siteAuth && typeof window.siteAuth.isAuthenticated !== 'undefined' && window.siteAuth.auth0Client) {
      clearInterval(checkAuthReadyInterval);
      renderAccountPage();

      if (getApiKeyButton) { // Uncomment if button is active
        getApiKeyButton.addEventListener('click', async () => {
          if (window.siteAuth && window.siteAuth.getApiKey) {
            if (apiKeyDisplayP) {
              apiKeyDisplayP.textContent = 'Fetching API key...';
              apiKeyDisplayP.style.display = 'block';
            }
            const apiKey = await window.siteAuth.getApiKey();
            if (apiKeyDisplayP) {
              if (apiKey) {
                apiKeyDisplayP.textContent = `Your API Key: ${apiKey}`;
              } else {
                apiKeyDisplayP.textContent = 'Could not retrieve API key.';
              }
            }
          } else {
            if (apiKeyDisplayP) {
              apiKeyDisplayP.textContent = 'API key function not available.';
              apiKeyDisplayP.style.display = 'block';
            }
          }
        });
      }
    }
  }, 100); // Poll every 100ms
});
</script>
