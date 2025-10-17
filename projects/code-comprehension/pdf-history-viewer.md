---
layout: page
title: PDF History Viewer
permalink: /code-comprehension/pdf-history-viewer/
back_url: /code-comprehension/
back_text: Code Comprehension
---

<div id="auth-check-wrapper" style="display: none;">
  <div style="text-align: center; padding: 50px;">
    <h2>Access Denied</h2>
    <p>You need the "code-comprehension" role to view this page.</p>
    <button onclick="authService.login()" class="login-btn">Log In</button>
    <br><br>
    {% include widgets/navigation/back-button.html %}
  </div>
</div>

<div id="project-content-wrapper" style="display: none;">

<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

#pdf-interface-container {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    min-height: 100vh;
    padding: 20px 0;
}

.pdf-header {
    text-align: center;
    margin-bottom: 30px;
    flex-shrink: 0;
}

.pdf-header h1 {
    font-size: 2.5rem;
    font-weight: 300;
    margin-bottom: 10px;
    color: #2c3e50;
}

.pdf-header p {
    font-size: 1.1rem;
    opacity: 0.8;
    margin-bottom: 20px;
    color: #7f8c8d;
}

.memory-indicator {
    display: inline-flex;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 25px;
    padding: 10px 20px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(102,126,234,0.3);
    color: white;
}

.containers-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-bottom: 30px;
}

.pdf-container {
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    overflow: hidden;
    height: 250px;
    backdrop-filter: blur(10px);
}

.container-header {
    padding: 10px 15px;
    background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
    color: white;
    text-align: center;
    border-bottom: 1px solid rgba(255,255,255,0.1);
}

.container-title {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 3px;
}

.container-subtitle {
    font-size: 0.8rem;
    opacity: 0.8;
}

.memory-grid {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 3px;
    padding: 10px;
    flex: 1;
    background: #f8f9fa;
}

.memory-slot {
    padding: 4px 2px;
    border: 1px solid #e9ecef;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    text-align: center;
    font-size: 9px;
    font-weight: 500;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 24px;
}

.memory-slot:hover {
    background: #e3f2fd;
    border-color: #2196f3;
    transform: translateY(-1px);
}

.memory-slot.active {
    background: #e74c3c;
    border-color: #e74c3c;
    color: white;
    box-shadow: 0 2px 8px rgba(231,76,60,0.4);
}

.memory-slot.milestone {
    background: #f39c12;
    border-color: #f39c12;
    color: white;
    box-shadow: 0 2px 8px rgba(243,156,18,0.4);
}

.memory-slot.empty {
    opacity: 0.3;
    cursor: not-allowed;
}

.container-controls {
    padding: 8px 12px;
    background: #f8f9fa;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav-button {
    padding: 6px 12px;
    border: 1px solid #007bff;
    border-radius: 4px;
    background: #007bff;
    color: white;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.nav-button:hover:not(:disabled) {
    background: #0056b3;
    border-color: #0056b3;
}

.nav-button:disabled {
    background: #6c757d;
    border-color: #6c757d;
    cursor: not-allowed;
}

.memory-info {
    font-size: 11px;
    color: #6c757d;
    text-align: center;
    max-width: 120px;
    line-height: 1.2;
}

.pdf-viewer-container {
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    overflow: hidden;
    height: 70vh;
    backdrop-filter: blur(10px);
}

.viewer-header {
    padding: 15px 20px;
    background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
    color: white;
    text-align: center;
    border-bottom: 1px solid rgba(255,255,255,0.1);
}

.viewer-title {
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 5px;
}

.viewer-subtitle {
    font-size: 1rem;
    opacity: 0.9;
}

.pdf-viewer {
    flex: 1;
    width: 100%;
    height: 100%;
    border: none;
    background: white;
}

.loading {
    text-align: center;
    padding: 50px;
    color: #7f8c8d;
    font-size: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.performance-history {
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
}

.error-analysis {
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
}

.error-comparison {
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
}

.error-breakdown {
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
}

@media (max-width: 1200px) {
    .containers-grid {
        grid-template-columns: 1fr;
        gap: 15px;
    }
    
    .memory-grid {
        grid-template-columns: repeat(10, 1fr);
    }
}

@media (max-width: 768px) {
    .memory-grid {
        grid-template-columns: repeat(8, 1fr);
        gap: 2px;
        padding: 10px;
    }
    
    .memory-slot {
        font-size: 8px;
        padding: 4px 2px;
        min-height: 24px;
    }
}

.navigation-links {
    text-align: center;
    margin-bottom: 30px;
    padding: 20px;
    background: rgba(52,152,219,0.1);
    border-radius: 8px;
    border-left: 4px solid #3498db;
}

.navigation-links h3 {
    margin: 0 0 15px 0;
    color: #2c3e50;
    font-size: 1.1rem;
}

.nav-link-btn {
    display: inline-block;
    margin: 0 10px;
    padding: 10px 20px;
    background: #3498db;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.nav-link-btn:hover {
    background: #2980b9;
    transform: translateY(-1px);
    text-decoration: none;
    color: white;
}

/* Circular Node System Styles */
.node-system-container {
    margin-bottom: 40px;
    padding: 30px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
}

.node-system-header {
    text-align: center;
    margin-bottom: 30px;
    color: white;
}

.node-system-header h2 {
    font-size: 1.8rem;
    font-weight: 300;
    margin-bottom: 8px;
}

.node-system-header p {
    font-size: 1rem;
    opacity: 0.9;
}

.circular-node-layout {
    position: relative;
    width: 400px;
    height: 400px;
    margin: 0 auto 30px;
}

.node-circle {
    position: absolute;
    width: 80px;
    height: 80px;
}

.node-circle[data-node="1"] {
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
}

.node-circle[data-node="2"] {
    top: 80px;
    right: 40px;
}

.node-circle[data-node="3"] {
    bottom: 80px;
    right: 40px;
}

.node-circle[data-node="4"] {
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
}

.node-circle[data-node="5"] {
    top: 80px;
    left: 40px;
}

.node-button {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    border: 3px solid #e9ecef;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    position: relative;
}

.node-button:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 25px rgba(0,0,0,0.2);
    border-color: #3498db;
}

.node-button.active {
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
    color: white;
    border-color: #2980b9;
}

.node-button.completed {
    background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
    color: white;
    border-color: #27ae60;
}

.node-button.error {
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    color: white;
    border-color: #e74c3c;
}

.node-number {
    font-size: 1.4rem;
    font-weight: 700;
    line-height: 1;
}

.node-label {
    font-size: 0.7rem;
    font-weight: 500;
    text-align: center;
    line-height: 1.1;
    margin-top: 2px;
}

.node-status {
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.7);
    color: white;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 0.7rem;
    font-weight: 500;
    white-space: nowrap;
}

.node-status.pending {
    background: rgba(149,165,166,0.9);
}

.node-status.processing {
    background: rgba(243,156,18,0.9);
}

.node-status.completed {
    background: rgba(39,174,96,0.9);
}

.node-status.error {
    background: rgba(231,76,60,0.9);
}

/* Circular Flow Arrows */
.flow-arrow {
    position: absolute;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.flow-arrow::before {
    content: '→';
    color: white;
    font-size: 1.2rem;
    font-weight: bold;
}

.flow-arrow:hover {
    transform: scale(1.2);
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.arrow-1-2 {
    top: 60px;
    right: 100px;
    transform: rotate(35deg);
}

.arrow-2-3 {
    bottom: 140px;
    right: 70px;
    transform: rotate(105deg);
}

.arrow-3-4 {
    bottom: 60px;
    right: 100px;
    transform: rotate(215deg);
}

.arrow-4-5 {
    bottom: 140px;
    left: 70px;
    transform: rotate(285deg);
}

.arrow-5-1 {
    top: 60px;
    left: 100px;
    transform: rotate(325deg);
}

.node-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
}

.control-btn {
    padding: 10px 20px;
    border: 2px solid white;
    border-radius: 25px;
    background: rgba(255,255,255,0.1);
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
}

.control-btn:hover {
    background: white;
    color: #667eea;
    transform: translateY(-2px);
}

.system-status {
    color: white;
    font-weight: 600;
    background: rgba(255,255,255,0.1);
    padding: 8px 16px;
    border-radius: 20px;
    backdrop-filter: blur(10px);
}

@media (max-width: 768px) {
    .circular-node-layout {
        width: 300px;
        height: 300px;
    }
    
    .node-circle {
        width: 60px;
        height: 60px;
    }
    
    .node-button {
        width: 60px;
        height: 60px;
    }
    
    .node-number {
        font-size: 1.1rem;
    }
    
    .node-label {
        font-size: 0.6rem;
    }
    
    .flow-arrow {
        width: 25px;
        height: 25px;
    }
}
</style>

<div id="pdf-interface-container">
    <div class="pdf-header">
        <h1>PDF History Viewer</h1>
        <p>Multi-Container PDF Memory System</p>
    </div>

    <!-- Circular Node System -->
    <div class="node-system-container">
        <div class="node-system-header">
            <h2>5-Node Processing System</h2>
            <p>Circular data flow for code comprehension analysis</p>
        </div>
        
        <div class="circular-node-layout">
            <div class="node-circle" data-node="1">
                <div class="node-button" id="node-1">
                    <span class="node-number">1</span>
                    <span class="node-label">Baseline Ingestion</span>
                </div>
                <div class="node-status" id="status-1">pending</div>
            </div>
            
            <div class="node-circle" data-node="2">
                <div class="node-button" id="node-2">
                    <span class="node-number">2</span>
                    <span class="node-label">Model Router</span>
                </div>
                <div class="node-status" id="status-2">pending</div>
            </div>
            
            <div class="node-circle" data-node="3">
                <div class="node-button" id="node-3">
                    <span class="node-number">3</span>
                    <span class="node-label">Strategy Prediction</span>
                </div>
                <div class="node-status" id="status-3">pending</div>
            </div>
            
            <div class="node-circle" data-node="4">
                <div class="node-button" id="node-4">
                    <span class="node-number">4</span>
                    <span class="node-label">Targeted Execution</span>
                </div>
                <div class="node-status" id="status-4">pending</div>
            </div>
            
            <div class="node-circle" data-node="5">
                <div class="node-button" id="node-5">
                    <span class="node-number">5</span>
                    <span class="node-label">Measurement Learning</span>
                </div>
                <div class="node-status" id="status-5">pending</div>
            </div>
            
            <!-- Circular Arrows -->
            <div class="flow-arrow arrow-1-2"></div>
            <div class="flow-arrow arrow-2-3"></div>
            <div class="flow-arrow arrow-3-4"></div>
            <div class="flow-arrow arrow-4-5"></div>
            <div class="flow-arrow arrow-5-1"></div>
        </div>
        
        <div class="node-controls">
            <button class="control-btn" id="refresh-nodes">Refresh Status</button>
            <button class="control-btn" id="reset-nodes">Reset System</button>
            <div class="system-status" id="system-status">System: Operational</div>
        </div>
    </div>

    <!-- PDF Viewer -->
    <div class="pdf-viewer-container">
        <div class="viewer-header">
            <div class="viewer-title" id="viewerTitle">Performance History PDF Viewer</div>
            <div class="viewer-subtitle" id="viewerSubtitle">Select a PDF slot to view document</div>
        </div>
        <div id="pdfViewer" class="loading">
            <div>Click any PDF slot to view document</div>
            <div style="margin-top: 10px; font-size: 14px;">4 containers × 10 slots = 40 total PDF positions</div>
        </div>
    </div>

    <div class="containers-grid">
        <!-- Performance History Container -->
        <div class="pdf-container" data-container="performance">
            <div class="container-header performance-history">
                <div class="container-title">Performance History</div>
                <div class="container-subtitle">10 Memory Slots</div>
            </div>
            <div class="memory-grid" id="performanceGrid">
                <!-- Memory slots generated by JavaScript -->
            </div>
            <div class="container-controls">
                <button class="nav-button" id="performancePrev" disabled>← Prev</button>
                <div class="memory-info" id="performanceInfo">PDF #1</div>
                <button class="nav-button" id="performanceNext" disabled>Next →</button>
            </div>
        </div>

        <!-- Error Analysis Container -->
        <div class="pdf-container" data-container="analysis">
            <div class="container-header error-analysis">
                <div class="container-title">Error Analysis Overview</div>
                <div class="container-subtitle">10 Memory Slots</div>
            </div>
            <div class="memory-grid" id="analysisGrid">
                <!-- Memory slots generated by JavaScript -->
            </div>
            <div class="container-controls">
                <button class="nav-button" id="analysisPrev" disabled>← Prev</button>
                <div class="memory-info" id="analysisInfo">PDF #1</div>
                <button class="nav-button" id="analysisNext" disabled>Next →</button>
            </div>
        </div>

        <!-- Error Comparison Container -->
        <div class="pdf-container" data-container="comparison">
            <div class="container-header error-comparison">
                <div class="container-title">Error Comparison</div>
                <div class="container-subtitle">10 Memory Slots</div>
            </div>
            <div class="memory-grid" id="comparisonGrid">
                <!-- Memory slots generated by JavaScript -->
            </div>
            <div class="container-controls">
                <button class="nav-button" id="comparisonPrev" disabled>← Prev</button>
                <div class="memory-info" id="comparisonInfo">PDF #1</div>
                <button class="nav-button" id="comparisonNext" disabled>Next →</button>
            </div>
        </div>

        <!-- Error Breakdown Container -->
        <div class="pdf-container" data-container="breakdown">
            <div class="container-header error-breakdown">
                <div class="container-title">Error Subcategory Breakdown</div>
                <div class="container-subtitle">10 Memory Slots</div>
            </div>
            <div class="memory-grid" id="breakdownGrid">
                <!-- Memory slots generated by JavaScript -->
            </div>
            <div class="container-controls">
                <button class="nav-button" id="breakdownPrev" disabled>← Prev</button>
                <div class="memory-info" id="breakdownInfo">PDF #1</div>
                <button class="nav-button" id="breakdownNext" disabled>Next →</button>
            </div>
        </div>
    </div>
</div>

<script>
class CircularNodeSystem {
    constructor() {
        this.API_BASE_URL = 'http://131.151.90.18:5001';
        this.nodes = {
            1: { name: 'Baseline Ingestion', status: 'pending' },
            2: { name: 'Model Router', status: 'pending' },
            3: { name: 'Strategy Prediction', status: 'pending' },
            4: { name: 'Targeted Execution', status: 'pending' },
            5: { name: 'Measurement Learning', status: 'pending' }
        };
        this.initializeNodeSystem();
        this.refreshNodeStatus();
    }

    initializeNodeSystem() {
        // Setup node button event listeners
        for (let i = 1; i <= 5; i++) {
            const nodeButton = document.getElementById(`node-${i}`);
            if (nodeButton) {
                nodeButton.addEventListener('click', () => this.selectNode(i));
            }
        }

        // Setup control buttons
        const refreshBtn = document.getElementById('refresh-nodes');
        const resetBtn = document.getElementById('reset-nodes');
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshNodeStatus());
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetNodeSystem());
        }

        // Setup flow arrows
        document.querySelectorAll('.flow-arrow').forEach(arrow => {
            arrow.addEventListener('click', (e) => {
                this.animateDataFlow(e.target);
            });
        });
    }

    async refreshNodeStatus() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/api/v1/node/status`);
            const data = await response.json();
            
            if (data.nodes) {
                Object.keys(data.nodes).forEach(nodeKey => {
                    const nodeNum = nodeKey.replace('node_', '');
                    const nodeData = data.nodes[nodeKey];
                    this.updateNodeStatus(nodeNum, nodeData.status, nodeData);
                });
            }

            // Update system status
            const systemStatus = document.getElementById('system-status');
            if (systemStatus) {
                systemStatus.textContent = `System: ${data.system_status || 'Unknown'}`;
            }

        } catch (error) {
            console.error('Error refreshing node status:', error);
            this.updateSystemStatus('Connection Error');
        }
    }

    updateNodeStatus(nodeNumber, status, nodeData) {
        const nodeButton = document.getElementById(`node-${nodeNumber}`);
        const statusElement = document.getElementById(`status-${nodeNumber}`);
        
        if (nodeButton && statusElement) {
            // Remove existing status classes
            nodeButton.classList.remove('pending', 'processing', 'completed', 'error');
            statusElement.classList.remove('pending', 'processing', 'completed', 'error');
            
            // Determine status based on node data
            let displayStatus = status;
            let statusClass = status;
            
            if (nodeData) {
                if (nodeData.has_input && nodeData.has_output) {
                    displayStatus = 'completed';
                    statusClass = 'completed';
                } else if (nodeData.has_input) {
                    displayStatus = 'processing';
                    statusClass = 'processing';
                } else {
                    displayStatus = 'pending';
                    statusClass = 'pending';
                }
            }
            
            // Apply new status
            nodeButton.classList.add(statusClass);
            statusElement.classList.add(statusClass);
            statusElement.textContent = displayStatus;
            
            // Update internal state
            this.nodes[nodeNumber].status = displayStatus;
        }
    }

    async selectNode(nodeNumber) {
        try {
            // Clear previous active states
            document.querySelectorAll('.node-button').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Set active state
            const nodeButton = document.getElementById(`node-${nodeNumber}`);
            if (nodeButton) {
                nodeButton.classList.add('active');
            }

            // Fetch node output data
            const response = await fetch(`${this.API_BASE_URL}/api/v1/node/${nodeNumber}/output`);
            const nodeData = await response.json();
            
            console.log(`Node ${nodeNumber} data:`, nodeData);
            
            // Show node details (you can expand this to show in a modal or sidebar)
            this.showNodeDetails(nodeNumber, nodeData);
            
        } catch (error) {
            console.error(`Error selecting node ${nodeNumber}:`, error);
        }
    }

    showNodeDetails(nodeNumber, nodeData) {
        // Create a simple alert for now - could be expanded to a modal
        const nodeName = this.nodes[nodeNumber].name;
        const details = `Node ${nodeNumber}: ${nodeName}\nStatus: ${nodeData.status}\nTimestamp: ${nodeData.timestamp}`;
        
        // You could replace this with a proper modal or details panel
        console.log('Node Details:', details);
        
        // Update page title to show selected node
        const viewerTitle = document.getElementById('viewerTitle');
        if (viewerTitle) {
            viewerTitle.textContent = `${nodeName} - Details`;
        }
    }

    async resetNodeSystem() {
        if (confirm('Are you sure you want to reset the entire node system? This will clear all data.')) {
            try {
                const response = await fetch(`${this.API_BASE_URL}/api/v1/node/reset`, {
                    method: 'POST'
                });
                const result = await response.json();
                
                if (result.status === 'reset_complete') {
                    // Reset UI to initial state
                    for (let i = 1; i <= 5; i++) {
                        this.updateNodeStatus(i, 'pending', null);
                    }
                    
                    this.updateSystemStatus('Reset Complete');
                    console.log('Node system reset successfully');
                } else {
                    throw new Error('Reset failed');
                }
                
            } catch (error) {
                console.error('Error resetting node system:', error);
                this.updateSystemStatus('Reset Failed');
            }
        }
    }

    animateDataFlow(arrowElement) {
        // Add animation class
        arrowElement.style.transform += ' scale(1.5)';
        arrowElement.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
        
        setTimeout(() => {
            arrowElement.style.transform = arrowElement.style.transform.replace(' scale(1.5)', '');
            arrowElement.style.background = 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)';
        }, 300);
    }

    updateSystemStatus(status) {
        const systemStatus = document.getElementById('system-status');
        if (systemStatus) {
            systemStatus.textContent = `System: ${status}`;
        }
    }
}

class MultiContainerPDFMemory {
    constructor() {
        this.containers = {
            performance: {
                name: 'Performance History',
                memorySlots: [],
                currentIndex: 0,
                maxSlots: 10
            },
            analysis: {
                name: 'Error Analysis',
                memorySlots: [],
                currentIndex: 0,
                maxSlots: 10
            },
            comparison: {
                name: 'Error Comparison',
                memorySlots: [],
                currentIndex: 0,
                maxSlots: 10
            },
            breakdown: {
                name: 'Error Breakdown',
                memorySlots: [],
                currentIndex: 0,
                maxSlots: 10
            }
        };
        
        this.currentContainer = 'performance';
        this.initializeElements();
        this.loadAllMemoryStates();
        this.setupEventListeners();
    }

    initializeElements() {
        this.pdfViewer = document.getElementById('pdfViewer');
        this.viewerTitle = document.getElementById('viewerTitle');
        this.viewerSubtitle = document.getElementById('viewerSubtitle');
    }

    async loadAllMemoryStates() {
        // Performance History Memory - existing data
        this.containers.performance.memorySlots = [
            { id: 0, pdfNumber: 11, type: 'queue', path: '/assets/pdf-memory/queue/queue_0011.pdf', status: 'newest' },
            { id: 1, pdfNumber: 9, type: 'queue', path: '/assets/pdf-memory/queue/queue_0009.pdf', status: 'active' },
            { id: 2, pdfNumber: 8, type: 'queue', path: '/assets/pdf-memory/queue/queue_0008.pdf', status: 'active' },
            { id: 3, pdfNumber: 7, type: 'queue', path: '/assets/pdf-memory/queue/queue_0007.pdf', status: 'active' },
            { id: 4, pdfNumber: 6, type: 'queue', path: '/assets/pdf-memory/queue/queue_0006.pdf', status: 'active' },
            { id: 5, pdfNumber: 5, type: 'queue', path: '/assets/pdf-memory/queue/queue_0005.pdf', status: 'active' },
            { id: 6, pdfNumber: 4, type: 'queue', path: '/assets/pdf-memory/queue/queue_0004.pdf', status: 'active' },
            { id: 7, pdfNumber: 3, type: 'queue', path: '/assets/pdf-memory/queue/queue_0003.pdf', status: 'active' },
            { id: 8, pdfNumber: 2, type: 'queue', path: '/assets/pdf-memory/queue/queue_0002.pdf', status: 'oldest' },
        ];

        // Error Analysis Memory - using existing PDFs
        this.containers.analysis.memorySlots = [
            { id: 0, pdfNumber: 3, type: 'queue', path: '/assets/pdf-memory/error_analysis_overview_versions/v001_9c723b1b_2025-09-25.pdf', status: 'newest' },
            { id: 1, pdfNumber: 2, type: 'queue', path: '/assets/pdf-memory/error_analysis_overview_versions/v002_b59a8eda_2025-09-25.pdf', status: 'active' },
            { id: 2, pdfNumber: 1, type: 'queue', path: '/assets/pdf-memory/error_analysis_overview_versions/v003_abe0cc20_2025-09-25.pdf', status: 'oldest' }
        ];

        // Error Comparison Memory - using existing PDFs
        this.containers.comparison.memorySlots = [
            { id: 0, pdfNumber: 3, type: 'queue', path: '/assets/pdf-memory/error_comparison_versions/v001_9c723b1b_2025-09-25.pdf', status: 'newest' },
            { id: 1, pdfNumber: 2, type: 'queue', path: '/assets/pdf-memory/error_comparison_versions/v002_b59a8eda_2025-09-25.pdf', status: 'active' },
            { id: 2, pdfNumber: 1, type: 'queue', path: '/assets/pdf-memory/error_comparison_versions/v003_abe0cc20_2025-09-25.pdf', status: 'oldest' }
        ];

        // Error Breakdown Memory - using existing PDFs
        this.containers.breakdown.memorySlots = [
            { id: 0, pdfNumber: 3, type: 'queue', path: '/assets/pdf-memory/error_subcategory_breakdown_versions/v001_9c723b1b_2025-09-25.pdf', status: 'newest' },
            { id: 1, pdfNumber: 2, type: 'queue', path: '/assets/pdf-memory/error_subcategory_breakdown_versions/v002_b59a8eda_2025-09-25.pdf', status: 'active' },
            { id: 2, pdfNumber: 1, type: 'queue', path: '/assets/pdf-memory/error_subcategory_breakdown_versions/v003_abe0cc20_2025-09-25.pdf', status: 'oldest' }
        ];

        this.generateAllMemoryGrids();
        this.loadMostRecent();
    }

    generateAllMemoryGrids() {
        Object.keys(this.containers).forEach(containerKey => {
            this.generateMemoryGrid(containerKey);
        });
    }

    generateMemoryGrid(containerKey) {
        const container = this.containers[containerKey];
        const grid = document.getElementById(`${containerKey}Grid`);
        
        grid.innerHTML = '';
        
        for (let i = 0; i < container.maxSlots; i++) {
            const slot = document.createElement('div');
            slot.className = 'memory-slot';
            slot.dataset.container = containerKey;
            slot.dataset.memoryIndex = i;
            
            const memoryData = container.memorySlots[i];
            
            if (memoryData) {
                slot.textContent = `${i + 1}`;
                slot.title = `${container.name} PDF #${memoryData.pdfNumber}`;
                
                if (memoryData.type === 'milestone') {
                    slot.classList.add('milestone');
                }
                
                slot.addEventListener('click', () => this.selectMemorySlot(containerKey, i));
            } else {
                slot.textContent = `${i + 1}`;
                slot.classList.add('empty');
                slot.title = `${container.name} PDF #${i + 1} - Empty`;
            }
            
            grid.appendChild(slot);
        }
    }

    selectMemorySlot(containerKey, index) {
        const container = this.containers[containerKey];
        const memoryData = container.memorySlots[index];
        if (!memoryData) return;

        // Update current state
        this.currentContainer = containerKey;
        container.currentIndex = index;

        // Update UI
        this.updateActiveSlot(containerKey, index);
        this.loadPDF(containerKey, memoryData);
        this.updateNavigationButtons(containerKey);
        this.updateContainerInfo(containerKey, index, memoryData);
    }

    updateActiveSlot(containerKey, index) {
        // Clear all active slots
        document.querySelectorAll('.memory-slot').forEach(slot => {
            slot.classList.remove('active');
        });
        
        // Set new active slot
        const activeSlot = document.querySelector(`[data-container="${containerKey}"][data-memory-index="${index}"]`);
        if (activeSlot) {
            activeSlot.classList.add('active');
        }
    }

    loadMostRecent() {
        // Load Performance History Memory[0] by default
        this.selectMemorySlot('performance', 0);
    }

    loadPDF(containerKey, memoryData) {
        const container = this.containers[containerKey];
        
        this.viewerTitle.textContent = `${container.name} PDF Viewer`;
        this.viewerSubtitle.textContent = `PDF #${memoryData.pdfNumber} - ${memoryData.status}`;
        
        // Load the PDF
        this.pdfViewer.innerHTML = `
            <iframe class="pdf-viewer" 
                    src="${memoryData.path}" 
                    type="application/pdf">
                <p>Your browser does not support PDF viewing. 
                   <a href="${memoryData.path}" target="_blank">Click here to download PDF #${memoryData.pdfNumber}</a>
                </p>
            </iframe>
        `;
    }

    updateNavigationButtons(containerKey) {
        const container = this.containers[containerKey];
        const prevBtn = document.getElementById(`${containerKey}Prev`);
        const nextBtn = document.getElementById(`${containerKey}Next`);
        
        // Find previous available memory slot
        let prevIndex = -1;
        for (let i = container.currentIndex - 1; i >= 0; i--) {
            if (container.memorySlots[i]) {
                prevIndex = i;
                break;
            }
        }

        // Find next available memory slot
        let nextIndex = -1;
        for (let i = container.currentIndex + 1; i < container.maxSlots; i++) {
            if (container.memorySlots[i]) {
                nextIndex = i;
                break;
            }
        }

        prevBtn.disabled = prevIndex === -1;
        nextBtn.disabled = nextIndex === -1;
    }

    updateContainerInfo(containerKey, index, memoryData) {
        const infoElement = document.getElementById(`${containerKey}Info`);
        const statusDescriptions = {
            'newest': 'Most Recent',
            'oldest': 'About to Remove', 
            'milestone': 'Milestone',
            'active': 'Active'
        };
        
        infoElement.textContent = `PDF #${index + 1} - ${statusDescriptions[memoryData.status]}`;
    }

    navigateMemory(containerKey, direction) {
        const container = this.containers[containerKey];
        const currentIndex = container.currentIndex;
        let targetIndex = -1;

        if (direction === -1) {
            // Previous
            for (let i = currentIndex - 1; i >= 0; i--) {
                if (container.memorySlots[i]) {
                    targetIndex = i;
                    break;
                }
            }
        } else {
            // Next
            for (let i = currentIndex + 1; i < container.maxSlots; i++) {
                if (container.memorySlots[i]) {
                    targetIndex = i;
                    break;
                }
            }
        }

        if (targetIndex !== -1) {
            this.selectMemorySlot(containerKey, targetIndex);
        }
    }

    setupEventListeners() {
        // Setup navigation buttons for each container
        Object.keys(this.containers).forEach(containerKey => {
            const prevBtn = document.getElementById(`${containerKey}Prev`);
            const nextBtn = document.getElementById(`${containerKey}Next`);
            
            prevBtn.addEventListener('click', () => {
                this.navigateMemory(containerKey, -1);
            });

            nextBtn.addEventListener('click', () => {
                this.navigateMemory(containerKey, 1);
            });
        });

        // Global keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.navigateMemory(this.currentContainer, -1);
            } else if (e.key === 'ArrowRight') {
                this.navigateMemory(this.currentContainer, 1);
            } else if (e.key >= '0' && e.key <= '9') {
                const index = parseInt(e.key);
                const container = this.containers[this.currentContainer];
                if (container.memorySlots[index]) {
                    this.selectMemorySlot(this.currentContainer, index);
                }
            }
        });
    }
}

// Initialize both systems when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CircularNodeSystem();
    new MultiContainerPDFMemory();
});
</script>

</div>

<script>
console.log('PDF History Viewer - Script loaded');

document.addEventListener('authReady', () => {
    console.log('PDF History Viewer - authReady event fired');
    if (window.authService.isAuthenticated) {
        const user = window.authService.user;
        
        // Check user roles in multiple possible locations
        const customRoles = user['https://carsontkempf.github.io/roles'] || [];
        const auth0Roles = user['https://auth0.com/roles'] || [];
        const appMetadataRoles = user.app_metadata?.roles || [];
        const userMetadataRoles = user.user_metadata?.roles || [];
        
        // Check additional possible role locations
        const rolesArray = user.roles || [];
        const authorizationRoles = user.authorization?.roles || [];
        const orgRoles = user['org_roles'] || [];
        const realmRoles = user['realm_roles'] || [];
        
        // Combine all possible role sources
        const allRoles = [...customRoles, ...auth0Roles, ...appMetadataRoles, ...userMetadataRoles, ...rolesArray, ...authorizationRoles, ...orgRoles, ...realmRoles];
        
        // Debug: Log user info and roles for troubleshooting
        console.log('PDF History Viewer - User Debug Info:', {
            user: user,
            userKeys: Object.keys(user),
            customRoles: customRoles,
            auth0Roles: auth0Roles,
            appMetadataRoles: appMetadataRoles,
            userMetadataRoles: userMetadataRoles,
            rolesArray: rolesArray,
            authorizationRoles: authorizationRoles,
            orgRoles: orgRoles,
            realmRoles: realmRoles,
            allRoles: allRoles,
            userEmail: user.email,
            userSub: user.sub
        });
        
        // Additional debug for all custom claim keys
        const customClaimKeys = Object.keys(user).filter(key => key.includes('://'));
        console.log('Custom claim keys found:', customClaimKeys);
        customClaimKeys.forEach(key => {
            console.log(`${key}:`, user[key]);
        });
        
        const hasAdminRole = allRoles.includes('admin');
        const hasCodeComprehensionRole = allRoles.includes('code-comprehension') || 
                                        allRoles.includes('Code-Comprehension-Project') || 
                                        allRoles.includes('rol_XUUh9ZOhirY2yCQQ');
        const isSiteOwner = user.email === 'ctkfdp@umsystem.edu';
        
        // Check if user has any of the required permissions
        if (hasAdminRole || hasCodeComprehensionRole || isSiteOwner) {
            document.getElementById('project-content-wrapper').style.display = 'block';
        } else {
            document.getElementById('auth-check-wrapper').style.display = 'block';
        }
    } else {
        console.log('PDF History Viewer - User not authenticated');
        document.getElementById('auth-check-wrapper').style.display = 'block';
    }
});

console.log('PDF History Viewer - Setting up timeout fallback');

// If auth service isn't ready after 5 seconds, show access denied
setTimeout(() => {
    console.log('PDF History Viewer - Timeout check - authService available:', !!window.authService);
    console.log('PDF History Viewer - Timeout check - isAuthenticated:', window.authService?.isAuthenticated);
    if (!window.authService || !window.authService.isAuthenticated) {
        console.log('PDF History Viewer - Timeout triggered, showing access denied');
        document.getElementById('auth-check-wrapper').style.display = 'block';
    }
}, 5000);
</script>