---
layout: page
title: Code Comprehension Project
permalink: /code-comprehension-project/
---

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
</style>

<div id="pdf-interface-container">
    <div class="pdf-header">
        <h1>Code Comprehension Project</h1>
        <p>Multi-Container PDF Memory System</p>
        <div class="memory-indicator">
            <span id="currentMemoryDisplay">Performance History - Memory[0]</span>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: rgba(52,152,219,0.1); border-radius: 8px; border-left: 4px solid #3498db;">
            <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 1.1rem;">📊 Test Results Dashboard Access</h3>
            <p style="margin: 0 0 8px 0; color: #2c3e50; font-size: 0.95rem;">
                I've created accounts for both of you to view comprehensive test results using your school emails.
            </p>
            <p style="margin: 0 0 10px 0; color: #2c3e50; font-size: 0.9rem;">
                <strong>Password:</strong> <code style="background: rgba(0,0,0,0.05); padding: 2px 6px; border-radius: 3px;">Welcome12345!</code>
            </p>
            <p style="margin: 0; color: #2c3e50; font-size: 0.9rem;">
                <strong>Dashboard:</strong> <a href="https://carsontkempf.github.io/dashboard/" target="_blank" style="color: #3498db; text-decoration: none; font-weight: 500;">https://carsontkempf.github.io/dashboard/</a>
            </p>
        </div>
    </div>

    <!-- PDF Viewer -->
    <div class="pdf-viewer-container">
        <div class="viewer-header">
            <div class="viewer-title" id="viewerTitle">Performance History PDF Viewer</div>
            <div class="viewer-subtitle" id="viewerSubtitle">Select a memory slot to view PDF</div>
        </div>
        <div id="pdfViewer" class="loading">
            <div>Click any memory slot to view PDF</div>
            <div style="margin-top: 10px; font-size: 14px;">4 containers × 10 slots = 40 total memory positions</div>
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
                <div class="memory-info" id="performanceInfo">Memory[0]</div>
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
                <div class="memory-info" id="analysisInfo">Memory[0]</div>
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
                <div class="memory-info" id="comparisonInfo">Memory[0]</div>
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
                <div class="memory-info" id="breakdownInfo">Memory[0]</div>
                <button class="nav-button" id="breakdownNext" disabled>Next →</button>
            </div>
        </div>
    </div>
</div>

<script>
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
        this.currentMemoryDisplay = document.getElementById('currentMemoryDisplay');
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
            { id: 9, pdfNumber: 10, type: 'milestone', path: '/assets/pdf-memory/milestones/milestone_0010.pdf', status: 'milestone' }
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
                slot.textContent = `${i}`;
                slot.title = `${container.name} Memory[${i}] - PDF #${memoryData.pdfNumber}`;
                
                if (memoryData.type === 'milestone') {
                    slot.classList.add('milestone');
                }
                
                slot.addEventListener('click', () => this.selectMemorySlot(containerKey, i));
            } else {
                slot.textContent = `${i}`;
                slot.classList.add('empty');
                slot.title = `${container.name} Memory[${i}] - Empty`;
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
        this.updateMemoryDisplay(containerKey, index);
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

    updateMemoryDisplay(containerKey, index) {
        const container = this.containers[containerKey];
        const memoryData = container.memorySlots[index];
        
        if (memoryData) {
            const statusText = memoryData.status === 'newest' ? 'Most Recent' : 
                             memoryData.status === 'oldest' ? 'About to be Removed' :
                             memoryData.status === 'milestone' ? 'Milestone' : 'Active';
            this.currentMemoryDisplay.textContent = `${container.name} - Memory[${index}] (${statusText})`;
        }
    }

    updateContainerInfo(containerKey, index, memoryData) {
        const infoElement = document.getElementById(`${containerKey}Info`);
        const statusDescriptions = {
            'newest': 'Most Recent',
            'oldest': 'About to Remove', 
            'milestone': 'Milestone',
            'active': 'Active'
        };
        
        infoElement.textContent = `Memory[${index}] - ${statusDescriptions[memoryData.status]}`;
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

// Initialize the multi-container PDF memory interface when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MultiContainerPDFMemory();
});
</script>