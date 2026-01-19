// YouTube Video Manager
window.videoManager = {
    videos: [],
    currentEditId: null,

    async loadVideos() {
        try {
            const file = await window.githubService.getFile('_data/videos.yml');

            if (file.exists && file.content.trim()) {
                const data = jsyaml.load(file.content);
                this.videos = data.videos || [];
            } else {
                this.videos = [];
            }

            this.renderVideosList();
            this.updateArticleDropdown();
        } catch (error) {
            console.error('Failed to load videos:', error);
            alert('Failed to load videos: ' + error.message);
        }
    },

    extractYouTubeId(input) {
        // Handle full URLs
        const urlPattern = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
        const match = input.match(urlPattern);
        if (match) {
            return match[1];
        }

        // Handle direct ID (11 characters)
        if (input.length === 11 && /^[a-zA-Z0-9_-]+$/.test(input)) {
            return input;
        }

        return null;
    },

    generateId(title) {
        return title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    async addVideo(event) {
        event.preventDefault();

        const title = document.getElementById('video-title').value.trim();
        const youtubeInput = document.getElementById('video-youtube-id').value.trim();
        const description = document.getElementById('video-description').value.trim();
        const linkedArticle = document.getElementById('video-linked-article').value;

        // Extract YouTube ID
        const youtubeId = this.extractYouTubeId(youtubeInput);
        if (!youtubeId) {
            alert('Invalid YouTube URL or ID. Please provide a valid YouTube URL or 11-character ID.');
            return;
        }

        // Generate unique ID
        const id = this.generateId(title);

        // Check for duplicate ID
        if (this.videos.find(v => v.id === id)) {
            alert('A video with a similar title already exists. Please use a different title.');
            return;
        }

        const newVideo = {
            id: id,
            title: title,
            youtube_id: youtubeId,
            description: description,
            linked_article: linkedArticle || null,
            date_added: new Date().toISOString().split('T')[0]
        };

        this.videos.push(newVideo);

        try {
            await this.saveToGitHub('Add video: ' + title);
            document.getElementById('video-form').reset();
            alert('Video added successfully!');
        } catch (error) {
            console.error('Failed to add video:', error);
            alert('Failed to add video: ' + error.message);
            // Remove from array if save failed
            this.videos.pop();
        }
    },

    async updateVideo(id) {
        const video = this.videos.find(v => v.id === id);
        if (!video) return;

        // Populate form with video data
        document.getElementById('video-title').value = video.title;
        document.getElementById('video-youtube-id').value = video.youtube_id;
        document.getElementById('video-description').value = video.description || '';
        document.getElementById('video-linked-article').value = video.linked_article || '';

        // Store the ID being edited
        this.currentEditId = id;

        // Change form submit to update mode
        const form = document.getElementById('video-form');
        form.onsubmit = (e) => this.saveEdit(e);

        // Update button text
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Update Video';

        // Scroll to form
        form.scrollIntoView({ behavior: 'smooth' });
    },

    async saveEdit(event) {
        event.preventDefault();

        if (!this.currentEditId) return;

        const title = document.getElementById('video-title').value.trim();
        const youtubeInput = document.getElementById('video-youtube-id').value.trim();
        const description = document.getElementById('video-description').value.trim();
        const linkedArticle = document.getElementById('video-linked-article').value;

        // Extract YouTube ID
        const youtubeId = this.extractYouTubeId(youtubeInput);
        if (!youtubeId) {
            alert('Invalid YouTube URL or ID. Please provide a valid YouTube URL or 11-character ID.');
            return;
        }

        // Find and update the video
        const index = this.videos.findIndex(v => v.id === this.currentEditId);
        if (index === -1) return;

        this.videos[index] = {
            ...this.videos[index],
            title: title,
            youtube_id: youtubeId,
            description: description,
            linked_article: linkedArticle || null
        };

        try {
            await this.saveToGitHub('Update video: ' + title);
            this.cancelEdit();
            alert('Video updated successfully!');
        } catch (error) {
            console.error('Failed to update video:', error);
            alert('Failed to update video: ' + error.message);
        }
    },

    cancelEdit() {
        this.currentEditId = null;
        const form = document.getElementById('video-form');
        form.reset();
        form.onsubmit = (e) => this.addVideo(e);
        form.querySelector('button[type="submit"]').textContent = 'Add Video';
    },

    async deleteVideo(id) {
        if (!confirm('Are you sure you want to delete this video?')) {
            return;
        }

        const video = this.videos.find(v => v.id === id);
        if (!video) return;

        const index = this.videos.findIndex(v => v.id === id);
        this.videos.splice(index, 1);

        try {
            await this.saveToGitHub('Delete video: ' + video.title);
            alert('Video deleted successfully!');
        } catch (error) {
            console.error('Failed to delete video:', error);
            alert('Failed to delete video: ' + error.message);
            // Restore video if delete failed
            this.videos.splice(index, 0, video);
            this.renderVideosList();
        }
    },

    async saveToGitHub(message) {
        try {
            // Get current file to get SHA
            const file = await window.githubService.getFile('_data/videos.yml');

            // Convert to YAML
            const yamlContent = jsyaml.dump({ videos: this.videos }, {
                indent: 2,
                lineWidth: 80,
                noRefs: true
            });

            // Save to GitHub
            await window.githubService.saveFile(
                '_data/videos.yml',
                yamlContent,
                message,
                file.sha
            );

            // Reload to ensure we have latest data
            await this.loadVideos();
        } catch (error) {
            throw error;
        }
    },

    renderVideosList() {
        const container = document.getElementById('videos-list');
        if (!container) return;

        if (this.videos.length === 0) {
            container.innerHTML = '<p style="color: #666;">No videos yet. Add your first video above.</p>';
            return;
        }

        container.innerHTML = this.videos.map(video => `
            <div class="video-item" data-id="${video.id}">
                <div class="video-preview">
                    <img src="https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg" alt="${video.title}">
                </div>
                <div class="video-info">
                    <h4>${video.title}</h4>
                    <p class="video-id">ID: ${video.youtube_id}</p>
                    ${video.description ? `<p class="video-description">${video.description}</p>` : ''}
                    ${video.linked_article ? `<p class="video-link">Linked to: ${video.linked_article}</p>` : ''}
                    <p class="video-date">Added: ${video.date_added}</p>
                </div>
                <div class="video-actions">
                    <button onclick="videoManager.updateVideo('${video.id}')">Edit</button>
                    <button onclick="videoManager.deleteVideo('${video.id}')" class="danger">Delete</button>
                </div>
            </div>
        `).join('');
    },

    async updateArticleDropdown() {
        const dropdown = document.getElementById('video-linked-article');
        if (!dropdown) return;

        try {
            // Get articles from _posts directory
            if (window.articleManager && window.articleManager.articles) {
                dropdown.innerHTML = '<option value="">No linked article</option>' +
                    window.articleManager.articles.map(article =>
                        `<option value="${article.path}">${article.name}</option>`
                    ).join('');
            }
        } catch (error) {
            console.error('Failed to update article dropdown:', error);
        }
    }
};

// Attach addVideo function to window for inline onclick
window.addVideo = (e) => window.videoManager.addVideo(e);
