// Markdown Article Manager
window.articleManager = {
    editor: null,
    articles: [],
    currentArticle: null,

    async initEditor() {
        if (this.editor) return;

        const textarea = document.getElementById('markdown-textarea');
        if (!textarea) {
            console.error('Markdown textarea not found');
            return;
        }

        this.editor = new EasyMDE({
            element: textarea,
            spellChecker: false,
            autosave: {
                enabled: true,
                uniqueId: "admin_editor",
                delay: 1000
            },
            toolbar: [
                "bold", "italic", "heading", "|",
                "quote", "unordered-list", "ordered-list", "|",
                "link", "image", "|",
                "preview", "side-by-side", "fullscreen"
            ],
            status: ["lines", "words", "cursor"],
            minHeight: "500px"
        });

        console.log('EasyMDE editor initialized');
    },

    async loadArticles() {
        try {
            // List files in _posts/Articles/
            const files = await window.githubService.listFiles('_posts/Articles');

            this.articles = files
                .filter(file => file.name.endsWith('.md'))
                .map(file => ({
                    name: file.name,
                    path: file.path,
                    sha: file.sha
                }))
                .sort((a, b) => b.name.localeCompare(a.name)); // Sort by date (newest first)

            this.renderArticlesList();

            // Update video manager dropdown
            if (window.videoManager) {
                window.videoManager.updateArticleDropdown();
            }
        } catch (error) {
            console.error('Failed to load articles:', error);
            // Create directory if it doesn't exist
            if (error.status === 404) {
                this.articles = [];
                this.renderArticlesList();
            } else {
                alert('Failed to load articles: ' + error.message);
            }
        }
    },

    async loadArticle(path) {
        try {
            const file = await window.githubService.getFile(path);

            if (!file.exists) {
                alert('Article not found');
                return;
            }

            // Parse front matter and content
            const { frontMatter, content } = this.parseFrontMatter(file.content);

            // Store current article info
            this.currentArticle = {
                path: path,
                sha: file.sha,
                frontMatter: frontMatter
            };

            // Populate form
            document.getElementById('article-title').value = frontMatter.title || '';
            document.getElementById('article-permalink').value = frontMatter.permalink || '';

            // Load content into editor
            if (this.editor) {
                this.editor.value(content);
            }

            console.log('Article loaded:', path);
        } catch (error) {
            console.error('Failed to load article:', error);
            alert('Failed to load article: ' + error.message);
        }
    },

    parseFrontMatter(content) {
        const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

        if (!match) {
            return { frontMatter: {}, content: content };
        }

        const frontMatterText = match[1];
        const bodyContent = match[2];

        // Parse YAML front matter
        const frontMatter = {};
        frontMatterText.split('\n').forEach(line => {
            const colonIndex = line.indexOf(':');
            if (colonIndex !== -1) {
                const key = line.substring(0, colonIndex).trim();
                let value = line.substring(colonIndex + 1).trim();

                // Remove quotes if present
                if ((value.startsWith('"') && value.endsWith('"')) ||
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }

                frontMatter[key] = value;
            }
        });

        return { frontMatter, content: bodyContent };
    },

    async createNewArticle() {
        const title = prompt('Enter article title:');
        if (!title) return;

        const slug = this.generateSlug(title);
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        const filename = `${dateStr}-${slug}.md`;
        const permalink = `/${slug}/`;

        // Set up new article
        this.currentArticle = {
            path: `_posts/Articles/${filename}`,
            sha: null,
            frontMatter: {
                layout: 'post',
                title: title,
                date: dateStr + ' 12:00:00 -0000',
                categories: '[Articles]',
                permalink: permalink
            }
        };

        // Populate form
        document.getElementById('article-title').value = title;
        document.getElementById('article-permalink').value = permalink;

        // Clear editor
        if (this.editor) {
            this.editor.value('');
        }

        console.log('New article created:', filename);
    },

    generateSlug(title) {
        return title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    async saveArticle() {
        if (!this.currentArticle) {
            alert('No article loaded. Please create a new article or load an existing one.');
            return;
        }

        if (!this.editor) {
            alert('Editor not initialized');
            return;
        }

        const title = document.getElementById('article-title').value.trim();
        const permalink = document.getElementById('article-permalink').value.trim();
        const content = this.editor.value();

        if (!title) {
            alert('Please enter a title');
            return;
        }

        // Update front matter
        this.currentArticle.frontMatter.title = title;
        this.currentArticle.frontMatter.permalink = permalink;

        // Construct full content with front matter
        const frontMatterLines = [
            '---',
            `layout: ${this.currentArticle.frontMatter.layout || 'post'}`,
            `title: "${title}"`,
            `date: ${this.currentArticle.frontMatter.date || new Date().toISOString().split('T')[0] + ' 12:00:00 -0000'}`,
            `categories: ${this.currentArticle.frontMatter.categories || '[Articles]'}`,
            `permalink: ${permalink}`,
            '---'
        ].join('\n');

        const fullContent = frontMatterLines + '\n' + content;

        try {
            await window.githubService.saveFile(
                this.currentArticle.path,
                fullContent,
                `${this.currentArticle.sha ? 'Update' : 'Create'} article: ${title}`,
                this.currentArticle.sha
            );

            alert('Article saved successfully!');
            await this.loadArticles();

            // Update SHA for future saves
            const updatedFile = await window.githubService.getFile(this.currentArticle.path);
            this.currentArticle.sha = updatedFile.sha;
        } catch (error) {
            console.error('Failed to save article:', error);
            alert('Failed to save article: ' + error.message);
        }
    },

    async deleteCurrentArticle() {
        if (!this.currentArticle || !this.currentArticle.sha) {
            alert('No article loaded to delete');
            return;
        }

        if (!confirm('Are you sure you want to delete this article? This cannot be undone.')) {
            return;
        }

        const title = this.currentArticle.frontMatter.title || 'article';

        try {
            await window.githubService.deleteFile(
                this.currentArticle.path,
                this.currentArticle.sha,
                `Delete article: ${title}`
            );

            alert('Article deleted successfully!');

            // Clear editor and form
            this.currentArticle = null;
            document.getElementById('article-title').value = '';
            document.getElementById('article-permalink').value = '';
            if (this.editor) {
                this.editor.value('');
            }

            await this.loadArticles();
        } catch (error) {
            console.error('Failed to delete article:', error);
            alert('Failed to delete article: ' + error.message);
        }
    },

    renderArticlesList() {
        const container = document.getElementById('articles-list');
        if (!container) return;

        if (this.articles.length === 0) {
            container.innerHTML = '<p style="color: #666; font-size: 0.9rem;">No articles yet. Create your first article.</p>';
            return;
        }

        container.innerHTML = this.articles.map(article => `
            <div class="article-item" onclick="articleManager.loadArticle('${article.path}')">
                ${article.name}
            </div>
        `).join('');
    }
};

// Attach functions to window for inline onclick
window.createNewArticle = () => window.articleManager.createNewArticle();
window.saveArticle = () => window.articleManager.saveArticle();
window.deleteCurrentArticle = () => window.articleManager.deleteCurrentArticle();
