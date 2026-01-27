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
    <div id="github-auth-section" style="background: rgba(0, 0, 0, 0.03); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; text-align: center;">
        <p id="github-status" style="font-size: 1rem; color: #666; margin: 0;">Connecting to GitHub...</p>
    </div>

    <div id="admin-tabs" style="display: none;">
        <div class="tab-navigation">
            <button class="tab-btn" data-tab="video-manager">YouTube Video Manager</button>
            <button class="tab-btn active" data-tab="markdown-editor">Markdown Editor</button>
        </div>

        <div id="video-manager" class="tab-content">
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

        <div id="markdown-editor" class="tab-content active">
            <h2>Post Manager</h2>

            <div class="editor-layout">
                <div class="editor-sidebar">
                    <div class="editor-actions">
                        <button onclick="createNewArticle()">New Post</button>
                        <button onclick="createFolder()">New Folder</button>
                        <button onclick="saveArticle()">Save</button>
                        <button onclick="deleteCurrentArticle()">Delete</button>
                    </div>
                    <h3>Posts Directory</h3>
                    <div id="articles-list"></div>
                </div>

                <div class="editor-main">
                    <div id="article-meta">
                        <input type="text" id="article-title" placeholder="Post Title">
                        <input type="text" id="article-folder" placeholder="Folder (e.g., Personal/AI)" readonly>
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

    // Initialize markdown editor on page load since it's the default tab
    if (window.articleManager && !window.articleManager.editor) {
        window.articleManager.initEditor();
    }

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');

            // Initialize editor when markdown tab is opened (if not already initialized)
            if (tabId === 'markdown-editor' && window.articleManager && !window.articleManager.editor) {
                window.articleManager.initEditor();
            }
        });
    });
});
</script>
