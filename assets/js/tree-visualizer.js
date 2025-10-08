// Tree Visualization Manager
// Main JavaScript file for the tree visualization functionality

window.TreeVisualizer = {
    currentTree: null,
    treeInstance: null,
    isInitialized: false,

    // Initialize the tree visualizer
    init: function() {
        if (this.isInitialized) {
            console.log('Tree visualizer already initialized');
            return;
        }

        console.log('Initializing tree visualizer...');
        this.setupEventListeners();
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

    // Load default tree
    loadDefaultTree: function() {
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
            
            this.updateTreeInfo();
            this.showMessage('Tree loaded successfully', 'success');
            return true;
        } catch (error) {
            console.error('Error loading tree:', error);
            this.showMessage('Error loading tree: ' + error.message, 'error');
            return false;
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