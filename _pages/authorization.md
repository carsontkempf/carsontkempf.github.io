---
layout: page
title: Authorization Management
permalink: /authorization/
---

<style>
.auth0-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.auth0-header {
    text-align: center;
    margin-bottom: 40px;
}

.auth0-header h1 {
    font-size: 2.5rem;
    color: #2c3e50;
    margin-bottom: 10px;
}

.auth0-header p {
    font-size: 1.1rem;
    color: #7f8c8d;
}

.nav-section {
    text-align: center;
    margin-bottom: 30px;
    padding: 20px;
    background: rgba(52, 152, 219, 0.1);
    border-radius: 8px;
    border-left: 4px solid #3498db;
}

.nav-btn {
    display: inline-block;
    margin: 0 10px;
    padding: 10px 20px;
    background: #3498db;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.nav-btn:hover {
    background: #2980b9;
    transform: translateY(-1px);
    text-decoration: none;
    color: white;
}

.auth0-section {
    background: white;
    border-radius: 12px;
    padding: 25px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    border-left: 4px solid #3498db;
    margin-bottom: 30px;
}

.auth0-section h2 {
    color: #2c3e50;
    margin-bottom: 20px;
    font-size: 1.5rem;
}

.auth0-section h3 {
    color: #2c3e50;
    margin-bottom: 15px;
    font-size: 1.2rem;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    color: #2c3e50;
    font-weight: 500;
}

.form-group input,
.form-group select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
}

.form-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.auth0-btn {
    background: #3498db;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.auth0-btn:hover {
    background: #2980b9;
    transform: translateY(-1px);
}

.auth0-btn.secondary {
    background: #95a5a6;
}

.auth0-btn.secondary:hover {
    background: #7f8c8d;
}

.auth0-btn.danger {
    background: #e74c3c;
}

.auth0-btn.danger:hover {
    background: #c0392b;
}

.users-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 20px;
}

.user-card {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 20px;
    border-left: 3px solid #3498db;
}

.user-card h4 {
    color: #2c3e50;
    margin-bottom: 10px;
}

.user-card p {
    color: #7f8c8d;
    margin: 5px 0;
    font-size: 14px;
}

.user-roles {
    margin-top: 10px;
}

.role-badge {
    display: inline-block;
    background: #3498db;
    color: white;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    margin: 2px;
}

.lookup-results {
    margin-top: 20px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
    min-height: 50px;
}

.role-management-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    margin-top: 20px;
}

.role-section-card {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 20px;
}

@media (max-width: 768px) {
    .users-grid {
        grid-template-columns: 1fr;
    }

    .role-management-container {
        grid-template-columns: 1fr;
    }
}
</style>

<div id="auth0-dashboard">
  <div class="auth0-container">
    <header class="auth0-header">
      <h1>{{ page.title }}</h1>
      <p>Manage Learn user identities and roles</p>
    </header>

    <div class="nav-section">
      <a href="/dashboard/" class="nav-btn">Back to Dashboard</a>
    </div>

  <main class="section-main-content">
    <div id="auth0-content-wrapper" style="display: none;">

      <!-- All Users Section -->
      <section class="auth0-section">
        <h2>All Users</h2>
        <div id="users-list" class="users-grid">
          <p>Loading users...</p>
        </div>
      </section>

      <!-- Role Management Section -->
      <section class="auth0-section">
        <h2>Role Management</h2>
        <div class="role-management-container">
          <div class="role-section-card">
            <h3>Assign Role to User</h3>
            <div class="form-group">
              <label for="user-email-role">User Email:</label>
              <input type="email" id="user-email-role" placeholder="Enter user email">
            </div>
            <div class="form-group">
              <label for="role-selection">Select Role:</label>
              <select id="role-selection">
                <!-- Roles will be loaded dynamically -->
              </select>
            </div>
            <div class="form-actions">
              <button onclick="assignRoleToUser()" class="auth0-btn">Assign Role</button>
              <button onclick="removeRoleFromUser()" class="auth0-btn secondary">Remove Role</button>
            </div>
          </div>

          <div class="role-section-card">
            <h3>User Role Lookup</h3>
            <div class="form-group">
              <label for="lookup-email">User Email:</label>
              <input type="email" id="lookup-email" placeholder="Enter user email to lookup">
            </div>
            <div class="form-actions">
              <button onclick="lookupUserRoles()" class="auth0-btn">Lookup User Roles</button>
            </div>
            <div id="user-lookup-results" class="lookup-results"></div>
          </div>

          <div class="role-section-card">
            <h3>All Roles</h3>
            <div id="all-roles-list" class="lookup-results">
              <p>Loading roles...</p>
            </div>
          </div>
        </div>
      </section>

    </div>

    <div id="auth0-login-prompt" style="display: none;">
      <h2>Access Denied</h2>
      <p>You must be logged in with appropriate permissions to view this page.</p>
      <button onclick="window.location.href='/login/'" class="login-btn">Log In</button>
    </div>
  </main>
  </div>
</div>

<script>
const LEARN_API = 'https://cloudprototype.org/api/auth';
let userCache = [];

function getUserToken() {
  return sessionStorage.getItem('learn_auth_token') || localStorage.getItem('learn_auth_token') || null;
}

window.addEventListener('auth:ready', async function(event) {
  if (!event.detail?.isAuthenticated) {
    document.getElementById('auth0-login-prompt').style.display = 'block';
    return;
  }
  try {
    const user = await window.authService.getUser();
    await checkAdminPermissions(user);
  } catch (err) {
    console.error('[AUTHZ] Error checking authentication:', err);
    document.getElementById('auth0-login-prompt').style.display = 'block';
  }
});

async function checkAdminPermissions(user) {
  if (!user) {
    document.getElementById('auth0-login-prompt').style.display = 'block';
    return;
  }
  const role = (user.role || '').toLowerCase();
  const isSiteOwner = user.email === 'carsontkempf@gmail.com' || user.email === 'ctkfdp@umsystem.edu';
  const isAdmin = role === 'admin' || isSiteOwner;
  if (isAdmin) {
    document.getElementById('auth0-content-wrapper').style.display = 'block';
    await loadAllUsers();
    loadAllRoles();
  } else {
    document.getElementById('auth0-login-prompt').style.display = 'block';
  }
}

async function loadAllUsers() {
  const token = getUserToken();
  if (!token) {
    document.getElementById('users-list').innerHTML = '<p>Unable to get access token</p>';
    return;
  }
  try {
    const res = await fetch(LEARN_API + '/admin/list-users?limit=100', {
      headers: { Authorization: 'Bearer ' + token }
    });
    const data = await res.json();
    if (!res.ok) {
      document.getElementById('users-list').innerHTML = '<p>Error loading users (' + res.status + '): ' + (data.message || '') + '</p>';
      return;
    }
    userCache = data.users || [];
    displayUsers(userCache);
  } catch (err) {
    console.error('[AUTHZ] loadAllUsers error:', err);
    document.getElementById('users-list').innerHTML = '<p>Error loading users</p>';
  }
}

function displayUsers(users) {
  const usersList = document.getElementById('users-list');
  if (!users.length) { usersList.innerHTML = '<p>No users found</p>'; return; }
  usersList.innerHTML = users.map(function(user) {
    return '<div class="user-card"><h4>' + (user.name || 'No name') + '</h4>' +
      '<p><strong>Email:</strong> ' + user.email + '</p>' +
      '<p><strong>Role:</strong> <span class="role-badge">' + (user.role || 'user') + '</span></p>' +
      '<p><strong>Created:</strong> ' + new Date(user.createdAt).toLocaleDateString() + '</p></div>';
  }).join('');
}

function loadAllRoles() {
  const roles = [
    { name: 'admin', description: 'Full admin access' },
    { name: 'user', description: 'Standard user (default)' },
    { name: 'premium', description: 'Premium tier access' },
    { name: 'writer', description: 'Content writer access' }
  ];
  displayRoles(roles);
  populateRoleSelect(roles);
}

function displayRoles(roles) {
  const rolesList = document.getElementById('all-roles-list');
  rolesList.innerHTML = roles.map(function(role) {
    return '<div style="margin-bottom:15px;padding:10px;background:white;border-radius:6px;border-left:3px solid #3498db;">' +
      '<strong>' + role.name + '</strong><br><small>' + role.description + '</small></div>';
  }).join('');
}

function populateRoleSelect(roles) {
  const select = document.getElementById('role-selection');
  select.innerHTML = roles.map(function(role) {
    return '<option value="' + role.name + '">' + role.name + '</option>';
  }).join('');
}

async function assignRoleToUser() {
  const email = document.getElementById('user-email-role').value;
  const role = document.getElementById('role-selection').value;
  if (!email || !role) { alert('Enter email and select a role'); return; }
  const token = getUserToken();
  if (!token) { alert('Not authenticated'); return; }
  if (!userCache.length) await loadAllUsers();
  const user = userCache.find(function(u) { return u.email === email; });
  if (!user) { alert('User not found — refresh user list first'); return; }
  const res = await fetch(LEARN_API + '/admin/set-role', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user.id, role: role })
  });
  if (res.ok) {
    alert('Role "' + role + '" assigned to ' + email);
    document.getElementById('user-email-role').value = '';
    await loadAllUsers();
  } else {
    const e = await res.json().catch(function() { return {}; });
    alert('Error: ' + (e.message || res.status));
  }
}

async function removeRoleFromUser() {
  const email = document.getElementById('user-email-role').value;
  if (!email) { alert('Enter user email'); return; }
  const token = getUserToken();
  if (!token) { alert('Not authenticated'); return; }
  if (!userCache.length) await loadAllUsers();
  const user = userCache.find(function(u) { return u.email === email; });
  if (!user) { alert('User not found — refresh user list first'); return; }
  const res = await fetch(LEARN_API + '/admin/set-role', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user.id, role: 'user' })
  });
  if (res.ok) {
    alert('Role reset to "user" for ' + email);
    document.getElementById('user-email-role').value = '';
    await loadAllUsers();
  } else {
    const e = await res.json().catch(function() { return {}; });
    alert('Error: ' + (e.message || res.status));
  }
}

async function lookupUserRoles() {
  const email = document.getElementById('lookup-email').value;
  if (!email) { alert('Enter an email'); return; }
  if (!userCache.length) await loadAllUsers();
  const user = userCache.find(function(u) { return u.email === email; });
  document.getElementById('user-lookup-results').innerHTML = user
    ? '<h4>' + user.email + '</h4><p>Role: <strong>' + (user.role || 'user') + '</strong></p><p>ID: ' + user.id + '</p>'
    : '<p>User not found</p>';
}

</script>
