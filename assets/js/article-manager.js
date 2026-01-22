// Markdown Article Manager
window.articleManager = {
    editor: null,
    articles: [],
    folderStructure: {},
    currentArticle: null,
    expandedFolders: new Set(),

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

    async loadAllPosts() {
        try {
            // Recursively load all files from _posts/
            const structure = await this.loadDirectoryRecursive('_posts');
            this.folderStructure = structure;
            this.articles = this.flattenArticles(structure);

            this.renderFolderTree();

            // Update video manager dropdown
            if (window.videoManager) {
                window.videoManager.updateArticleDropdown();
            }
        } catch (error) {
            console.error('Failed to load posts:', error);
            alert('Failed to load posts: ' + error.message);
        }
    },

    async loadDirectoryRecursive(path) {
        try {
            const items = await window.githubService.listFiles(path);
            const structure = {
                folders: [],
                files: []
            };

            for (const item of items) {
                if (item.type === 'dir') {
                    const subStructure = await this.loadDirectoryRecursive(item.path);
                    structure.folders.push({
                        name: item.name,
                        path: item.path,
                        ...subStructure
                    });
                } else if (item.name.endsWith('.md') && item.name !== '.gitkeep') {
                    structure.files.push({
                        name: item.name,
                        path: item.path,
                        sha: item.sha
                    });
                }
            }

            // Sort folders and files alphabetically
            structure.folders.sort((a, b) => a.name.localeCompare(b.name));
            structure.files.sort((a, b) => a.name.localeCompare(b.name));

            return structure;
        } catch (error) {
            if (error.status === 404) {
                return { folders: [], files: [] };
            }
            throw error;
        }
    },

    flattenArticles(structure, result = []) {
        if (structure.files) {
            result.push(...structure.files);
        }
        if (structure.folders) {
            structure.folders.forEach(folder => {
                this.flattenArticles(folder, result);
            });
        }
        return result;
    },

    // Deprecated - use loadAllPosts instead
    async loadArticles() {
        return this.loadAllPosts();
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

            // Extract folder from path
            const pathParts = path.split('/');
            pathParts.shift(); // Remove '_posts'
            pathParts.pop(); // Remove filename
            const folder = pathParts.join('/');

            // Store current article info
            this.currentArticle = {
                path: path,
                sha: file.sha,
                frontMatter: frontMatter,
                folder: folder
            };

            // Populate form
            document.getElementById('article-title').value = frontMatter.title || '';
            document.getElementById('article-permalink').value = frontMatter.permalink || '';

            const folderInput = document.getElementById('article-folder');
            if (folderInput) {
                folderInput.value = folder;
            }

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
        const title = prompt('Enter post title:');
        if (!title) return;

        const folder = prompt('Enter folder path relative to _posts/\n(e.g., "Personal/AI", "School", or "Articles")', 'Personal');
        if (!folder) return;

        const category = folder.split('/').pop(); // Use last part of path as category

        const slug = this.generateSlug(title);
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        const filename = `${dateStr}-${slug}.md`;
        const permalink = `/${slug}/`;

        // Set up new article
        this.currentArticle = {
            path: `_posts/${folder}/${filename}`,
            sha: null,
            frontMatter: {
                layout: 'post',
                title: title,
                date: dateStr + ' 12:00:00 -0000',
                categories: `[${category}]`,
                permalink: permalink
            }
        };

        // Populate form
        document.getElementById('article-title').value = title;
        document.getElementById('article-permalink').value = permalink;
        document.getElementById('article-folder').value = folder;

        // Clear editor
        if (this.editor) {
            this.editor.value('');
        }

        console.log('New post created:', this.currentArticle.path);
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
        // Deprecated - redirects to renderFolderTree
        this.renderFolderTree();
    },

    renderFolderTree() {
        const container = document.getElementById('articles-list');
        if (!container) return;

        if (this.articles.length === 0) {
            container.innerHTML = '<p style="color: #666; font-size: 0.9rem;">No posts yet. Create your first post.</p>';
            return;
        }

        container.innerHTML = this.renderFolderNode(this.folderStructure, '_posts');
    },

    renderFolderNode(node, path, level = 0) {
        let html = '';
        const indent = level * 15;

        // Render folders
        if (node.folders) {
            node.folders.forEach(folder => {
                const isExpanded = this.expandedFolders.has(folder.path);
                const folderIcon = isExpanded ? '📂' : '📁';

                html += `
                    <div class="folder-item" style="padding-left: ${indent}px;">
                        <div class="folder-header" onclick="articleManager.toggleFolder('${folder.path}')">
                            <span class="folder-icon">${folderIcon}</span>
                            <span class="folder-name">${folder.name}</span>
                            <span class="folder-count">(${this.countFiles(folder)})</span>
                        </div>
                        ${isExpanded ? `<div class="folder-contents">${this.renderFolderNode(folder, folder.path, level + 1)}</div>` : ''}
                    </div>
                `;
            });
        }

        // Render files
        if (node.files) {
            node.files.forEach(file => {
                html += `
                    <div class="article-item" style="padding-left: ${indent + 15}px;">
                        <span class="article-icon">📄</span>
                        <span class="article-name" onclick="articleManager.loadArticle('${file.path}')">${file.name}</span>
                        <span class="article-actions">
                            <button class="btn-small" onclick="event.stopPropagation(); articleManager.moveArticle('${file.path}')" title="Move">↕</button>
                            <button class="btn-small" onclick="event.stopPropagation(); articleManager.renameArticle('${file.path}')" title="Rename">✏</button>
                        </span>
                    </div>
                `;
            });
        }

        return html;
    },

    countFiles(folder) {
        let count = folder.files ? folder.files.length : 0;
        if (folder.folders) {
            folder.folders.forEach(subFolder => {
                count += this.countFiles(subFolder);
            });
        }
        return count;
    },

    toggleFolder(path) {
        if (this.expandedFolders.has(path)) {
            this.expandedFolders.delete(path);
        } else {
            this.expandedFolders.add(path);
        }
        this.renderFolderTree();
    },

    async moveArticle(oldPath) {
        const fileName = oldPath.split('/').pop();
        const newFolder = prompt(`Move "${fileName}" to which folder?\nEnter path relative to _posts/ (e.g., "Personal/AI" or "School")`);

        if (!newFolder) return;

        const newPath = `_posts/${newFolder}/${fileName}`;

        if (oldPath === newPath) {
            alert('Same location. No changes made.');
            return;
        }

        try {
            // Get file content
            const file = await window.githubService.getFile(oldPath);
            if (!file.exists) {
                alert('File not found');
                return;
            }

            // Save to new location
            await window.githubService.saveFile(
                newPath,
                file.content,
                `Move ${fileName} to ${newFolder}`,
                null
            );

            // Delete from old location
            await window.githubService.deleteFile(
                oldPath,
                file.sha,
                `Remove ${fileName} from old location`
            );

            alert('File moved successfully!');
            await this.loadAllPosts();

            // Update current article if it was the one being moved
            if (this.currentArticle && this.currentArticle.path === oldPath) {
                this.currentArticle.path = newPath;
            }
        } catch (error) {
            console.error('Failed to move article:', error);
            alert('Failed to move article: ' + error.message);
        }
    },

    async renameArticle(oldPath) {
        const oldName = oldPath.split('/').pop();
        const newName = prompt(`Rename "${oldName}" to:`, oldName);

        if (!newName || newName === oldName) return;

        if (!newName.endsWith('.md')) {
            alert('Filename must end with .md');
            return;
        }

        const pathParts = oldPath.split('/');
        pathParts[pathParts.length - 1] = newName;
        const newPath = pathParts.join('/');

        try {
            // Get file content
            const file = await window.githubService.getFile(oldPath);
            if (!file.exists) {
                alert('File not found');
                return;
            }

            // Save with new name
            await window.githubService.saveFile(
                newPath,
                file.content,
                `Rename ${oldName} to ${newName}`,
                null
            );

            // Delete old file
            await window.githubService.deleteFile(
                oldPath,
                file.sha,
                `Remove old file ${oldName}`
            );

            alert('File renamed successfully!');
            await this.loadAllPosts();

            // Update current article if it was the one being renamed
            if (this.currentArticle && this.currentArticle.path === oldPath) {
                this.currentArticle.path = newPath;
            }
        } catch (error) {
            console.error('Failed to rename article:', error);
            alert('Failed to rename article: ' + error.message);
        }
    },

    async createFolder() {
        const folderPath = prompt('Enter folder path relative to _posts/\n(e.g., "Personal/NewCategory" or "NewSection")');

        if (!folderPath) return;

        const fullPath = `_posts/${folderPath}/.gitkeep`;

        try {
            await window.githubService.saveFile(
                fullPath,
                '',
                `Create folder ${folderPath}`,
                null
            );

            alert('Folder created successfully!');
            await this.loadAllPosts();
        } catch (error) {
            console.error('Failed to create folder:', error);
            alert('Failed to create folder: ' + error.message);
        }
    }
};

// Attach functions to window for inline onclick
window.createNewArticle = () => window.articleManager.createNewArticle();
window.saveArticle = () => window.articleManager.saveArticle();
window.deleteCurrentArticle = () => window.articleManager.deleteCurrentArticle();
window.createFolder = () => window.articleManager.createFolder();
