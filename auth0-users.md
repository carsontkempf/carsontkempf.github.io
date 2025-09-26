---
layout: page
title: Auth0 User Management
permalink: /auth0-users/
---

<div id="auth0-dashboard">
  <header class="section-header">
    <h1>{{ page.title }}</h1>
    <p class="section-description">Manage Auth0 user identities, including creating and provisioning users, resetting passwords, blocking access, and deleting accounts.</p>
  </header>

  <main class="section-main-content">
    <div id="auth0-content-wrapper" style="display: none;">
      
      <!-- User Management Section -->
      <section class="auth0-section">
        <h2>User Management</h2>
        <div class="auth0-actions">
          <button class="auth0-btn" onclick="createUser()">Create New User</button>
          <button class="auth0-btn" onclick="provisionUser()">Provision User</button>
          <button class="auth0-btn" onclick="resetPassword()">Reset Password</button>
          <button class="auth0-btn" onclick="blockUser()">Block User Access</button>
          <button class="auth0-btn" onclick="deleteUser()">Delete User Account</button>
        </div>
      </section>

      <!-- Role Management Section -->
      <section class="auth0-section">
        <h2>Role Management</h2>
        <div class="role-management-container">
          <div class="role-assignment-section">
            <h3>Assign Role to User</h3>
            <div class="form-group">
              <label for="user-email-role">User Email:</label>
              <input type="email" id="user-email-role" placeholder="Enter user email">
            </div>
            <div class="form-group">
              <label for="role-selection">Select Role:</label>
              <select id="role-selection">
                <option value="rol_XUUh9ZOhirY2yCQQ">Code-Comprehension-Project</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="form-actions">
              <button onclick="assignRoleToUser()" class="auth0-btn">Assign Role</button>
              <button onclick="removeRoleFromUser()" class="auth0-btn secondary">Remove Role</button>
            </div>
          </div>

          <div class="role-lookup-section">
            <h3>User Role Lookup</h3>
            <div class="form-group">
              <label for="lookup-email">User Email:</label>
              <input type="email" id="lookup-email" placeholder="Enter user email to lookup">
            </div>
            <div class="form-actions">
              <button onclick="lookupUserRoles()" class="auth0-btn">Lookup User Roles</button>
              <button onclick="getUserByEmail()" class="auth0-btn">Get User Details</button>
            </div>
            <div id="user-lookup-results" class="lookup-results"></div>
          </div>

          <div class="bulk-operations-section">
            <h3>Bulk Operations</h3>
            <div class="form-actions">
              <button onclick="listAllUsers()" class="auth0-btn">List All Users</button>
              <button onclick="listAllRoles()" class="auth0-btn">List All Roles</button>
              <button onclick="getUsersWithRole()" class="auth0-btn">Get Users with Code-Comprehension Role</button>
            </div>
            <div id="bulk-operation-results" class="lookup-results"></div>
          </div>
        </div>
      </section>

      <!-- User Metadata Section -->
      <section class="auth0-section">
        <h2>User Metadata</h2>
        <p>Store arbitrary JSON objects attached to Auth0 users.</p>
        <div class="auth0-actions">
          <button class="auth0-btn" onclick="manageMetadata()">Manage User Metadata</button>
          <button class="auth0-btn" onclick="viewUserData()">View User Data</button>
        </div>
      </section>

      <!-- Multi-Connection Management -->
      <section class="auth0-section">
        <h2>Connection Management</h2>
        <p>Associate user accounts with multiple connections (database, enterprise, social).</p>
        <div class="auth0-actions">
          <button class="auth0-btn" onclick="manageConnections()">Manage Connections</button>
          <button class="auth0-btn" onclick="linkAccounts()">Link User Accounts</button>
        </div>
      </section>

      <!-- Special Resources Section -->
      <section class="auth0-section special-resources">
        <h2>Special Resources</h2>
        <p>Manage access to protected resources and documents.</p>
        
        <div class="resource-card">
          <h3>Code Comprehension Project</h3>
          <p>Access to Code-Comprehension-Project.md document</p>
          <div class="resource-actions">
            <button class="auth0-btn resource-btn" onclick="manageCodeComprehensionAccess()">Manage Access</button>
            <button class="auth0-btn resource-btn" onclick="viewAuthorizedUsers()">View Authorized Users</button>
            <button class="auth0-btn resource-btn" onclick="addUserAccess()">Add User Access</button>
            <button class="auth0-btn resource-btn" onclick="revokeUserAccess()">Revoke Access</button>
            <a href="{{ '/code-comprehension-project/' | relative_url }}" class="auth0-btn resource-btn">View Document</a>
          </div>
          <div id="authorized-users-list" class="authorized-users" style="display: none;">
            <!-- Dynamic content will be loaded here -->
          </div>
          <div id="access-management-form" class="access-form" style="display: none;">
            <h4>Manage User Access</h4>
            <div class="form-group">
              <label for="user-email">User Email:</label>
              <input type="email" id="user-email" placeholder="Enter user email">
            </div>
            <div class="form-group">
              <label for="access-level">Access Level:</label>
              <select id="access-level">
                <option value="read">Read Only</option>
                <option value="admin">Full Access</option>
              </select>
            </div>
            <div class="form-actions">
              <button onclick="grantAccess()" class="auth0-btn">Grant Access</button>
              <button onclick="hideAccessForm()" class="auth0-btn secondary">Cancel</button>
            </div>
          </div>
        </div>
      </section>

      <!-- User List Section -->
      <section class="auth0-section">
        <h2>Current Users</h2>
        <div id="users-list" class="users-grid">
          <!-- Users will be dynamically loaded here -->
        </div>
      </section>

      <!-- Debug Section -->
      <section class="auth0-section">
        <h2>Debug Information</h2>
        <div id="debug-info" class="debug-section">
          <h3>Current User Debug Info</h3>
          <div id="user-debug-display"></div>
          <button class="auth0-btn" onclick="refreshDebugInfo()">Refresh Debug Info</button>
          <button class="auth0-btn" onclick="testRoleCheck()">Test Role Check</button>
          <button class="auth0-btn" onclick="verifySpecificUser()">Verify carsontkempf@gmail.com Role</button>
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

<script>
document.addEventListener('authReady', function() {
  if (window.authService.isAuthenticated) {
    // Check if user has admin permissions (you'll need to implement this based on your Auth0 setup)
    checkAdminPermissions();
  } else {
    document.getElementById('auth0-login-prompt').style.display = 'block';
  }
});

async function checkAdminPermissions() {
  const user = window.authService.user;
  
  // Check user roles in multiple possible locations
  const customRoles = user['https://carsontkempf.github.io/roles'] || [];
  const auth0Roles = user['https://auth0.com/roles'] || [];
  const appMetadataRoles = user.app_metadata?.roles || [];
  const userMetadataRoles = user.user_metadata?.roles || [];
  
  // Combine all possible role sources
  const allRoles = [...customRoles, ...auth0Roles, ...appMetadataRoles, ...userMetadataRoles];
  
  // Try to get more detailed role information if we have an access token
  await verifyUserRoles(user);
  
  const hasAdminRole = allRoles.includes('admin');
  const hasCodeComprehensionRole = allRoles.includes('Code-Comprehension-Project') || 
                                  allRoles.includes('rol_XUUh9ZOhirY2yCQQ');
  const isSiteOwner = user.email === 'ctkfdp@umsystem.edu';
  
  // Special case for the Google OAuth2 user we know should have access
  const isKnownGoogleUser = user.sub === 'google-oauth2|105937728118922887478' || 
                           user.email === 'carsontkempf@gmail.com';
  
  
  if (user && (hasAdminRole || hasCodeComprehensionRole || isSiteOwner || isKnownGoogleUser)) {
    document.getElementById('auth0-content-wrapper').style.display = 'block';
    loadUsers();
    loadAuthorizedUsers();
    refreshDebugInfo(); // Load debug info automatically
    
    // Show appropriate sections based on user permissions
    updateDashboardForUserRole(user);
  } else {
    document.getElementById('auth0-login-prompt').style.display = 'block';
    // Show debug info even for denied access to help troubleshoot
    if (user) {
      setTimeout(refreshDebugInfo, 100);
    }
  }
}

function updateDashboardForUserRole(user) {
  // Check user roles in multiple possible locations
  const customRoles = user['https://carsontkempf.github.io/roles'] || [];
  const auth0Roles = user['https://auth0.com/roles'] || [];
  const appMetadataRoles = user.app_metadata?.roles || [];
  const userMetadataRoles = user.user_metadata?.roles || [];
  
  // Combine all possible role sources
  const allRoles = [...customRoles, ...auth0Roles, ...appMetadataRoles, ...userMetadataRoles];
  
  const hasAdminRole = allRoles.includes('admin');
  const hasCodeComprehensionRole = allRoles.includes('Code-Comprehension-Project') || 
                                  allRoles.includes('rol_XUUh9ZOhirY2yCQQ');
  const isSiteOwner = user.email === 'ctkfdp@umsystem.edu';
  
  // If user only has Code-Comprehension-Project role (not admin), limit their access
  if (hasCodeComprehensionRole && !hasAdminRole && !isSiteOwner) {
    // Hide sections that Code-Comprehension-Project users shouldn't access
    const restrictedSections = document.querySelectorAll('.auth0-section:not(.special-resources)');
    restrictedSections.forEach(section => {
      section.style.display = 'none';
    });
    
    // Show a notice about limited access
    const header = document.querySelector('.section-header .section-description');
    if (header) {
      header.innerHTML = 'You have limited access to manage Code Comprehension Project resources only.';
    }
  }
}

// User Management Functions
function createUser() {
  alert('Create User functionality - integrate with Auth0 Management API');
  // Implement Auth0 Management API call to create user
}

function provisionUser() {
  alert('Provision User functionality - integrate with Auth0 Management API');
  // Implement user provisioning logic
}

function resetPassword() {
  const email = prompt('Enter user email to reset password:');
  if (email) {
    alert(`Password reset initiated for ${email}`);
    // Implement Auth0 password reset API call
  }
}

function blockUser() {
  const userId = prompt('Enter user ID to block:');
  if (userId) {
    alert(`User ${userId} has been blocked`);
    // Implement Auth0 user blocking API call
  }
}

function deleteUser() {
  const userId = prompt('Enter user ID to delete:');
  if (userId && confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
    alert(`User ${userId} has been deleted`);
    // Implement Auth0 user deletion API call
  }
}

function manageMetadata() {
  alert('Manage Metadata functionality - integrate with Auth0 Management API');
  // Implement metadata management interface
}

function viewUserData() {
  alert('View User Data functionality');
  // Implement user data viewing interface
}

function manageConnections() {
  alert('Manage Connections functionality');
  // Implement connection management interface
}

function linkAccounts() {
  alert('Link Accounts functionality');
  // Implement account linking interface
}

// Special Resource Functions for Code Comprehension Project
function manageCodeComprehensionAccess() {
  const form = document.getElementById('access-management-form');
  const list = document.getElementById('authorized-users-list');
  
  // Toggle form visibility
  if (form.style.display === 'none' || !form.style.display) {
    form.style.display = 'block';
    list.style.display = 'none';
  } else {
    form.style.display = 'none';
  }
}

function viewAuthorizedUsers() {
  const list = document.getElementById('authorized-users-list');
  const form = document.getElementById('access-management-form');
  
  // Hide form and show/toggle list
  form.style.display = 'none';
  
  if (list.style.display === 'none' || !list.style.display) {
    loadAuthorizedUsers();
    list.style.display = 'block';
  } else {
    list.style.display = 'none';
  }
}

function addUserAccess() {
  // Show the access management form
  manageCodeComprehensionAccess();
}

function revokeUserAccess() {
  const email = prompt('Enter email of user to revoke Code Comprehension Project access:');
  if (email) {
    if (confirm(`Are you sure you want to revoke access for ${email}?`)) {
      // Remove user from authorized list (implement with your backend/Auth0 Management API)
      alert(`Access revoked for ${email} from Code-Comprehension-Project.md`);
      loadAuthorizedUsers(); // Refresh the list
    }
  }
}

function grantAccess() {
  const email = document.getElementById('user-email').value;
  const accessLevel = document.getElementById('access-level').value;
  
  if (!email) {
    alert('Please enter a user email');
    return;
  }
  
  if (!email.includes('@')) {
    alert('Please enter a valid email address');
    return;
  }
  
  // Here you would implement the actual Auth0 Management API call to add the role/permission
  // For now, we'll simulate it
  alert(`Access granted to ${email} with ${accessLevel} level for Code-Comprehension-Project.md`);
  
  // Clear form and hide it
  document.getElementById('user-email').value = '';
  document.getElementById('access-level').value = 'read';
  hideAccessForm();
  
  // Refresh the authorized users list
  loadAuthorizedUsers();
}

function hideAccessForm() {
  document.getElementById('access-management-form').style.display = 'none';
}

function loadUsers() {
  // Placeholder for loading users from Auth0 Management API
  const usersList = document.getElementById('users-list');
  usersList.innerHTML = `
    <div class="user-card">
      <h4>Sample User 1</h4>
      <p>email@example.com</p>
      <p>Status: Active</p>
      <div class="user-actions">
        <button onclick="editUser('user1')">Edit</button>
        <button onclick="blockUser()">Block</button>
      </div>
    </div>
    <div class="user-card">
      <h4>Sample User 2</h4>
      <p>user2@example.com</p>
      <p>Status: Active</p>
      <div class="user-actions">
        <button onclick="editUser('user2')">Edit</button>
        <button onclick="blockUser()">Block</button>
      </div>
    </div>
  `;
}

function loadAuthorizedUsers() {
  // Placeholder for loading authorized users for Code Comprehension Project
  const authorizedList = document.getElementById('authorized-users-list');
  authorizedList.innerHTML = `
    <h4>Authorized Users for Code-Comprehension-Project.md:</h4>
    <div class="authorized-users-table">
      <div class="user-row header">
        <span class="user-email">Email</span>
        <span class="user-access">Access Level</span>
        <span class="user-added">Date Added</span>
        <span class="user-actions">Actions</span>
      </div>
      <div class="user-row">
        <span class="user-email">ctkfdp@umsystem.edu</span>
        <span class="user-access">Admin</span>
        <span class="user-added">2024-01-01</span>
        <span class="user-actions">
          <button onclick="editUserAccess('ctkfdp@umsystem.edu')" class="small-btn">Edit</button>
        </span>
      </div>
      <div class="user-row">
        <span class="user-email">researcher@example.com</span>
        <span class="user-access">Read Only</span>
        <span class="user-added">2024-01-15</span>
        <span class="user-actions">
          <button onclick="editUserAccess('researcher@example.com')" class="small-btn">Edit</button>
          <button onclick="removeUserAccess('researcher@example.com')" class="small-btn danger">Remove</button>
        </span>
      </div>
    </div>
    <div class="authorized-stats">
      <p><strong>Total Authorized Users:</strong> 2</p>
      <p><strong>Admin Users:</strong> 1</p>
      <p><strong>Read-Only Users:</strong> 1</p>
    </div>
  `;
}

// Auth0 Management API Helper Functions
async function getManagementToken() {
  try {
    // Get access token from the Auth0 client with comprehensive scopes
    const token = await window.authService.client.getTokenSilently({
      audience: 'https://dev-l57dcpkhob0u7ykb.us.auth0.com/api/v2/',
      scope: 'read:roles read:users read:role_members create:role_members delete:role_members update:users read:users_app_metadata update:users_app_metadata'
    });
    return token;
  } catch (error) {
    console.error('Error getting management token:', error);
    return null;
  }
}

async function verifyUserRoles(user) {
  try {
    const token = await getManagementToken();
    if (!token) {
      return;
    }

    // Get user details including roles from Management API
    const userResponse = await fetch(`https://dev-l57dcpkhob0u7ykb.us.auth0.com/api/v2/users/${user.sub}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (userResponse.ok) {
      const userData = await userResponse.json();

      // Get user's roles
      const rolesResponse = await fetch(`https://dev-l57dcpkhob0u7ykb.us.auth0.com/api/v2/users/${user.sub}/roles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (rolesResponse.ok) {
        const roles = await rolesResponse.json();

        // Check each role and get its details
        for (const role of roles) {
          await getRoleDetails(token, role.id);
        }
      }
    }
  } catch (error) {
    console.error('Error verifying user roles:', error);
  }
}

async function getRoleDetails(token, roleId) {
  try {
    // Get role details
    const roleResponse = await fetch(`https://dev-l57dcpkhob0u7ykb.us.auth0.com/api/v2/roles/${roleId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (roleResponse.ok) {
      const roleData = await roleResponse.json();

      // Get role permissions
      const permissionsResponse = await fetch(`https://dev-l57dcpkhob0u7ykb.us.auth0.com/api/v2/roles/${roleId}/permissions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (permissionsResponse.ok) {
        const permissions = await permissionsResponse.json();
      }
    }
  } catch (error) {
    console.error(`Error getting role details for ${roleId}:`, error);
  }
}

function editUser(userId) {
  alert(`Edit user ${userId} functionality`);
  // Implement user editing interface
}

function editUserAccess(email) {
  const newAccessLevel = prompt(`Change access level for ${email}:`, 'read');
  if (newAccessLevel && (newAccessLevel === 'read' || newAccessLevel === 'admin')) {
    alert(`Access level for ${email} changed to ${newAccessLevel}`);
    loadAuthorizedUsers(); // Refresh the list
  } else if (newAccessLevel !== null) {
    alert('Invalid access level. Please use "read" or "admin".');
  }
}

function removeUserAccess(email) {
  if (confirm(`Are you sure you want to remove access for ${email}?`)) {
    alert(`Access removed for ${email}`);
    loadAuthorizedUsers(); // Refresh the list
  }
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
    const token = await getManagementToken();
    if (!token) {
      alert('Unable to get management token');
      return;
    }

    // First, get user by email
    const userResponse = await fetch(`https://dev-l57dcpkhob0u7ykb.us.auth0.com/api/v2/users-by-email?email=${encodeURIComponent(email)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!userResponse.ok) {
      alert('User not found');
      return;
    }

    const users = await userResponse.json();
    if (users.length === 0) {
      alert('User not found');
      return;
    }

    const userId = users[0].user_id;

    // Assign role to user
    const assignResponse = await fetch(`https://dev-l57dcpkhob0u7ykb.us.auth0.com/api/v2/users/${userId}/roles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        roles: [roleId]
      })
    });

    if (assignResponse.ok) {
      alert(`Role successfully assigned to ${email}`);
      // Clear form
      document.getElementById('user-email-role').value = '';
    } else {
      const error = await assignResponse.text();
      alert(`Error assigning role: ${error}`);
    }

  } catch (error) {
    console.error('Error assigning role:', error);
    alert('Error assigning role');
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
    const token = await getManagementToken();
    if (!token) {
      alert('Unable to get management token');
      return;
    }

    // First, get user by email
    const userResponse = await fetch(`https://dev-l57dcpkhob0u7ykb.us.auth0.com/api/v2/users-by-email?email=${encodeURIComponent(email)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!userResponse.ok) {
      alert('User not found');
      return;
    }

    const users = await userResponse.json();
    if (users.length === 0) {
      alert('User not found');
      return;
    }

    const userId = users[0].user_id;

    // Remove role from user
    const removeResponse = await fetch(`https://dev-l57dcpkhob0u7ykb.us.auth0.com/api/v2/users/${userId}/roles`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        roles: [roleId]
      })
    });

    if (removeResponse.ok) {
      alert(`Role successfully removed from ${email}`);
      // Clear form
      document.getElementById('user-email-role').value = '';
    } else {
      const error = await removeResponse.text();
      alert(`Error removing role: ${error}`);
    }

  } catch (error) {
    console.error('Error removing role:', error);
    alert('Error removing role');
  }
}

async function lookupUserRoles() {
  const email = document.getElementById('lookup-email').value;
  if (!email) {
    alert('Please enter an email');
    return;
  }

  try {
    const token = await getManagementToken();
    if (!token) {
      alert('Unable to get management token');
      return;
    }

    // Get user by email
    const userResponse = await fetch(`https://dev-l57dcpkhob0u7ykb.us.auth0.com/api/v2/users-by-email?email=${encodeURIComponent(email)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!userResponse.ok) {
      document.getElementById('user-lookup-results').innerHTML = '<p>User not found</p>';
      return;
    }

    const users = await userResponse.json();
    if (users.length === 0) {
      document.getElementById('user-lookup-results').innerHTML = '<p>User not found</p>';
      return;
    }

    const user = users[0];

    // Get user's roles
    const rolesResponse = await fetch(`https://dev-l57dcpkhob0u7ykb.us.auth0.com/api/v2/users/${user.user_id}/roles`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (rolesResponse.ok) {
      const roles = await rolesResponse.json();
      
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
    }

  } catch (error) {
    console.error('Error looking up user roles:', error);
    document.getElementById('user-lookup-results').innerHTML = '<p>Error looking up user</p>';
  }
}

async function getUserByEmail() {
  const email = document.getElementById('lookup-email').value;
  if (!email) {
    alert('Please enter an email');
    return;
  }

  try {
    const token = await getManagementToken();
    if (!token) {
      alert('Unable to get management token');
      return;
    }

    const response = await fetch(`https://dev-l57dcpkhob0u7ykb.us.auth0.com/api/v2/users-by-email?email=${encodeURIComponent(email)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const users = await response.json();
      document.getElementById('user-lookup-results').innerHTML = `
        <h4>User Details:</h4>
        <pre>${JSON.stringify(users, null, 2)}</pre>
      `;
    } else {
      document.getElementById('user-lookup-results').innerHTML = '<p>User not found</p>';
    }

  } catch (error) {
    console.error('Error getting user:', error);
    document.getElementById('user-lookup-results').innerHTML = '<p>Error getting user</p>';
  }
}

async function listAllUsers() {
  try {
    const token = await getManagementToken();
    if (!token) {
      alert('Unable to get management token');
      return;
    }

    const response = await fetch('https://dev-l57dcpkhob0u7ykb.us.auth0.com/api/v2/users?per_page=50', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const users = await response.json();
      document.getElementById('bulk-operation-results').innerHTML = `
        <h4>All Users (${users.length}):</h4>
        <div class="users-table">
          ${users.map(user => `
            <div class="user-item">
              <strong>${user.email}</strong> - ${user.name} (${user.user_id})
            </div>
          `).join('')}
        </div>
      `;
    }

  } catch (error) {
    console.error('Error listing users:', error);
    document.getElementById('bulk-operation-results').innerHTML = '<p>Error listing users</p>';
  }
}

async function listAllRoles() {
  try {
    const token = await getManagementToken();
    if (!token) {
      alert('Unable to get management token');
      return;
    }

    const response = await fetch('https://dev-l57dcpkhob0u7ykb.us.auth0.com/api/v2/roles', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const roles = await response.json();
      document.getElementById('bulk-operation-results').innerHTML = `
        <h4>All Roles:</h4>
        <div class="roles-table">
          ${roles.map(role => `
            <div class="role-item">
              <strong>${role.name}</strong> (ID: ${role.id})
              <br><small>${role.description || 'No description'}</small>
            </div>
          `).join('')}
        </div>
      `;
    }

  } catch (error) {
    console.error('Error listing roles:', error);
    document.getElementById('bulk-operation-results').innerHTML = '<p>Error listing roles</p>';
  }
}

async function getUsersWithRole() {
  try {
    const token = await getManagementToken();
    if (!token) {
      alert('Unable to get management token');
      return;
    }

    const response = await fetch('https://dev-l57dcpkhob0u7ykb.us.auth0.com/api/v2/roles/rol_XUUh9ZOhirY2yCQQ/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const users = await response.json();
      document.getElementById('bulk-operation-results').innerHTML = `
        <h4>Users with Code-Comprehension-Project Role:</h4>
        <div class="users-table">
          ${users.length > 0 ? 
            users.map(user => `
              <div class="user-item">
                <strong>${user.email}</strong> - ${user.name} (${user.user_id})
              </div>
            `).join('') :
            '<p>No users found with this role</p>'
          }
        </div>
      `;
    }

  } catch (error) {
    console.error('Error getting users with role:', error);
    document.getElementById('bulk-operation-results').innerHTML = '<p>Error getting users with role</p>';
  }
}

// Debug Functions
function refreshDebugInfo() {
  const user = window.authService.user;
  const debugDisplay = document.getElementById('user-debug-display');
  
  if (!user) {
    debugDisplay.innerHTML = '<p>No user logged in</p>';
    return;
  }

  // Check user roles in multiple possible locations
  const customRoles = user['https://carsontkempf.github.io/roles'] || [];
  const auth0Roles = user['https://auth0.com/roles'] || [];
  const appMetadataRoles = user.app_metadata?.roles || [];
  const userMetadataRoles = user.user_metadata?.roles || [];
  
  // Combine all possible role sources
  const allRoles = [...customRoles, ...auth0Roles, ...appMetadataRoles, ...userMetadataRoles];

  debugDisplay.innerHTML = `
    <div class="debug-info-block">
      <h4>User Information</h4>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Name:</strong> ${user.name}</p>
      <p><strong>Sub:</strong> ${user.sub}</p>
      <p><strong>Auth Provider:</strong> ${user.sub.split('|')[0]}</p>
    </div>
    
    <div class="debug-info-block">
      <h4>Role Sources</h4>
      <p><strong>Custom Namespace Roles:</strong> ${JSON.stringify(customRoles)}</p>
      <p><strong>Auth0 Namespace Roles:</strong> ${JSON.stringify(auth0Roles)}</p>
      <p><strong>App Metadata Roles:</strong> ${JSON.stringify(appMetadataRoles)}</p>
      <p><strong>User Metadata Roles:</strong> ${JSON.stringify(userMetadataRoles)}</p>
      <p><strong>All Combined Roles:</strong> ${JSON.stringify(allRoles)}</p>
    </div>
    
    <div class="debug-info-block">
      <h4>Role Checks</h4>
      <p><strong>Has Admin Role:</strong> ${allRoles.includes('admin')}</p>
      <p><strong>Has Code-Comprehension-Project Role (name):</strong> ${allRoles.includes('Code-Comprehension-Project')}</p>
      <p><strong>Has Code-Comprehension-Project Role (ID):</strong> ${allRoles.includes('rol_XUUh9ZOhirY2yCQQ')}</p>
      <p><strong>Is Site Owner:</strong> ${user.email === 'ctkfdp@umsystem.edu'}</p>
    </div>
    
    <div class="debug-info-block">
      <h4>Full User Object</h4>
      <pre>${JSON.stringify(user, null, 2)}</pre>
    </div>
  `;
}

function testRoleCheck() {
  const user = window.authService.user;
  
  // Check user roles in multiple possible locations
  const customRoles = user['https://carsontkempf.github.io/roles'] || [];
  const auth0Roles = user['https://auth0.com/roles'] || [];
  const appMetadataRoles = user.app_metadata?.roles || [];
  const userMetadataRoles = user.user_metadata?.roles || [];
  
  // Combine all possible role sources
  const allRoles = [...customRoles, ...auth0Roles, ...appMetadataRoles, ...userMetadataRoles];
  
  const hasAdminRole = allRoles.includes('admin');
  const hasCodeComprehensionRole = allRoles.includes('Code-Comprehension-Project') || 
                                  allRoles.includes('rol_XUUh9ZOhirY2yCQQ');
  const isSiteOwner = user.email === 'ctkfdp@umsystem.edu';
  
  const shouldHaveAccess = hasAdminRole || hasCodeComprehensionRole || isSiteOwner;
  
  alert(`Role Check Results:
  
Admin Role: ${hasAdminRole}
Code Comprehension Role: ${hasCodeComprehensionRole}
Site Owner: ${isSiteOwner}
Should Have Access: ${shouldHaveAccess}

All Roles Found: ${JSON.stringify(allRoles)}
  `);
}

async function verifySpecificUser() {
  // Automatically look up the specific Google user
  document.getElementById('lookup-email').value = 'carsontkempf@gmail.com';
  await lookupUserRoles();
  
  // Also try to assign the role if it's missing
  const user = window.authService.user;
  if (user && (user.email === 'carsontkempf@gmail.com' || user.sub === 'google-oauth2|105937728118922887478')) {
    const confirmAssign = confirm('Would you like to try assigning the Code-Comprehension-Project role to this user?');
    if (confirmAssign) {
      document.getElementById('user-email-role').value = 'carsontkempf@gmail.com';
      document.getElementById('role-selection').value = 'rol_XUUh9ZOhirY2yCQQ';
      await assignRoleToUser();
    }
  }
}
</script>