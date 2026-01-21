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
      <p>Manage Auth0 user identities and roles</p>
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
      <button onclick="authService.login()" class="login-btn">Log In</button>
    </div>
  </main>
  </div>
</div>

<script>
// Netlify Functions API Base URL
const NETLIFY_API_BASE = 'https://carsontkempf.netlify.app/.netlify/functions';

document.addEventListener('authReady', async function() {
  console.log('[AUTH0-USERS] authReady event fired');
  console.log('[AUTH0-USERS] Netlify API Base URL:', NETLIFY_API_BASE);

  // Defensive check: ensure authService is fully initialized
  if (!window.authService || !window.authService.client) {
    console.error('[AUTH0-USERS] authReady fired but authService not fully initialized');
    document.getElementById('auth0-login-prompt').style.display = 'block';
    return;
  }

  // Re-verify authentication state instead of trusting cached value
  try {
    const isAuthenticated = await window.authService.client.isAuthenticated();
    window.authService.isAuthenticated = isAuthenticated;

    console.log('[AUTH0-USERS] Authentication verified:', isAuthenticated);

    if (isAuthenticated) {
      // Ensure user object exists before proceeding
      if (!window.authService.user) {
        window.authService.user = await window.authService.client.getUser();
      }
      console.log('[AUTH0-USERS] User object:', window.authService.user);
      await checkAdminPermissions();
    } else {
      console.log('[AUTH0-USERS] User not authenticated, showing login prompt');
      document.getElementById('auth0-login-prompt').style.display = 'block';
    }
  } catch (error) {
    console.error('[AUTH0-USERS] Error checking authentication:', error);
    document.getElementById('auth0-login-prompt').style.display = 'block';
  }
});

async function checkAdminPermissions() {
  console.log('[AUTH0-USERS] Checking admin permissions...');
  const user = window.authService.user;

  if (!user) {
    console.error('[AUTH0-USERS] No user object available');
    document.getElementById('auth0-login-prompt').style.display = 'block';
    return;
  }

  const customRoles = user['https://carsontkempf.github.io/roles'] || [];
  const auth0Roles = user['https://auth0.com/roles'] || [];
  const appMetadataRoles = user.app_metadata?.roles || [];
  const userMetadataRoles = user.user_metadata?.roles || [];

  const allRoles = [...customRoles, ...auth0Roles, ...appMetadataRoles, ...userMetadataRoles];

  console.log('[AUTH0-USERS] All roles found:', allRoles);

  // Check for admin role (case-insensitive)
  const hasAdminRole = allRoles.some(role => role.toLowerCase() === 'admin');
  const hasRootRole = allRoles.some(role => role.toLowerCase() === 'root');
  const isSiteOwner = user.email === 'ctkfdp@umsystem.edu';

  console.log('[AUTH0-USERS] Has admin role:', hasAdminRole);
  console.log('[AUTH0-USERS] Has root role:', hasRootRole);
  console.log('[AUTH0-USERS] Is site owner:', isSiteOwner);

  if (hasAdminRole || hasRootRole || isSiteOwner) {
    console.log('[AUTH0-USERS] Access granted, loading content...');
    document.getElementById('auth0-content-wrapper').style.display = 'block';
    await loadAllUsers();
    await loadAllRoles();
  } else {
    console.log('[AUTH0-USERS] Access denied');
    document.getElementById('auth0-login-prompt').style.display = 'block';
  }
}

// Helper to get user access token for API calls
async function getUserToken() {
  try {
    const token = await window.authService.client.getTokenSilently();
    return token;
  } catch (error) {
    console.error('Error getting user token:', error);
    return null;
  }
}

// Load all users from Auth0 via Netlify Function
async function loadAllUsers() {
  try {
    console.log('[AUTH0-USERS] loadAllUsers: Getting user token...');
    const token = await getUserToken();
    if (!token) {
      console.error('[AUTH0-USERS] loadAllUsers: Failed to get user token');
      document.getElementById('users-list').innerHTML = '<p>Unable to get access token</p>';
      return;
    }
    console.log('[AUTH0-USERS] loadAllUsers: Token obtained, length:', token.length);

    const functionUrl = `${NETLIFY_API_BASE}/auth0-get-users`;
    console.log('[AUTH0-USERS] loadAllUsers: Calling function:', functionUrl);

    const response = await fetch(functionUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    console.log('[AUTH0-USERS] loadAllUsers: Response status:', response.status);
    console.log('[AUTH0-USERS] loadAllUsers: Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const users = await response.json();
      console.log('[AUTH0-USERS] loadAllUsers: Successfully loaded', users.length, 'users');
      displayUsers(users);
    } else {
      const contentType = response.headers.get('content-type');
      let error;
      if (contentType && contentType.includes('application/json')) {
        error = await response.json();
      } else {
        const text = await response.text();
        console.error('[AUTH0-USERS] loadAllUsers: Non-JSON response (first 500 chars):', text.substring(0, 500));
        error = { message: 'Non-JSON response received', status: response.status };
      }
      console.error('[AUTH0-USERS] loadAllUsers: Error loading users:', error);
      document.getElementById('users-list').innerHTML = `<p>Error loading users (Status: ${response.status})</p>`;
    }
  } catch (error) {
    console.error('[AUTH0-USERS] loadAllUsers: Exception:', error);
    document.getElementById('users-list').innerHTML = '<p>Error loading users - check console</p>';
  }
}

// Display users in the grid
function displayUsers(users) {
  const usersList = document.getElementById('users-list');

  if (users.length === 0) {
    usersList.innerHTML = '<p>No users found</p>';
    return;
  }

  const userCards = users.map((user) => {
    const roles = user.roles || [];
    const rolesHtml = roles.length > 0
      ? `<div class="user-roles">${roles.map(role => `<span class="role-badge">${role.name}</span>`).join('')}</div>`
      : '<p>No roles assigned</p>';

    return `
      <div class="user-card">
        <h4>${user.name || 'No name'}</h4>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Provider:</strong> ${user.identities[0]?.connection || 'Unknown'}</p>
        <p><strong>Created:</strong> ${new Date(user.created_at).toLocaleDateString()}</p>
        ${rolesHtml}
      </div>
    `;
  });

  usersList.innerHTML = userCards.join('');
}

// Load all roles from Auth0 via Netlify Function
async function loadAllRoles() {
  try {
    console.log('[AUTH0-USERS] loadAllRoles: Getting user token...');
    const token = await getUserToken();
    if (!token) {
      console.error('[AUTH0-USERS] loadAllRoles: Failed to get user token');
      document.getElementById('all-roles-list').innerHTML = '<p>Unable to get access token</p>';
      return;
    }

    const functionUrl = `${NETLIFY_API_BASE}/auth0-get-roles`;
    console.log('[AUTH0-USERS] loadAllRoles: Calling function:', functionUrl);

    const response = await fetch(functionUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    console.log('[AUTH0-USERS] loadAllRoles: Response status:', response.status);

    if (response.ok) {
      const roles = await response.json();
      console.log('[AUTH0-USERS] loadAllRoles: Successfully loaded', roles.length, 'roles');
      displayRoles(roles);
      populateRoleSelect(roles);
    } else {
      const contentType = response.headers.get('content-type');
      let error;
      if (contentType && contentType.includes('application/json')) {
        error = await response.json();
      } else {
        const text = await response.text();
        console.error('[AUTH0-USERS] loadAllRoles: Non-JSON response (first 500 chars):', text.substring(0, 500));
        error = { message: 'Non-JSON response received', status: response.status };
      }
      console.error('[AUTH0-USERS] loadAllRoles: Error loading roles:', error);
      document.getElementById('all-roles-list').innerHTML = `<p>Error loading roles (Status: ${response.status})</p>`;
    }
  } catch (error) {
    console.error('[AUTH0-USERS] loadAllRoles: Exception:', error);
    document.getElementById('all-roles-list').innerHTML = '<p>Error loading roles - check console</p>';
  }
}

// Display roles
function displayRoles(roles) {
  const rolesList = document.getElementById('all-roles-list');

  if (roles.length === 0) {
    rolesList.innerHTML = '<p>No roles found</p>';
    return;
  }

  const rolesHtml = roles.map(role => `
    <div style="margin-bottom: 15px; padding: 10px; background: white; border-radius: 6px; border-left: 3px solid #3498db;">
      <strong>${role.name}</strong> (ID: ${role.id})<br>
      <small>${role.description || 'No description'}</small>
    </div>
  `).join('');

  rolesList.innerHTML = rolesHtml;
}

// Populate role selection dropdown
function populateRoleSelect(roles) {
  const select = document.getElementById('role-selection');
  select.innerHTML = roles.map(role =>
    `<option value="${role.id}">${role.name}</option>`
  ).join('');
}

// Role Management Functions
async function assignRoleToUser() {
  const email = document.getElementById('user-email-role').value;
  const roleId = document.getElementById('role-selection').value;

  if (!email || !roleId) {
    alert('Please enter both email and select a role');
    return;
  }

  try {
    console.log('[AUTH0-USERS] assignRoleToUser: Assigning role', roleId, 'to', email);
    const token = await getUserToken();
    if (!token) {
      console.error('[AUTH0-USERS] assignRoleToUser: Failed to get user token');
      alert('Unable to get access token');
      return;
    }

    const functionUrl = `${NETLIFY_API_BASE}/auth0-assign-role`;
    console.log('[AUTH0-USERS] assignRoleToUser: Calling function:', functionUrl);

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, roleId })
    });

    console.log('[AUTH0-USERS] assignRoleToUser: Response status:', response.status);

    const contentType = response.headers.get('content-type');
    let result;
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      const text = await response.text();
      console.error('[AUTH0-USERS] assignRoleToUser: Non-JSON response:', text.substring(0, 500));
      result = { error: 'Non-JSON response received' };
    }

    if (response.ok) {
      console.log('[AUTH0-USERS] assignRoleToUser: Success');
      alert(result.message || `Role successfully assigned to ${email}`);
      document.getElementById('user-email-role').value = '';
      await loadAllUsers();
    } else {
      console.error('[AUTH0-USERS] assignRoleToUser: Error:', result);
      alert(`Error: ${result.error || 'Failed to assign role'}`);
    }

  } catch (error) {
    console.error('[AUTH0-USERS] assignRoleToUser: Exception:', error);
    alert('Error assigning role - check console');
  }
}

async function removeRoleFromUser() {
  const email = document.getElementById('user-email-role').value;
  const roleId = document.getElementById('role-selection').value;

  if (!email || !roleId) {
    alert('Please enter both email and select a role');
    return;
  }

  try {
    console.log('[AUTH0-USERS] removeRoleFromUser: Removing role', roleId, 'from', email);
    const token = await getUserToken();
    if (!token) {
      console.error('[AUTH0-USERS] removeRoleFromUser: Failed to get user token');
      alert('Unable to get access token');
      return;
    }

    const functionUrl = `${NETLIFY_API_BASE}/auth0-remove-role`;
    console.log('[AUTH0-USERS] removeRoleFromUser: Calling function:', functionUrl);

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, roleId })
    });

    console.log('[AUTH0-USERS] removeRoleFromUser: Response status:', response.status);

    const contentType = response.headers.get('content-type');
    let result;
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      const text = await response.text();
      console.error('[AUTH0-USERS] removeRoleFromUser: Non-JSON response:', text.substring(0, 500));
      result = { error: 'Non-JSON response received' };
    }

    if (response.ok) {
      console.log('[AUTH0-USERS] removeRoleFromUser: Success');
      alert(result.message || `Role successfully removed from ${email}`);
      document.getElementById('user-email-role').value = '';
      await loadAllUsers();
    } else {
      console.error('[AUTH0-USERS] removeRoleFromUser: Error:', result);
      alert(`Error: ${result.error || 'Failed to remove role'}`);
    }

  } catch (error) {
    console.error('[AUTH0-USERS] removeRoleFromUser: Exception:', error);
    alert('Error removing role - check console');
  }
}

async function lookupUserRoles() {
  const email = document.getElementById('lookup-email').value;
  if (!email) {
    alert('Please enter an email');
    return;
  }

  try {
    console.log('[AUTH0-USERS] lookupUserRoles: Looking up user:', email);
    const token = await getUserToken();
    if (!token) {
      console.error('[AUTH0-USERS] lookupUserRoles: Failed to get user token');
      alert('Unable to get access token');
      return;
    }

    const functionUrl = `${NETLIFY_API_BASE}/auth0-get-users`;
    console.log('[AUTH0-USERS] lookupUserRoles: Calling function:', functionUrl);

    const response = await fetch(functionUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    console.log('[AUTH0-USERS] lookupUserRoles: Response status:', response.status);

    if (!response.ok) {
      console.error('[AUTH0-USERS] lookupUserRoles: Failed to fetch users');
      document.getElementById('user-lookup-results').innerHTML = '<p>Error fetching users</p>';
      return;
    }

    const users = await response.json();
    console.log('[AUTH0-USERS] lookupUserRoles: Searching for user in', users.length, 'users');
    const user = users.find(u => u.email === email);

    if (!user) {
      console.log('[AUTH0-USERS] lookupUserRoles: User not found');
      document.getElementById('user-lookup-results').innerHTML = '<p>User not found</p>';
      return;
    }

    console.log('[AUTH0-USERS] lookupUserRoles: Found user with', (user.roles || []).length, 'roles');
    const roles = user.roles || [];

    document.getElementById('user-lookup-results').innerHTML = `
      <h4>User: ${user.email}</h4>
      <p><strong>User ID:</strong> ${user.user_id}</p>
      <p><strong>Name:</strong> ${user.name}</p>
      <p><strong>Connection:</strong> ${user.identities[0]?.connection || 'Unknown'}</p>
      <h5>Assigned Roles:</h5>
      ${roles.length > 0 ?
        `<ul>${roles.map(role => `<li>${role.name} (ID: ${role.id})</li>`).join('')}</ul>` :
        '<p>No roles assigned</p>'
      }
    `;

  } catch (error) {
    console.error('[AUTH0-USERS] lookupUserRoles: Exception:', error);
    document.getElementById('user-lookup-results').innerHTML = '<p>Error looking up user</p>';
  }
}

</script>