---
layout: page
title: Tree Visualizer
permalink: /code-comprehension/tree-visualizer/
---

<div id="auth-check-wrapper" style="display: none;">
  <div style="text-align: center; padding: 50px;">
    <h2>Access Denied</h2>
    <p>You need the "code-comprehension" role to view this page.</p>
    <button onclick="authService.login()" class="login-btn">Log In</button>
    <br><br>
    <a href="/dashboard/">← Back to Dashboard</a>
  </div>
</div>

<div id="project-content-wrapper" style="display: none;">

<!-- Include Treant.js dependencies -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/raphael/2.3.0/raphael.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/treant-js@1.0.0/Treant.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/treant-js@1.0.0/Treant.css">

<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

#tree-visualizer-container {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    min-height: 100vh;
    padding: 20px 0;
    background: #f8f9fa;
}

.visualizer-header {
    text-align: center;
    margin-bottom: 30px;
    flex-shrink: 0;
}

.visualizer-header h1 {
    font-size: 2.5rem;
    font-weight: 300;
    margin-bottom: 10px;
    color: #2c3e50;
}

.visualizer-header p {
    font-size: 1.1rem;
    opacity: 0.8;
    margin-bottom: 20px;
    color: #7f8c8d;
}


/* Standardized back button styles */
.back-button-container {
    text-align: center;
    margin: 20px 0 30px 0;
}

.standard-back-btn {
    display: inline-block;
    padding: 12px 24px;
    background: #3498db;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
}

.standard-back-btn:hover {
    background: #2980b9;
    transform: translateY(-1px);
    text-decoration: none;
    color: white;
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
}

/* Toolbar */
.tree-toolbar {
    background: white;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    align-items: center;
    justify-content: space-between;
}

.toolbar-section {
    display: flex;
    gap: 10px;
    align-items: center;
}

.toolbar-btn {
    background: #e74c3c;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.toolbar-btn:hover {
    background: #c0392b;
    transform: translateY(-1px);
}

.toolbar-btn.secondary {
    background: #3498db;
}

.toolbar-btn.secondary:hover {
    background: #2980b9;
}

.toolbar-btn.success {
    background: #27ae60;
}

.toolbar-btn.success:hover {
    background: #219a52;
}

/* Tree info */
.tree-info-section {
    display: flex;
    gap: 20px;
    align-items: center;
    font-size: 14px;
    color: #2c3e50;
}

.tree-stat {
    display: flex;
    gap: 5px;
    align-items: center;
}

.stat-label {
    font-weight: 600;
}

.stat-value {
    background: #e8f4fd;
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: 600;
    color: #2980b9;
}

/* Tree container */
.tree-main-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    overflow: hidden;
    min-height: 600px;
}

.tree-container-header {
    background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
    color: white;
    padding: 15px 20px;
    text-align: center;
}

.tree-container-title {
    font-size: 1.4rem;
    font-weight: 600;
    margin: 0;
}

#tree-container {
    padding: 20px;
    min-height: 500px;
    background: #f8f9fa;
    overflow: auto;
}

/* Tree node styles */
.tree-node {
    background: white;
    border: 2px solid #e74c3c;
    border-radius: 8px;
    padding: 10px 15px;
    font-size: 14px;
    font-weight: 500;
    color: #2c3e50;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
    cursor: pointer;
}

.tree-node:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(231,76,60,0.3);
}

.root-node {
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    color: white;
    border-color: #c0392b;
}

.child-node {
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
    color: white;
    border-color: #2980b9;
}

.leaf-node {
    background: linear-gradient(135deg, #27ae60 0%, #219a52 100%);
    color: white;
    border-color: #219a52;
}

/* Message display */
.message {
    padding: 12px 20px;
    border-radius: 6px;
    margin-bottom: 20px;
    font-weight: 500;
    display: none;
}

.message.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.message.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.message.info {
    background: #d1ecf1;
    color: #0c5460;
    border: 1px solid #bee5eb;
}

/* Modal styles */
.modal {
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    backdrop-filter: blur(2px);
    display: none;
}

.modal-content {
    background-color: white;
    margin: 5% auto;
    padding: 0;
    border-radius: 12px;
    width: 80%;
    max-width: 800px;
    max-height: 85vh;
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

/* Prompt modal specific styles */
.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 25px;
    border-bottom: 1px solid #bdc3c7;
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
    color: white;
    border-radius: 12px 12px 0 0;
}

.modal-header h3 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 600;
}

.close {
    color: rgba(255,255,255,0.8);
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
    line-height: 1;
    transition: color 0.3s ease;
}

.close:hover {
    color: white;
}

.modal-body {
    padding: 25px;
}

.prompt-metadata {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
    border-left: 4px solid #3498db;
}

.metadata-item {
    margin-bottom: 8px;
    font-size: 14px;
}

.metadata-item:last-child {
    margin-bottom: 0;
}

.prompt-content h4 {
    margin: 0 0 15px 0;
    color: #2c3e50;
    font-size: 16px;
    font-weight: 600;
    border-bottom: 2px solid #3498db;
    padding-bottom: 8px;
}

.markdown-content {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 20px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
    line-height: 1.6;
    color: #2c3e50;
    border: 1px solid #e9ecef;
    max-height: 400px;
    overflow-y: auto;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3 {
    color: #2c3e50;
    margin: 15px 0 10px 0;
}

.markdown-content code {
    background: #e8f4fd;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    color: #2980b9;
}

.markdown-content strong {
    color: #e74c3c;
    font-weight: 600;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 20px 25px;
    border-top: 1px solid #e9ecef;
    background: #f8f9fa;
    border-radius: 0 0 12px 12px;
}

.dialog-content {
    padding: 25px;
}

.dialog-content h3 {
    margin: 0 0 20px 0;
    color: #2c3e50;
    font-size: 1.3rem;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #2c3e50;
}

.form-group input,
.form-group select {
    width: 100%;
    padding: 10px 12px;
    border: 2px solid #bdc3c7;
    border-radius: 6px;
    font-size: 14px;
    color: #2c3e50;
    background: white;
}

.form-group input:focus,
.form-group select:focus {
    outline: none;
    border-color: #e74c3c;
}

.dialog-buttons {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 25px;
}

.btn-primary {
    background: #e74c3c;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.3s;
}

.btn-primary:hover {
    background: #c0392b;
}

.btn-secondary {
    background: #ecf0f1;
    color: #2c3e50;
    border: 2px solid #bdc3c7;
    padding: 8px 18px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s;
}

.btn-secondary:hover {
    background: #d5dbdb;
    border-color: #95a5a6;
}

/* File input styles */
input[type="file"] {
    width: 100%;
    padding: 8px;
    border: 2px dashed #bdc3c7;
    border-radius: 6px;
    background: white;
    font-size: 14px;
    cursor: pointer;
    transition: border-color 0.3s ease;
}

input[type="file"]:hover {
    border-color: #e74c3c;
}

/* Responsive design */
@media (max-width: 768px) {
    .tree-toolbar {
        flex-direction: column;
        align-items: stretch;
    }
    
    .toolbar-section {
        justify-content: center;
    }
    
    .tree-info-section {
        justify-content: center;
        flex-wrap: wrap;
    }
    
    .modal-content {
        width: 95%;
        margin: 10% auto;
    }
    
    .dialog-buttons {
        flex-direction: column;
    }
    
    .visualizer-header h1 {
        font-size: 2rem;
    }
}
</style>

<div id="tree-visualizer-container">
    <div class="visualizer-header">
        <h1>Tree Visualizer</h1>
        <p>Create, edit, and visualize tree structures for code comprehension analysis</p>
    </div>

<!-- Standardized Back Button -->
<div class="back-button-container">
    <a href="/code-comprehension/" class="standard-back-btn">← Back to Code Comprehension</a>
</div>

    <!-- Message Display -->
    <div id="tree-message" class="message"></div>

    <!-- Instructions -->
    <div class="tree-toolbar" style="background: linear-gradient(135deg, #e8f4fd 0%, #f0f8ff 100%); border-left: 4px solid #3498db;">
        <div style="width: 100%;">
            <h4 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 16px;">📊 Automatic Data Loading</h4>
            <p style="margin: 0; font-size: 14px; color: #666;">
                This tree visualizer automatically loads JSON data from your server. 
                When you have prompt association data (prompts linked to error counts), the tree will build automatically.
                <strong>Click any node to request and view the full prompt from your server.</strong>
            </p>
        </div>
    </div>

    <!-- Toolbar -->
    <div class="tree-toolbar">
        <div class="toolbar-section">
            <button id="new-tree-btn" class="toolbar-btn">New Tree</button>
            <button id="load-tree-btn" class="toolbar-btn secondary">Load Tree</button>
            <button id="save-tree-btn" class="toolbar-btn secondary">Save Tree</button>
        </div>
        
        <div class="toolbar-section">
            <button id="add-node-btn" class="toolbar-btn success">Add Node</button>
            <button id="export-tree-btn" class="toolbar-btn">Export JSON</button>
            <button id="import-tree-btn" class="toolbar-btn">Import JSON</button>
            <button onclick="TreeVisualizer.loadTestData()" class="toolbar-btn" style="background: #f39c12;">Load Test Data</button>
        </div>

        <div id="tree-info" class="tree-info-section">
            <div class="tree-stat">
                <span class="stat-label">Nodes:</span>
                <span class="stat-value">0</span>
            </div>
            <div class="tree-stat">
                <span class="stat-label">Depth:</span>
                <span class="stat-value">0</span>
            </div>
        </div>
    </div>

    <!-- Tree Container -->
    <div class="tree-main-container">
        <div class="tree-container-header">
            <h3 class="tree-container-title">Tree Structure Visualization</h3>
        </div>
        <div id="tree-container"></div>
    </div>
</div>

<!-- Modal for dialogs -->
<div id="tree-modal" class="modal">
    <div class="modal-content">
        <div id="tree-modal-content"></div>
    </div>
</div>

<!-- Load tree configuration and visualizer -->
<script src="{{ '/assets/js/treant-config.js' | relative_url }}"></script>
<script src="{{ '/assets/js/tree-visualizer.js' | relative_url }}"></script>

</div>

<script>
console.log('Tree Visualizer - Script loaded');

document.addEventListener('authReady', () => {
    console.log('Tree Visualizer - authReady event fired');
    if (window.authService.isAuthenticated) {
        const user = window.authService.user;
        
        // Check user roles in multiple possible locations
        const customRoles = user['https://carsontkempf.github.io/roles'] || [];
        const auth0Roles = user['https://auth0.com/roles'] || [];
        const appMetadataRoles = user.app_metadata?.roles || [];
        const userMetadataRoles = user.user_metadata?.roles || [];
        
        // Check additional possible role locations
        const rolesArray = user.roles || [];
        const authorizationRoles = user.authorization?.roles || [];
        const orgRoles = user['org_roles'] || [];
        const realmRoles = user['realm_roles'] || [];
        
        // Combine all possible role sources
        const allRoles = [...customRoles, ...auth0Roles, ...appMetadataRoles, ...userMetadataRoles, ...rolesArray, ...authorizationRoles, ...orgRoles, ...realmRoles];
        
        // Debug: Log user info and roles for troubleshooting
        console.log('Tree Visualizer - User Debug Info:', {
            user: user,
            userKeys: Object.keys(user),
            customRoles: customRoles,
            auth0Roles: auth0Roles,
            appMetadataRoles: appMetadataRoles,
            userMetadataRoles: userMetadataRoles,
            rolesArray: rolesArray,
            authorizationRoles: authorizationRoles,
            orgRoles: orgRoles,
            realmRoles: realmRoles,
            allRoles: allRoles,
            userEmail: user.email,
            userSub: user.sub
        });
        
        // Additional debug for all custom claim keys
        const customClaimKeys = Object.keys(user).filter(key => key.includes('://'));
        console.log('Custom claim keys found:', customClaimKeys);
        customClaimKeys.forEach(key => {
            console.log(`${key}:`, user[key]);
        });
        
        const hasAdminRole = allRoles.includes('admin');
        const hasCodeComprehensionRole = allRoles.includes('code-comprehension') || 
                                        allRoles.includes('Code-Comprehension-Project') || 
                                        allRoles.includes('rol_XUUh9ZOhirY2yCQQ');
        const isSiteOwner = user.email === 'ctkfdp@umsystem.edu';
        
        // Check if user has any of the required permissions
        if (hasAdminRole || hasCodeComprehensionRole || isSiteOwner) {
            document.getElementById('project-content-wrapper').style.display = 'block';
        } else {
            document.getElementById('auth-check-wrapper').style.display = 'block';
        }
    } else {
        console.log('Tree Visualizer - User not authenticated');
        document.getElementById('auth-check-wrapper').style.display = 'block';
    }
});

console.log('Tree Visualizer - Setting up timeout fallback');

// If auth service isn't ready after 5 seconds, show access denied
setTimeout(() => {
    console.log('Tree Visualizer - Timeout check - authService available:', !!window.authService);
    console.log('Tree Visualizer - Timeout check - isAuthenticated:', window.authService?.isAuthenticated);
    if (!window.authService || !window.authService.isAuthenticated) {
        console.log('Tree Visualizer - Timeout triggered, showing access denied');
        document.getElementById('auth-check-wrapper').style.display = 'block';
    }
}, 5000);

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('tree-modal');
    if (event.target === modal) {
        TreeVisualizer.closeDialog();
    }
}
</script>