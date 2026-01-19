// Homepage YouTube Videos Display
window.homepageVideos = {
    async loadAndDisplay() {
        try {
            const response = await fetch('/_data/videos.yml');
            if (!response.ok) {
                console.log('Videos file not found or empty');
                return;
            }

            const yamlText = await response.text();
            const data = jsyaml.load(yamlText);

            if (!data || !data.videos || data.videos.length === 0) {
                console.log('No videos to display');
                return;
            }

            this.renderVideos(data.videos);
        } catch (error) {
            console.error('Failed to load videos:', error);
        }
    },

    renderVideos(videos) {
        const container = document.getElementById('videos-grid');
        if (!container) return;

        // Show latest 6 videos
        const latestVideos = videos.slice(0, 6);

        container.innerHTML = latestVideos.map(video => this.renderVideo(video)).join('');
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
