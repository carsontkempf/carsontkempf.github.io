---
layout: admin
title: Writer's Admin
permalink: /admin/
---

<script src="/assets/js/role-protection.js"></script>

<div id="admin-login-prompt" style="display: none;">
    <h2>Access Denied</h2>
    <p>You must have Admin or Writer role to access this page.</p>
    <button onclick="authService.login()" class="login-btn">Log In</button>
</div>

<div id="admin-content-wrapper" style="display: none;">
    <div id="github-auth-section">
        <h3>GitHub Authentication</h3>
        <p id="github-status">Not connected</p>
        <div id="github-login-form">
            <input type="password" id="github-pat" placeholder="Enter GitHub Personal Access Token" style="width: 100%; max-width: 500px; padding: 10px; margin-bottom: 10px;">
            <button id="github-connect-btn" onclick="connectGitHub()">Connect to GitHub</button>
            <p style="font-size: 0.9rem; color: #666; margin-top: 10px;">
                Need a token? Create one at <a href="https://github.com/settings/tokens" target="_blank">GitHub Settings</a> with 'repo' scope.
            </p>
        </div>
        <button id="github-logout-btn" onclick="githubService.logout()" style="display: none;">Disconnect GitHub</button>
    </div>

    <div id="admin-tabs" style="display: none;">
        <div class="tab-navigation">
            <button class="tab-btn active" data-tab="video-manager">YouTube Video Manager</button>
            <button class="tab-btn" data-tab="markdown-editor">Markdown Editor</button>
        </div>

        <div id="video-manager" class="tab-content active">
            <h2>YouTube Video Manager</h2>

            <div class="admin-section">
                <h3>Add New Video</h3>
                <form id="video-form" onsubmit="addVideo(event)">
                    <input type="text" id="video-title" placeholder="Video Title" required>
                    <input type="text" id="video-youtube-id" placeholder="YouTube URL or ID" required>
                    <textarea id="video-description" placeholder="Video Description" rows="3"></textarea>
                    <select id="video-linked-article">
                        <option value="">No linked article</option>
                    </select>
                    <button type="submit">Add Video</button>
                </form>
            </div>

            <div class="admin-section">
                <h3>Existing Videos</h3>
                <div id="videos-list"></div>
            </div>
        </div>

        <div id="markdown-editor" class="tab-content">
            <h2>Markdown Editor</h2>

            <div class="editor-layout">
                <div class="editor-sidebar">
                    <div class="editor-actions">
                        <button onclick="createNewArticle()">New Article</button>
                        <button onclick="saveArticle()">Save</button>
                        <button onclick="deleteCurrentArticle()">Delete</button>
                    </div>
                    <h3>Articles</h3>
                    <div id="articles-list"></div>
                </div>

                <div class="editor-main">
                    <div id="article-meta">
                        <input type="text" id="article-title" placeholder="Article Title">
                        <input type="text" id="article-permalink" placeholder="Permalink (e.g., /my-article/)">
                    </div>
                    <textarea id="markdown-textarea"></textarea>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('authReady', () => {
    const hasAccess = window.authService.isAuthenticated &&
                     (window.authService.hasRole(['Admin', 'Writer', 'Root']));

    if (!hasAccess) {
        document.getElementById('admin-login-prompt').style.display = 'block';
        if (window.authService.isAuthenticated) {
            document.getElementById('admin-login-prompt').innerHTML = `
                <h2>Access Denied</h2>
                <p>You don't have permission to access this page.</p>
                <p>Required role: Admin or Writer</p>
                <p>Your roles: ${window.authService.roles.join(', ') || 'None'}</p>
            `;
        }
        return;
    }

    document.getElementById('admin-content-wrapper').style.display = 'block';

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');

            // Initialize editor when markdown tab is opened
            if (tabId === 'markdown-editor' && !window.articleManager.editor) {
                window.articleManager.initEditor();
            }
        });
    });
});

async function connectGitHub() {
    const pat = document.getElementById('github-pat').value.trim();
    if (!pat) {
        alert('Please enter a GitHub Personal Access Token');
        return;
    }

    try {
        await window.githubService.login(pat);
        document.getElementById('github-login-form').style.display = 'none';
        document.getElementById('github-logout-btn').style.display = 'block';
        document.getElementById('github-status').textContent = 'Connected to GitHub';
        document.getElementById('admin-tabs').style.display = 'block';

        // Load data
        await window.videoManager.loadVideos();
        await window.articleManager.loadArticles();
    } catch (error) {
        alert('Failed to connect to GitHub: ' + error.message);
    }
}
</script>
