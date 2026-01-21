// Homepage YouTube Videos Display
window.homepageVideos = {
    async loadAndDisplay() {
        try {
            console.log('[VIDEOS] Starting to load videos...');
            const response = await fetch('/videos.json');
            console.log('[VIDEOS] Fetch response status:', response.status, response.statusText);

            if (!response.ok) {
                console.error('[VIDEOS] Failed to fetch videos.json:', response.status, response.statusText);
                return;
            }

            const data = await response.json();
            console.log('[VIDEOS] Loaded data:', data);

            if (!data || !data.videos || data.videos.length === 0) {
                console.warn('[VIDEOS] No videos to display in data');
                return;
            }

            console.log('[VIDEOS] Rendering', data.videos.length, 'videos');
            this.renderVideos(data.videos);
        } catch (error) {
            console.error('[VIDEOS] Failed to load videos:', error);
        }
    },

    renderVideos(videos) {
        const container = document.getElementById('videos-grid');
        console.log('[VIDEOS] Container element:', container);

        if (!container) {
            console.error('[VIDEOS] videos-grid container not found in DOM');
            return;
        }

        // Show latest 6 videos
        const latestVideos = videos.slice(0, 6);
        console.log('[VIDEOS] Displaying', latestVideos.length, 'videos');

        container.innerHTML = latestVideos.map(video => this.renderVideo(video)).join('');
        console.log('[VIDEOS] Videos rendered successfully');
    },

    renderVideo({youtube_id, title, description, linked_article}) {
        return `
            <div class="video-card">
                <div class="video-embed">
                    <iframe
                        src="https://www.youtube.com/embed/${youtube_id}"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                        loading="lazy"
                    ></iframe>
                </div>
                <div class="video-metadata">
                    <h3>${title}</h3>
                    ${description ? `<p class="video-desc">${description}</p>` : ''}
                    ${linked_article ? `<a href="${linked_article}" class="video-article-link">Read full article</a>` : ''}
                </div>
            </div>
        `;
    }
};
