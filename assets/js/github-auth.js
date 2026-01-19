// GitHub Authentication Service
window.githubService = {
    octokit: null,
    isAuthenticated: false,
    repoOwner: 'carsontkempf',
    repoName: 'carsontkempf.github.io',
    branch: 'gh-pages',

    async login(pat) {
        try {
            // Initialize Octokit with the Personal Access Token
            this.octokit = new Octokit.Octokit({
                auth: pat
            });

            // Verify access by attempting to get repo info
            await this.verifyAccess();

            // Store token in sessionStorage (cleared on browser close)
            sessionStorage.setItem('github_pat', pat);
            this.isAuthenticated = true;

            console.log('GitHub authentication successful');
            return true;
        } catch (error) {
            this.isAuthenticated = false;
            this.octokit = null;
            console.error('GitHub authentication failed:', error);
            throw new Error('Failed to authenticate with GitHub. Please check your token and permissions.');
        }
    },

    logout() {
        sessionStorage.removeItem('github_pat');
        this.octokit = null;
        this.isAuthenticated = false;

        // Reload page to reset UI
        window.location.reload();
    },

    async verifyAccess() {
        try {
            const { data } = await this.octokit.rest.repos.get({
                owner: this.repoOwner,
                repo: this.repoName
            });

            // Check if we have push access
            if (!data.permissions || !data.permissions.push) {
                throw new Error('Token does not have write access to the repository');
            }

            return true;
        } catch (error) {
            if (error.status === 404) {
                throw new Error('Repository not found or token lacks access');
            }
            throw error;
        }
    },

    // UTF-8 safe Base64 encoding
    encodeBase64(str) {
        return btoa(unescape(encodeURIComponent(str)));
    },

    // UTF-8 safe Base64 decoding
    decodeBase64(str) {
        return decodeURIComponent(escape(atob(str)));
    },

    // Get file content and SHA
    async getFile(path) {
        if (!this.isAuthenticated) {
            throw new Error('Not authenticated with GitHub');
        }

        try {
            const { data } = await this.octokit.rest.repos.getContent({
                owner: this.repoOwner,
                repo: this.repoName,
                path: path,
                ref: this.branch
            });

            return {
                content: this.decodeBase64(data.content),
                sha: data.sha,
                exists: true
            };
        } catch (error) {
            if (error.status === 404) {
                return { exists: false, content: null, sha: null };
            }
            throw error;
        }
    },

    // Save file (create or update)
    async saveFile(path, content, message, sha = null) {
        if (!this.isAuthenticated) {
            throw new Error('Not authenticated with GitHub');
        }

        const payload = {
            owner: this.repoOwner,
            repo: this.repoName,
            path: path,
            message: message,
            content: this.encodeBase64(content),
            branch: this.branch,
            committer: {
                name: "Writer's Admin",
                email: "admin@carsontkempf.github.io"
            }
        };

        // SHA is required for updates to prevent conflicts
        if (sha) {
            payload.sha = sha;
        }

        try {
            const { data } = await this.octokit.rest.repos.createOrUpdateFileContents(payload);
            return data;
        } catch (error) {
            if (error.status === 409) {
                throw new Error('File has been modified. Please reload and try again.');
            }
            throw error;
        }
    },

    // Delete file
    async deleteFile(path, sha, message) {
        if (!this.isAuthenticated) {
            throw new Error('Not authenticated with GitHub');
        }

        await this.octokit.rest.repos.deleteFile({
            owner: this.repoOwner,
            repo: this.repoName,
            path: path,
            message: message,
            sha: sha,
            branch: this.branch
        });
    },

    // List files in a directory
    async listFiles(path) {
        if (!this.isAuthenticated) {
            throw new Error('Not authenticated with GitHub');
        }

        try {
            const { data } = await this.octokit.rest.repos.getContent({
                owner: this.repoOwner,
                repo: this.repoName,
                path: path,
                ref: this.branch
            });

            // Filter to only files (not directories)
            return Array.isArray(data) ? data.filter(item => item.type === 'file') : [];
        } catch (error) {
            if (error.status === 404) {
                return [];
            }
            throw error;
        }
    },

    // Auto-restore session if token exists
    async restoreSession() {
        const pat = sessionStorage.getItem('github_pat');
        if (pat) {
            try {
                await this.login(pat);
                return true;
            } catch (error) {
                sessionStorage.removeItem('github_pat');
                return false;
            }
        }
        return false;
    }
};

// Try to restore session on page load
document.addEventListener('DOMContentLoaded', async () => {
    const restored = await window.githubService.restoreSession();
    if (restored) {
        // Update UI to show connected state
        const loginForm = document.getElementById('github-login-form');
        const logoutBtn = document.getElementById('github-logout-btn');
        const status = document.getElementById('github-status');
        const tabs = document.getElementById('admin-tabs');

        if (loginForm) loginForm.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (status) status.textContent = 'Connected to GitHub';
        if (tabs) tabs.style.display = 'block';

        // Load data
        if (window.videoManager) await window.videoManager.loadVideos();
        if (window.articleManager) await window.articleManager.loadArticles();
    }
});
