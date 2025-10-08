// Treant.js Configuration
// Configuration file for the tree visualization

// Check if Treant is available
if (typeof Treant === 'undefined') {
    console.warn('Treant.js library not loaded');
}

// Tree visualization configuration
window.TreeConfig = {
    // Default tree structure for testing
    defaultTree: {
        chart: {
            container: "#tree-container",
            rootOrientation: "NORTH",
            nodeAlign: "CENTER",
            levelSeparation: 40,
            siblingSeparation: 30,
            subTeeSeparation: 30,
            scrollbar: "native",
            padding: 20,
            animateOnInit: true,
            animateOnInitDelay: 500,
            connectors: {
                type: "curve",
                style: {
                    "stroke-width": 2,
                    "stroke": "#2c3e50"
                }
            },
            node: {
                HTMLclass: "tree-node",
                drawLineThrough: false,
                collapsable: true
            }
        },
        nodeStructure: {
            text: { name: "Root Node" },
            HTMLclass: "root-node",
            children: [
                {
                    text: { name: "Child 1" },
                    HTMLclass: "child-node",
                    children: [
                        { text: { name: "Grandchild 1.1" }, HTMLclass: "leaf-node" },
                        { text: { name: "Grandchild 1.2" }, HTMLclass: "leaf-node" }
                    ]
                },
                {
                    text: { name: "Child 2" },
                    HTMLclass: "child-node",
                    children: [
                        { text: { name: "Grandchild 2.1" }, HTMLclass: "leaf-node" }
                    ]
                }
            ]
        }
    },

    // Storage service for JSON data
    storage: {
        // Save tree data to localStorage
        save: function(treeData, name = 'default') {
            try {
                const key = `tree_data_${name}`;
                localStorage.setItem(key, JSON.stringify(treeData));
                console.log('Tree data saved:', key);
                return true;
            } catch (error) {
                console.error('Error saving tree data:', error);
                return false;
            }
        },

        // Load tree data from localStorage
        load: function(name = 'default') {
            try {
                const key = `tree_data_${name}`;
                const data = localStorage.getItem(key);
                if (data) {
                    return JSON.parse(data);
                }
                return null;
            } catch (error) {
                console.error('Error loading tree data:', error);
                return null;
            }
        },

        // List all saved trees
        list: function() {
            const trees = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('tree_data_')) {
                    const name = key.replace('tree_data_', '');
                    trees.push(name);
                }
            }
            return trees;
        },

        // Delete a saved tree
        delete: function(name) {
            try {
                const key = `tree_data_${name}`;
                localStorage.removeItem(key);
                console.log('Tree data deleted:', key);
                return true;
            } catch (error) {
                console.error('Error deleting tree data:', error);
                return false;
            }
        },

        // Export tree data as downloadable JSON
        export: function(treeData, filename = 'tree_data.json') {
            try {
                const dataStr = JSON.stringify(treeData, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                
                const link = document.createElement('a');
                link.href = URL.createObjectURL(dataBlob);
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                console.log('Tree data exported:', filename);
                return true;
            } catch (error) {
                console.error('Error exporting tree data:', error);
                return false;
            }
        },

        // Import tree data from JSON file
        import: function(file, callback) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const treeData = JSON.parse(e.target.result);
                    callback(treeData);
                } catch (error) {
                    console.error('Error parsing JSON file:', error);
                    callback(null);
                }
            };
            reader.readAsText(file);
        }
    },

    // Utility functions
    utils: {
        // Validate tree structure
        validateTree: function(treeData) {
            if (!treeData || typeof treeData !== 'object') {
                return false;
            }
            
            // Check for required chart properties
            if (!treeData.chart || !treeData.chart.container) {
                return false;
            }
            
            // Check for nodeStructure
            if (!treeData.nodeStructure) {
                return false;
            }
            
            return true;
        },

        // Generate unique node IDs
        generateNodeId: function() {
            return 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },

        // Count total nodes in tree
        countNodes: function(nodeStructure) {
            let count = 1; // Count current node
            if (nodeStructure.children && Array.isArray(nodeStructure.children)) {
                nodeStructure.children.forEach(child => {
                    count += this.countNodes(child);
                });
            }
            return count;
        },

        // Get tree depth
        getTreeDepth: function(nodeStructure, currentDepth = 0) {
            let maxDepth = currentDepth;
            if (nodeStructure.children && Array.isArray(nodeStructure.children)) {
                nodeStructure.children.forEach(child => {
                    const childDepth = this.getTreeDepth(child, currentDepth + 1);
                    maxDepth = Math.max(maxDepth, childDepth);
                });
            }
            return maxDepth;
        }
    }
};

console.log('Treant configuration loaded');