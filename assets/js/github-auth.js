// GitHub Authentication Service
window.githubService = {
    token: null,
    isAuthenticated: false,
    repoOwner: 'carsontkempf',
    repoName: 'carsontkempf.github.io',
    branch: 'gh-pages',
    apiBaseUrl: 'https://api.github.com',

    // Helper method to make authenticated requests to GitHub API
    async githubRequest(endpoint, options = {}) {
        if (!this.token) {
            throw new Error('Not authenticated with GitHub');
        }

        const url = `${this.apiBaseUrl}${endpoint}`;
        const headers = {
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${this.token}`,
            'X-GitHub-Api-Version': '2022-11-28',
            ...options.headers
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        // Handle error responses
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(errorData.message || `GitHub API error: ${response.status}`);
            error.status = response.status;
            error.response = { headers: response.headers, data: errorData };
            throw error;
        }

        // Return JSON response if content exists
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }

        return null;
    },

    async fetchTokenFromNetlify() {
        if (!window.authService || !window.authService.isAuthenticated) {
            throw new Error('Must be authenticated with Auth0 first');
        }

        try {
            console.log('[GitHub Auth] Fetching Auth0 token...');
            const auth0Token = await window.authService.client.getTokenSilently();
            console.log('[GitHub Auth] Auth0 token obtained, fetching GitHub PAT from Netlify...');

            // UPDATED: Point directly to the Netlify App URL where the function lives
            const response = await fetch('https://carsontkempf.netlify.app/.netlify/functions/get-github-token', {
                headers: {
                    'Authorization': `Bearer ${auth0Token}`
                }
            });

            console.log('[GitHub Auth] Netlify function response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[GitHub Auth] Netlify function error response:', errorText);
                try {
                    const error = JSON.parse(errorText);
                    throw new Error(error.message || 'Failed to fetch GitHub token');
                } catch (parseError) {
                    throw new Error(`Failed to fetch GitHub token. Status: ${response.status}, Response: ${errorText}`);
                }
            }

            const data = await response.json();
            console.log('[GitHub Auth] GitHub PAT retrieved successfully');
            return data.token;
        } catch (error) {
            console.error('[GitHub Auth] Failed to fetch GitHub token:', error);
            throw error;
        }
    },

    async login(pat = null) {
        try {
            console.log('[GitHub Auth] Starting login...');
            // If no PAT provided, fetch from Netlify function
            const token = pat || await this.fetchTokenFromNetlify();

            console.log('[GitHub Auth] Storing GitHub token...');
            // Store token for API requests
            this.token = token;

            console.log('[GitHub Auth] Verifying repository access...');
            // Verify access by attempting to get repo info
            await this.verifyAccess();

            // Store token in sessionStorage (cleared on browser close)
            sessionStorage.setItem('github_pat', token);
            this.isAuthenticated = true;

            console.log('[GitHub Auth] ✓ GitHub authentication successful');
            return true;
        } catch (error) {
            this.isAuthenticated = false;
            this.token = null;
            console.error('[GitHub Auth] ✗ GitHub authentication failed:', error);
            throw new Error('Failed to authenticate with GitHub. Please check your token and permissions.');
        }
    },

    logout() {
        sessionStorage.removeItem('github_pat');
        this.token = null;
        this.isAuthenticated = false;

        // Reload page to reset UI
        window.location.reload();
    },

    async verifyAccess() {
        try {
            console.log(`[GitHub Auth] Checking access to ${this.repoOwner}/${this.repoName}...`);
            const data = await this.githubRequest(`/repos/${this.repoOwner}/${this.repoName}`);

            console.log('[GitHub Auth] Repository found. Checking permissions...');
            console.log('[GitHub Auth] Permissions:', data.permissions);

            // Check if we have push access
            if (!data.permissions || !data.permissions.push) {
                throw new Error('Token does not have write access to the repository');
            }

            console.log('[GitHub Auth] ✓ Repository access verified');
            return true;
        } catch (error) {
            console.error('[GitHub Auth] ✗ Access verification failed:', error);
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
            const data = await this.githubRequest(
                `/repos/${this.repoOwner}/${this.repoName}/contents/${path}?ref=${this.branch}`
            );

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
            const data = await this.githubRequest(
                `/repos/${this.repoOwner}/${this.repoName}/contents/${path}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                }
            );
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

        await this.githubRequest(
            `/repos/${this.repoOwner}/${this.repoName}/contents/${path}`,
            {
                method: 'DELETE',
                body: JSON.stringify({
                    message: message,
                    sha: sha,
                    branch: this.branch
                })
            }
        );
    },

    // List files in a directory
    async listFiles(path) {
        if (!this.isAuthenticated) {
            throw new Error('Not authenticated with GitHub');
        }

        try {
            const data = await this.githubRequest(
                `/repos/${this.repoOwner}/${this.repoName}/contents/${path}?ref=${this.branch}`
            );

            // Return all items (both files and directories)
            return Array.isArray(data) ? data : [];
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
    },

    // Helper to extract front matter and content
    parseJekyllPost(content) {
        const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
        const match = content.match(frontMatterRegex);
        
        if (match) {
            return {
                frontMatter: match[1],
                body: match[2],
                hasFrontMatter: true
            };
        }
        
        return {
            frontMatter: '',
            body: content,
            hasFrontMatter: false
        };
    }
};

// Auto-connect to GitHub when page loads (for authorized users)
document.addEventListener('DOMContentLoaded', async () => {
    // Try to restore from session first
    const restored = await window.githubService.restoreSession();
    if (restored) {
        updateGitHubUI(true);
        return;
    }

    // Wait for Auth0 to be ready, then auto-connect
    document.addEventListener('authReady', async () => {
        if (window.authService && window.authService.isAuthenticated) {
            const hasAccess = window.authService.hasRole(['Admin', 'Writer']);
            if (hasAccess) {
                try {
                    await window.githubService.login();
                    updateGitHubUI(true);
                } catch (error) {
                    console.error('Auto-connect to GitHub failed:', error);
                    updateGitHubUI(false, error.message);
                }
            }
        }
    });
});

function updateGitHubUI(connected, errorMessage = null) {
    const authSection = document.getElementById('github-auth-section');
    const status = document.getElementById('github-status');
    const tabs = document.getElementById('admin-tabs');

    if (!authSection) return;

    if (connected) {
        authSection.style.display = 'none';
        if (tabs) tabs.style.display = 'block';

        // Load data
        if (window.videoManager) window.videoManager.loadVideos();
        if (window.articleManager) window.articleManager.loadAllPosts();
    } else {
        if (status) {
            status.textContent = errorMessage || 'Not connected';
            status.style.color = '#dc3545';
        }
    }
}