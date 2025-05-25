---
layout: default
title: Dashboard
permalink: /dashboard/
---
<h2>Dashboard</h2>

<!-- Content for all authenticated users -->
<div id="dashboard-general-content" style="display: none;">
    <p>Welcome to your dashboard. This content is visible to all logged-in users.</p>
</div>

<!-- Content specifically for subscribers -->
<div id="dashboard-subscriber-content" style="display: none;">
    <p style="color: green; font-weight: bold;">Welcome, valued Subscriber! Here's your exclusive content.</p>
    <!-- Add more subscriber-specific content here -->
</div>

<p id="dashboard-login-prompt" style="display: block;">Please <a href="#" onclick="window.siteAuth.auth0Client.loginWithRedirect({ appState: { targetUrl: window.location.pathname }}); return false;">log in</a> to view the dashboard.</p>

<script>
document.addEventListener('DOMContentLoaded', async () => {
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
    const dashboardGeneralContentDiv = document.getElementById('dashboard-general-content');
    const dashboardSubscriberContentDiv = document.getElementById('dashboard-subscriber-content');
    const loginPromptP = document.getElementById('dashboard-login-prompt');

    async function updateDashboardPageUI() {
        const isAuthenticated = siteAuth.isAuthenticated; // Or await siteAuth.checkAccess();
        const isSubscriber = await siteAuth.checkAccess('subscriber');

        if (isAuthenticated) {
            dashboardGeneralContentDiv.style.display = 'block';
            loginPromptP.style.display = 'none';

            if (isSubscriber) {
                dashboardSubscriberContentDiv.style.display = 'block';
            } else {
                dashboardSubscriberContentDiv.style.display = 'none';
            }
        } else {
            dashboardGeneralContentDiv.style.display = 'none';
            dashboardSubscriberContentDiv.style.display = 'none';
            loginPromptP.style.display = 'block';
        }
    }
    await updateDashboardPageUI();
});
</script>
