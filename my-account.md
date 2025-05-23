---
layout: page
title: My Account
permalink: /account/
---

<h2>My Account</h2>
<div id="account-details"><p>Loading account information...</p></div>
<button id="btn-get-api-key" style="display: none;">Get My API Key</button>
<p id="api-key-display" style="display: none;"></p>

<script>
document.addEventListener('DOMContentLoaded', () => {
  const accountDetailsDiv = document.getElementById('account-details');
  const getApiKeyButton = document.getElementById('btn-get-api-key');
  const apiKeyDisplayP = document.getElementById('api-key-display');

  function renderAccountPage() {
    if (window.siteAuth && window.siteAuth.isAuthenticated && window.siteAuth.user) {
      accountDetailsDiv.innerHTML = `<p>Welcome, ${window.siteAuth.user.name}!</p><p>Email: ${window.siteAuth.user.email}</p>`;
      getApiKeyButton.style.display = 'block';
    } else {
      accountDetailsDiv.innerHTML = '<p>Please <a href="#" id="login-link">log in</a> to view your account details.</p>';
      const loginLink = document.getElementById('login-link');
      if (loginLink) {
        loginLink.addEventListener('click', (e) => {
          e.preventDefault();
          if (window.siteAuth && window.siteAuth.auth0Client) {
            window.siteAuth.auth0Client.loginWithRedirect({
              authorizationParams: {
                redirect_uri: window.location.origin + '/account/', // Redirect back to account page
              },
              appState: { targetUrl: window.location.pathname }
            });
          } else {
            // Fallback if auth0Client isn't ready, though the interval should prevent this
            alert('Authentication system not ready. Please try again in a moment.');
          }
        });
      }
      getApiKeyButton.style.display = 'none';
      apiKeyDisplayP.style.display = 'none';
    }
  }

  const checkAuthReadyInterval = setInterval(() => {
    // Check for auth0Client for login link, and isAuthenticated for initial render logic
    if (window.siteAuth && typeof window.siteAuth.isAuthenticated !== 'undefined' && window.siteAuth.auth0Client) {
      clearInterval(checkAuthReadyInterval);
      renderAccountPage();

      if (getApiKeyButton) {
        getApiKeyButton.addEventListener('click', async () => {
          if (window.siteAuth && window.siteAuth.getApiKey) {
            apiKeyDisplayP.textContent = 'Fetching API key...';
            apiKeyDisplayP.style.display = 'block';
            const apiKey = await window.siteAuth.getApiKey();
            if (apiKey) {
              apiKeyDisplayP.textContent = `Your API Key: ${apiKey}`;
            } else {
              apiKeyDisplayP.textContent = 'Could not retrieve API key.';
            }
          } else {
            apiKeyDisplayP.textContent = 'API key function not available.';
            apiKeyDisplayP.style.display = 'block';
          }
        });
      }
    }
  }, 100); // Poll every 100ms
});
</script>
