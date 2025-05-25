---
layout: login_layout
title: Log In
permalink: /login/
---
<div class="login-container">
    <h2>Login to Carson's Meditations</h2>
    <p>You will be redirected to our secure login page.</p>
    <button id="btn-actual-login">Proceed to Login</button>
    <p id="login-message" style="display:none; color: #555; margin-top: 15px;">Initializing login...</p>
</div>

<script>
document.addEventListener('DOMContentLoaded', async () => {
    const actualLoginButton = document.getElementById('btn-actual-login');
    const loginMessage = document.getElementById('login-message');

    function waitForSiteAuth() {
        return new Promise((resolve, reject) => {
            let retries = 0;
            const maxRetries = 50; // Wait for 5 seconds
            const interval = setInterval(() => {
                if (window.siteAuth && window.siteAuth.auth0Client) {
                    clearInterval(interval);
                    resolve(window.siteAuth);
                } else if (retries >= maxRetries) {
                    clearInterval(interval);
                    reject(new Error("Auth0 client did not initialize in time."));
                }
                retries++;
            }, 100);
        });
    }

    actualLoginButton.addEventListener('click', async () => {
        actualLoginButton.disabled = true;
        loginMessage.style.display = 'block';
        const siteAuth = await waitForSiteAuth();
        await siteAuth.auth0Client.loginWithRedirect({ appState: { targetUrl: '/' }}); // Redirect to homepage after login
    });
});
</script>