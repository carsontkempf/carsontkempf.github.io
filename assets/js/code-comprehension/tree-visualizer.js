// Initialize tree visualizer functionality
function initializeTreeVisualizerPage() {
    console.log('Initializing tree visualizer...');
    
    // API Configuration
    const API_BASE_URL = 'http://127.0.0.1:5000';
    let currentTreeData = null;
    let treeChart = null;
    
    // DOM elements
    const loadTreeBtn = document.getElementById('loadTreeBtn');
    const refreshTreeBtn = document.getElementById('refreshTreeBtn');
    const exportTreeBtn = document.getElementById('exportTreeBtn');
    const treeTypeSelect = document.getElementById('treeTypeSelect');
    const expandAllBtn = document.getElementById('expandAllBtn');
    const collapseAllBtn = document.getElementById('collapseAllBtn');
    const loadingState = document.getElementById('loadingState');
    const treeCanvas = document.getElementById('treeCanvas');
    const errorState = document.getElementById('errorState');
    const errorMessage = document.getElementById('errorMessage');
    
    // Event listeners
    loadTreeBtn.addEventListener('click', loadTreeData);
    refreshTreeBtn.addEventListener('click', refreshTree);
    exportTreeBtn.addEventListener('click', exportTree);
    treeTypeSelect.addEventListener('change', onTreeTypeChange);
    expandAllBtn.addEventListener('click', expandAll);
    collapseAllBtn.addEventListener('click', collapseAll);
    
    // Initialize
    loadTreeData();
    
    async function loadTreeData() {
        showLoadingState();
        
        try {
            const treeType = treeTypeSelect.value;
            const endpoint = getEndpointForTreeType(treeType);
            
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            currentTreeData = data;
            renderTree(data);
            
        } catch (error) {
            console.error('Error loading tree data:', error);
            showErrorState(error.message);
        }
    }
    
    function getEndpointForTreeType(type) {
        switch (type) {
            case 'refactoring':
                return '/api/v1/data/refactoring_tree';
            case 'prompt':
                return '/api/v1/data/prompts/all';
            case 'error':
                return '/api/v1/data/statistics/all';
            default:
                return '/api/v1/data/refactoring_tree';
        }
    }
    
    function renderTree(data) {
        try {
            // Clear previous tree
            treeCanvas.innerHTML = '';
            
            // Transform data for Treant.js
            const treeConfig = {
                chart: {
                    container: "#treeCanvas",
                    rootOrientation: 'NORTH',
                    nodeAlign: 'CENTER',
                    connectors: {
                        type: 'curve',
                        style: {
                            'stroke-width': 2,
                            'stroke': '#3498db'
                        }
                    },
                    node: {
                        HTMLclass: 'tree-node'
                    }
                },
                nodeStructure: transformDataForTreeant(data)
            };
            
            // Create tree chart
            treeChart = new Treant(treeConfig);
            
            showTreeState();
            
        } catch (error) {
            console.error('Error rendering tree:', error);
            showErrorState('Error rendering tree visualization');
        }
    }
    
    function transformDataForTreeant(data) {
        const treeType = treeTypeSelect.value;
        
        switch (treeType) {
            case 'refactoring':
                return transformRefactoringTree(data);
            case 'prompt':
                return transformPromptTree(data);
            case 'error':
                return transformErrorTree(data);
            default:
                return transformRefactoringTree(data);
        }
    }
    
    function transformRefactoringTree(data) {
        // Transform refactoring tree data
        return {
            text: { name: "Root", title: "Refactoring Tree" },
            HTMLclass: "tree-node",
            children: Object.entries(data || {}).map(([key, value]) => ({
                text: { name: key, title: value.title || key },
                HTMLclass: value.error ? "tree-node error" : "tree-node success",
                children: value.children ? transformChildren(value.children) : []
            }))
        };
    }
    
    function transformPromptTree(data) {
        // Transform prompt data into tree structure
        return {
            text: { name: "Prompts", title: "Prompt Catalog" },
            HTMLclass: "tree-node",
            children: Object.entries(data || {}).slice(0, 20).map(([id, prompt]) => ({
                text: { name: id, title: prompt.type || 'Unknown' },
                HTMLclass: prompt.errors > 0 ? "tree-node warning" : "tree-node success"
            }))
        };
    }
    
    function transformErrorTree(data) {
        // Transform error statistics into tree structure
        return {
            text: { name: "Errors", title: "Error Categories" },
            HTMLclass: "tree-node",
            children: [
                {
                    text: { name: "Syntax", title: "Syntax Errors" },
                    HTMLclass: "tree-node error"
                },
                {
                    text: { name: "Logic", title: "Logic Errors" },
                    HTMLclass: "tree-node warning"
                },
                {
                    text: { name: "Runtime", title: "Runtime Errors" },
                    HTMLclass: "tree-node error"
                }
            ]
        };
    }
    
    function transformChildren(children) {
        return Object.entries(children).map(([key, value]) => ({
            text: { name: key, title: value.title || key },
            HTMLclass: value.error ? "tree-node error" : "tree-node",
            children: value.children ? transformChildren(value.children) : []
        }));
    }
    
    function refreshTree() {
        loadTreeData();
    }
    
    function exportTree() {
        if (!currentTreeData) {
            alert('No tree data to export');
            return;
        }
        
        const dataStr = JSON.stringify(currentTreeData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `tree-data-${treeTypeSelect.value}-${new Date().getTime()}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
    
    function onTreeTypeChange() {
        loadTreeData();
    }
    
    function expandAll() {
        // Treant.js doesn't have built-in expand/collapse, but we can simulate it
        const nodes = document.querySelectorAll('.tree-node');
        nodes.forEach(node => {
            node.style.opacity = '1';
            node.style.display = 'block';
        });
    }
    
    function collapseAll() {
        // Simulate collapse by hiding child nodes
        const nodes = document.querySelectorAll('.tree-node');
        nodes.forEach((node, index) => {
            if (index > 0) { // Keep root visible
                node.style.opacity = '0.3';
            }
        });
    }
    
    function showLoadingState() {
        loadingState.style.display = 'flex';
        treeCanvas.style.display = 'none';
        errorState.style.display = 'none';
    }
    
    function showTreeState() {
        loadingState.style.display = 'none';
        treeCanvas.style.display = 'block';
        errorState.style.display = 'none';
    }
    
    function showErrorState(message) {
        loadingState.style.display = 'none';
        treeCanvas.style.display = 'none';
        errorState.style.display = 'block';
        errorMessage.textContent = message;
    }
}