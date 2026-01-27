---
layout: dashboard
title: Dashboard
permalink: /dashboard/
---

<script src="/assets/js/role-protection.js"></script>

<div id="auth-message"></div>

<script>
console.log('[DASHBOARD DEBUG] dashboard.md script loaded');
console.log('[DASHBOARD DEBUG] Waiting for authReady event...');

document.addEventListener('authReady', async () => {
  console.log('[DASHBOARD DEBUG] authReady event fired');
  console.log('[DASHBOARD DEBUG] window.authService:', window.authService);
  console.log('[DASHBOARD DEBUG] isAuthenticated:', window.authService?.isAuthenticated);

  if (!window.authService.isAuthenticated) {
    console.log('[DASHBOARD DEBUG] User NOT authenticated - showing login prompt');
    document.querySelector('.site-content').style.display = 'none';
    const messageEl = document.getElementById('auth-message') || document.querySelector('.site-content');
    messageEl.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <h2>Authentication Required</h2>
        <p>Please log in to access your dashboard.</p>
        <button onclick="window.authService.login()" style="padding: 10px 20px; margin-top: 20px; cursor: pointer;">
          Log In
        </button>
      </div>
    `;
    messageEl.style.display = 'block';
  } else {
    console.log('[DASHBOARD DEBUG] User IS authenticated');
    console.log('[DASHBOARD DEBUG] User data:', window.authService.user);
  }
});

console.log('[DASHBOARD DEBUG] Event listener registered');
</script>