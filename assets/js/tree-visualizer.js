// Tree Visualization Manager
// Main JavaScript file for the tree visualization functionality

window.TreeVisualizer = {
    currentTree: null,
    treeInstance: null,
    isInitialized: false,
    promptData: null, // Store JSON data with prompt associations
    serverUrl: 'http://localhost:8888', // Server URL via SSH tunnel

    // Initialize the tree visualizer
    init: function() {
        if (this.isInitialized) {
            console.log('Tree visualizer already initialized');
            return;
        }

        console.log('Initializing tree visualizer...');
        this.setupEventListeners();
        this.checkForData();
        this.loadDefaultTree();
        this.isInitialized = true;
        console.log('Tree visualizer initialized');
    },

    // Set up event listeners
    setupEventListeners: function() {
        // Load tree button
        const loadBtn = document.getElementById('load-tree-btn');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => this.showLoadDialog());
        }

        // Save tree button
        const saveBtn = document.getElementById('save-tree-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.showSaveDialog());
        }

        // Export tree button
        const exportBtn = document.getElementById('export-tree-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportTree());
        }

        // Import tree button
        const importBtn = document.getElementById('import-tree-btn');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.showImportDialog());
        }

        // New tree button
        const newBtn = document.getElementById('new-tree-btn');
        if (newBtn) {
            newBtn.addEventListener('click', () => this.createNewTree());
        }

        // Add node button
        const addNodeBtn = document.getElementById('add-node-btn');
        if (addNodeBtn) {
            addNodeBtn.addEventListener('click', () => this.showAddNodeDialog());
        }

        // File input for import
        const fileInput = document.getElementById('tree-file-input');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileImport(e));
        }
    },

    // Check for data and build tree from it
    checkForData: function() {
        // Check if there's JSON data in localStorage or sessionStorage
        const promptData = localStorage.getItem('prompt_data') || sessionStorage.getItem('prompt_data');
        
        if (promptData) {
            try {
                this.promptData = JSON.parse(promptData);
                console.log('Found prompt data:', this.promptData);
                this.buildTreeFromPromptData();
                return true;
            } catch (error) {
                console.error('Error parsing data:', error);
            }
        }
        
        // Check for file drop or upload area
        this.setupDataHandler();
        return false;
    },

    // Setup handler for receiving JSON data
    setupDataHandler: function() {
        // Listen for custom events from data transfers
        document.addEventListener('data-received', (event) => {
            if (event.detail && event.detail.type === 'prompt-associations') {
                this.promptData = event.detail.data;
                this.buildTreeFromPromptData();
            }
        });

        // Also check periodically for new data
        setInterval(() => {
            this.checkForData();
        }, 5000);
    },

    // Build tree structure from prompt association data
    buildTreeFromPromptData: function() {
        if (!this.promptData || !Array.isArray(this.promptData)) {
            console.log('No valid prompt data found');
            return;
        }

        // Create tree structure based on error counts and prompt relationships
        const treeData = this.createTreeFromPrompts(this.promptData);
        this.loadTree(treeData);
    },

    // Create tree structure from prompt data
    createTreeFromPrompts: function(prompts) {
        // Sort prompts by error count for better visualization
        const sortedPrompts = [...prompts].sort((a, b) => a.errorCount - b.errorCount);

        // Create root node for best performing prompt
        const rootPrompt = sortedPrompts[0];
        const treeData = {
            chart: {
                container: "#tree-container",
                rootOrientation: "NORTH",
                nodeAlign: "CENTER",
                levelSeparation: 50,
                siblingSeparation: 40,
                subTeeSeparation: 40,
                scrollbar: "native",
                padding: 20,
                connectors: {
                    type: "curve",
                    style: {
                        "stroke-width": 2,
                        "stroke": "#2c3e50"
                    }
                },
                node: {
                    HTMLclass: "tree-node",
                    collapsable: true
                }
            },
            nodeStructure: this.createNodeStructure(rootPrompt, sortedPrompts.slice(1))
        };

        return treeData;
    },

    // Create node structure for a prompt
    createNodeStructure: function(prompt, remainingPrompts) {
        const nodeClass = this.getNodeClass(prompt.errorCount);
        const node = {
            text: { 
                name: `${prompt.promptId || prompt.filename || 'Unknown'}<br/>Errors: ${prompt.errorCount}` 
            },
            HTMLclass: nodeClass,
            promptData: prompt, // Store prompt data for click handling
            children: []
        };

        // Group remaining prompts by similarity or error range
        if (remainingPrompts.length > 0) {
            const children = this.groupPromptsForChildren(remainingPrompts);
            node.children = children.map(child => this.createNodeStructure(child, []));
        }

        return node;
    },

    // Group prompts into children nodes
    groupPromptsForChildren: function(prompts) {
        // Simple grouping - take up to 5 prompts for children
        return prompts.slice(0, 5);
    },

    // Get appropriate CSS class based on error count
    getNodeClass: function(errorCount) {
        if (errorCount === 0) return 'root-node'; // Best performance
        if (errorCount <= 2) return 'child-node'; // Good performance
        return 'leaf-node'; // Needs improvement
    },

    // Load default tree
    loadDefaultTree: function() {
        if (this.promptData) {
            // If we have prompt data, use it instead of default
            this.buildTreeFromPromptData();
            return;
        }
        
        if (window.TreeConfig && window.TreeConfig.defaultTree) {
            this.loadTree(window.TreeConfig.defaultTree);
        } else {
            console.error('Default tree configuration not found');
        }
    },

    // Load a tree structure
    loadTree: function(treeData) {
        if (!window.TreeConfig.utils.validateTree(treeData)) {
            console.error('Invalid tree structure');
            this.showMessage('Invalid tree structure', 'error');
            return false;
        }

        try {
            // Clear existing tree
            this.clearTree();

            // Create new tree instance
            this.currentTree = treeData;
            this.treeInstance = new Treant(treeData);
            
            // Setup node click handlers after tree is created
            setTimeout(() => {
                this.setupNodeClickHandlers();
            }, 500);
            
            this.updateTreeInfo();
            this.showMessage('Tree loaded successfully', 'success');
            return true;
        } catch (error) {
            console.error('Error loading tree:', error);
            this.showMessage('Error loading tree: ' + error.message, 'error');
            return false;
        }
    },

    // Setup click handlers for tree nodes
    setupNodeClickHandlers: function() {
        const nodes = document.querySelectorAll('.tree-node');
        nodes.forEach(node => {
            node.addEventListener('click', (event) => {
                this.handleNodeClick(event);
            });
            // Add visual indicator that nodes are clickable
            node.style.cursor = 'pointer';
            node.title = 'Click to view prompt details';
        });
    },

    // Handle node click to fetch and display prompt
    handleNodeClick: function(event) {
        event.preventDefault();
        event.stopPropagation();

        // Find the node data from the tree structure
        const nodeElement = event.currentTarget;
        const nodeData = this.findNodeDataForElement(nodeElement);
        
        if (nodeData && nodeData.promptData) {
            this.fetchAndDisplayPrompt(nodeData.promptData);
        } else {
            this.showMessage('No prompt data available for this node', 'error');
        }
    },

    // Find node data for a DOM element
    findNodeDataForElement: function(element) {
        // This is a simplified approach - in practice you might need more sophisticated tracking
        const nodeText = element.textContent;
        return this.findNodeDataByText(this.currentTree.nodeStructure, nodeText);
    },

    // Recursively find node data by text content
    findNodeDataByText: function(node, targetText) {
        if (node.text && node.text.name && targetText.includes(node.text.name.split('<br/>')[0])) {
            return node;
        }
        
        if (node.children) {
            for (const child of node.children) {
                const result = this.findNodeDataByText(child, targetText);
                if (result) return result;
            }
        }
        
        return null;
    },

    // Fetch prompt from server and display
    fetchAndDisplayPrompt: function(promptData) {
        const promptId = promptData.promptId || promptData.filename;
        if (!promptId) {
            this.showMessage('No prompt ID available', 'error');
            return;
        }

        this.showMessage('Fetching prompt...', 'info');

        // Request prompt from server
        fetch(`${this.serverUrl}/api/prompt/${promptId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.text();
            })
            .then(promptContent => {
                this.displayPromptModal(promptId, promptContent, promptData);
            })
            .catch(error => {
                console.error('Error fetching prompt:', error);
                this.showMessage(`Error fetching prompt: ${error.message}`, 'error');
            });
    },

    // Display prompt in a modal with markdown rendering
    displayPromptModal: function(promptId, promptContent, promptData) {
        const modalContent = `
            <div class="dialog-content">
                <div class="modal-header">
                    <h3>Prompt: ${promptId}</h3>
                    <span class="close" onclick="TreeVisualizer.closeDialog()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="prompt-metadata">
                        <div class="metadata-item">
                            <strong>Error Count:</strong> ${promptData.errorCount || 'N/A'}
                        </div>
                        <div class="metadata-item">
                            <strong>Created:</strong> ${promptData.timestamp || 'N/A'}
                        </div>
                    </div>
                    <div class="prompt-content">
                        <h4>Prompt Content:</h4>
                        <div class="markdown-content" id="prompt-markdown">
                            ${this.renderMarkdown(promptContent)}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="TreeVisualizer.closeDialog()" class="btn-secondary">Close</button>
                    <button onclick="TreeVisualizer.downloadPrompt('${promptId}', '${encodeURIComponent(promptContent)}')" class="btn-primary">Download</button>
                </div>
            </div>
        `;

        this.showDialog(modalContent);
    },

    // Simple markdown rendering (basic implementation)
    renderMarkdown: function(content) {
        if (!content) return 'No content available';
        
        // Basic markdown rendering
        return content
            .replace(/\n/g, '<br/>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>');
    },

    // Download prompt as markdown file
    downloadPrompt: function(promptId, encodedContent) {
        try {
            const content = decodeURIComponent(encodedContent);
            const blob = new Blob([content], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `${promptId}.md`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            this.showMessage('Prompt downloaded successfully', 'success');
        } catch (error) {
            console.error('Error downloading prompt:', error);
            this.showMessage('Error downloading prompt', 'error');
        }
    },

    // Clear the current tree
    clearTree: function() {
        const container = document.getElementById('tree-container');
        if (container) {
            container.innerHTML = '';
        }
        this.currentTree = null;
        this.treeInstance = null;
    },

    // Update tree information display
    updateTreeInfo: function() {
        if (!this.currentTree) return;

        const nodeCount = window.TreeConfig.utils.countNodes(this.currentTree.nodeStructure);
        const depth = window.TreeConfig.utils.getTreeDepth(this.currentTree.nodeStructure);

        const infoElement = document.getElementById('tree-info');
        if (infoElement) {
            infoElement.innerHTML = `
                <div class="tree-stat">
                    <span class="stat-label">Nodes:</span>
                    <span class="stat-value">${nodeCount}</span>
                </div>
                <div class="tree-stat">
                    <span class="stat-label">Depth:</span>
                    <span class="stat-value">${depth}</span>
                </div>
            `;
        }
    },

    // Show load dialog
    showLoadDialog: function() {
        const savedTrees = window.TreeConfig.storage.list();
        let options = '<option value="">Select a saved tree...</option>';
        
        savedTrees.forEach(name => {
            options += `<option value="${name}">${name}</option>`;
        });

        const dialog = `
            <div class="dialog-content">
                <h3>Load Tree</h3>
                <div class="form-group">
                    <label>Saved Trees:</label>
                    <select id="tree-select">${options}</select>
                </div>
                <div class="dialog-buttons">
                    <button onclick="TreeVisualizer.loadSelectedTree()" class="btn-primary">Load</button>
                    <button onclick="TreeVisualizer.closeDialog()" class="btn-secondary">Cancel</button>
                </div>
            </div>
        `;

        this.showDialog(dialog);
    },

    // Load selected tree from dialog
    loadSelectedTree: function() {
        const select = document.getElementById('tree-select');
        if (select && select.value) {
            const treeData = window.TreeConfig.storage.load(select.value);
            if (treeData) {
                this.loadTree(treeData);
                this.closeDialog();
            }
        }
    },

    // Show save dialog
    showSaveDialog: function() {
        if (!this.currentTree) {
            this.showMessage('No tree to save', 'error');
            return;
        }

        const dialog = `
            <div class="dialog-content">
                <h3>Save Tree</h3>
                <div class="form-group">
                    <label>Tree Name:</label>
                    <input type="text" id="tree-name" placeholder="Enter tree name..." />
                </div>
                <div class="dialog-buttons">
                    <button onclick="TreeVisualizer.saveCurrentTree()" class="btn-primary">Save</button>
                    <button onclick="TreeVisualizer.closeDialog()" class="btn-secondary">Cancel</button>
                </div>
            </div>
        `;

        this.showDialog(dialog);
    },

    // Save current tree
    saveCurrentTree: function() {
        const nameInput = document.getElementById('tree-name');
        if (nameInput && nameInput.value.trim()) {
            const success = window.TreeConfig.storage.save(this.currentTree, nameInput.value.trim());
            if (success) {
                this.showMessage('Tree saved successfully', 'success');
                this.closeDialog();
            } else {
                this.showMessage('Error saving tree', 'error');
            }
        } else {
            this.showMessage('Please enter a tree name', 'error');
        }
    },

    // Export current tree
    exportTree: function() {
        if (!this.currentTree) {
            this.showMessage('No tree to export', 'error');
            return;
        }

        const filename = `tree_${Date.now()}.json`;
        const success = window.TreeConfig.storage.export(this.currentTree, filename);
        if (success) {
            this.showMessage('Tree exported successfully', 'success');
        }
    },

    // Show import dialog
    showImportDialog: function() {
        const dialog = `
            <div class="dialog-content">
                <h3>Import Tree</h3>
                <div class="form-group">
                    <label>Select JSON File:</label>
                    <input type="file" id="tree-file-input" accept=".json" />
                </div>
                <div class="dialog-buttons">
                    <button onclick="TreeVisualizer.closeDialog()" class="btn-secondary">Cancel</button>
                </div>
            </div>
        `;

        this.showDialog(dialog);
    },

    // Handle file import
    handleFileImport: function(event) {
        const file = event.target.files[0];
        if (file) {
            window.TreeConfig.storage.import(file, (treeData) => {
                if (treeData) {
                    this.loadTree(treeData);
                    this.closeDialog();
                } else {
                    this.showMessage('Error importing tree file', 'error');
                }
            });
        }
    },

    // Create new tree
    createNewTree: function() {
        const newTree = {
            chart: {
                container: "#tree-container",
                rootOrientation: "NORTH",
                nodeAlign: "CENTER",
                levelSeparation: 40,
                siblingSeparation: 30,
                subTeeSeparation: 30,
                scrollbar: "native",
                padding: 20,
                connectors: {
                    type: "curve",
                    style: {
                        "stroke-width": 2,
                        "stroke": "#2c3e50"
                    }
                },
                node: {
                    HTMLclass: "tree-node",
                    collapsable: true
                }
            },
            nodeStructure: {
                text: { name: "New Root Node" },
                HTMLclass: "root-node"
            }
        };

        this.loadTree(newTree);
    },

    // Show add node dialog
    showAddNodeDialog: function() {
        if (!this.currentTree) {
            this.showMessage('No tree loaded', 'error');
            return;
        }

        const dialog = `
            <div class="dialog-content">
                <h3>Add Node</h3>
                <div class="form-group">
                    <label>Node Name:</label>
                    <input type="text" id="node-name" placeholder="Enter node name..." />
                </div>
                <div class="form-group">
                    <label>Parent Node:</label>
                    <input type="text" id="parent-node" placeholder="Parent node name (leave empty for root)" />
                </div>
                <div class="dialog-buttons">
                    <button onclick="TreeVisualizer.addNewNode()" class="btn-primary">Add</button>
                    <button onclick="TreeVisualizer.closeDialog()" class="btn-secondary">Cancel</button>
                </div>
            </div>
        `;

        this.showDialog(dialog);
    },

    // Add new node
    addNewNode: function() {
        const nameInput = document.getElementById('node-name');
        const parentInput = document.getElementById('parent-node');
        
        if (!nameInput || !nameInput.value.trim()) {
            this.showMessage('Please enter a node name', 'error');
            return;
        }

        // For now, just add to root level
        // More sophisticated parent node selection can be added later
        if (!this.currentTree.nodeStructure.children) {
            this.currentTree.nodeStructure.children = [];
        }

        const newNode = {
            text: { name: nameInput.value.trim() },
            HTMLclass: "child-node"
        };

        this.currentTree.nodeStructure.children.push(newNode);
        this.loadTree(this.currentTree);
        this.closeDialog();
    },

    // Show dialog
    showDialog: function(content) {
        const modal = document.getElementById('tree-modal');
        const modalContent = document.getElementById('tree-modal-content');
        
        if (modal && modalContent) {
            modalContent.innerHTML = content;
            modal.style.display = 'block';
        }
    },

    // Close dialog
    closeDialog: function() {
        const modal = document.getElementById('tree-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    // Show message
    showMessage: function(message, type = 'info') {
        const messageElement = document.getElementById('tree-message');
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.className = `message ${type}`;
            messageElement.style.display = 'block';
            
            setTimeout(() => {
                messageElement.style.display = 'none';
            }, 3000);
        }
    },

    // Test function to simulate data data (for development/testing)
    loadTestData: function() {
        const testData = [
            {
                promptId: "prompt_2023_12_01_14_30",
                filename: "prompt_2023_12_01_14_30.md",
                errorCount: 0,
                timestamp: "2023-12-01T14:30:00Z"
            },
            {
                promptId: "prompt_2023_12_01_15_45", 
                filename: "prompt_2023_12_01_15_45.md",
                errorCount: 2,
                timestamp: "2023-12-01T15:45:00Z"
            },
            {
                promptId: "prompt_2023_12_01_16_20",
                filename: "prompt_2023_12_01_16_20.md", 
                errorCount: 5,
                timestamp: "2023-12-01T16:20:00Z"
            },
            {
                promptId: "prompt_2023_12_01_17_10",
                filename: "prompt_2023_12_01_17_10.md",
                errorCount: 1,
                timestamp: "2023-12-01T17:10:00Z"
            }
        ];

        // Store test data as if it came from data
        localStorage.setItem('prompt_data', JSON.stringify(testData));
        this.promptData = testData;
        this.buildTreeFromPromptData();
        this.showMessage('Test data loaded successfully', 'success');
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for Treant to be loaded
    setTimeout(() => {
        if (typeof Treant !== 'undefined') {
            TreeVisualizer.init();
        } else {
            console.error('Treant.js not available');
        }
    }, 100);
});

console.log('Tree visualizer script loaded');