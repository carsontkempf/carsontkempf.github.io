---
layout: default
title: My Account
permalink: /account/
---
<h2>My Account</h2>
<div id="account-details" style="display: none;">
    <p>Welcome to your account page. Only logged-in users can see this.</p>
    <p>User Profile: <pre id="user-profile-data"></pre></p>
    <button id="btn-get-api-key">Get My API Key</button>
    <p>Your API Key: <pre id="api-key-display" style="display:none;"></pre></p>
</div>
<p id="login-prompt" style="display: block;">Please <a href="#" onclick="window.siteAuth.auth0Client.loginWithRedirect({ appState: { targetUrl: window.location.pathname }}); return false;">log in</a> to view your account details.</p>

<script>
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for siteAuth to be initialized by auth.js
    function waitForSiteAuth() {
        return new Promise(resolve => {
            const interval = setInterval(() => {
                if (window.siteAuth && window.siteAuth.auth0Client) {
                    clearInterval(interval);
                    resolve(window.siteAuth);
                }
            }, 100);
        });
    }

    const siteAuth = await waitForSiteAuth();
    const accountDetailsDiv = document.getElementById('account-details');
    const loginPromptP = document.getElementById('login-prompt');
    const userProfilePre = document.getElementById('user-profile-data');
    const btnGetApiKey = document.getElementById('btn-get-api-key');
    const apiKeyDisplayPre = document.getElementById('api-key-display');

    async function updateAccountPageUI() {
        if (siteAuth.isAuthenticated) {
            accountDetailsDiv.style.display = 'block';
            loginPromptP.style.display = 'none';
            if (siteAuth.user && userProfilePre) {
                userProfilePre.textContent = JSON.stringify(siteAuth.user, null, 2);
            }
        } else {
            accountDetailsDiv.style.display = 'none';
            loginPromptP.style.display = 'block';
        }
    }

    await updateAccountPageUI(); // Initial UI update

    // Listen for auth state changes (optional, if auth.js emits custom events)
    // document.addEventListener('authStateChanged', updateAccountPageUI);

    if (btnGetApiKey) {
        btnGetApiKey.addEventListener('click', async () => {
            if (!siteAuth.isAuthenticated) {
                alert('Please log in to get an API key.');
                return;
            }
            const apiKey = await siteAuth.getApiKey();
            if (apiKey && apiKeyDisplayPre) {
                apiKeyDisplayPre.textContent = apiKey;
                apiKeyDisplayPre.style.display = 'block';
            } else if (apiKeyDisplayPre) {
                apiKeyDisplayPre.textContent = 'Could not retrieve API key.';
                apiKeyDisplayPre.style.display = 'block';
            }
        });
    }
});
</script>
