/**
 * Code Comprehension Project - API Status and Loading Integration
 * Handles API connectivity status display and loading states
 */

class CodeComprehensionLoader {
    constructor() {
        this.apiTracker = window.apiTracker;
        this.statusOverlay = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the loader system
     */
    init() {
        if (this.isInitialized) return;
        
        console.log('🚀 Initializing Code Comprehension Loader...');
        
        // Always use inline progress bars now
        this.createStatusOverlay();
        this.showLoadingState();
        
        // Listen for API check events
        this.setupEventListeners();
        
        this.isInitialized = true;
    }

    /**
     * Create the inline progress section for all pages
     */
    createStatusOverlay() {
        // Create inline progress section instead of overlay popup
        this.statusOverlay = document.createElement('div');
        this.statusOverlay.id = 'api-progress-section';
        this.statusOverlay.className = 'api-progress-section';
        this.statusOverlay.innerHTML = `
            <div class="progress-title">
                <span>🔗</span>
                <span>Connecting to Flask Backend APIs</span>
            </div>
            <div class="progress-bars-container">
                <div class="progress-item" data-endpoint="/api/v1/simulation/state">
                    <div class="progress-label">/simulation/state</div>
                    <div class="progress-bar">
                        <div class="progress-fill checking"></div>
                    </div>
                    <div class="progress-status">Checking<span class="loading-dots"></span></div>
                </div>
                <div class="progress-item" data-endpoint="/api/v1/data/prompts/all">
                    <div class="progress-label">/data/prompts/all</div>
                    <div class="progress-bar">
                        <div class="progress-fill checking"></div>
                    </div>
                    <div class="progress-status">Checking<span class="loading-dots"></span></div>
                </div>
                <div class="progress-item" data-endpoint="/api/v1/config/variables/all">
                    <div class="progress-label">/config/variables/all</div>
                    <div class="progress-bar">
                        <div class="progress-fill checking"></div>
                    </div>
                    <div class="progress-status">Checking<span class="loading-dots"></span></div>
                </div>
            </div>
        `;
        
        // Insert at the top of the main content area
        const mainContent = document.querySelector('.main-content') || document.querySelector('main') || document.body;
        mainContent.insertBefore(this.statusOverlay, mainContent.firstChild);
        
        // Add the CSS styles
        this.addProgressStyles();
    }

    /**
     * Add CSS styles for the progress section
     */
    addProgressStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .api-progress-section {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 16px;
                padding: 25px;
                margin: 0 0 30px 0;
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
                color: white;
                overflow: hidden;
                transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                transform-origin: top;
            }

            .api-progress-section.shrinking {
                max-height: 0;
                padding-top: 0;
                padding-bottom: 0;
                margin-bottom: 0;
                opacity: 0;
                transform: scaleY(0);
            }

            .progress-title {
                text-align: center;
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 25px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }

            .progress-title span:first-child {
                font-size: 24px;
            }

            .progress-bars-container {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .progress-item {
                display: grid;
                grid-template-columns: 200px 1fr 120px;
                align-items: center;
                gap: 15px;
                padding: 15px 20px;
                background: rgba(255, 255, 255, 0.15);
                border-radius: 12px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                transition: all 0.5s ease;
            }

            .progress-item.connected {
                background: rgba(39, 174, 96, 0.3);
                border-color: rgba(39, 174, 96, 0.5);
                box-shadow: 0 0 20px rgba(39, 174, 96, 0.3);
            }

            .progress-item.failed {
                background: rgba(231, 76, 60, 0.3);
                border-color: rgba(231, 76, 60, 0.5);
                box-shadow: 0 0 20px rgba(231, 76, 60, 0.3);
            }

            .progress-item.timeout {
                background: rgba(243, 156, 18, 0.3);
                border-color: rgba(243, 156, 18, 0.5);
                box-shadow: 0 0 20px rgba(243, 156, 18, 0.3);
            }

            .progress-label {
                font-family: 'Monaco', 'Menlo', monospace;
                font-weight: 600;
                font-size: 14px;
                color: white;
            }

            .progress-bar {
                height: 8px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                overflow: hidden;
                position: relative;
            }

            .progress-fill {
                height: 100%;
                width: 0%;
                border-radius: 4px;
                transition: all 0.5s ease;
                position: relative;
                overflow: hidden;
            }

            .progress-fill.checking {
                background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite ease-in-out;
                width: 100%;
            }

            .progress-fill.connected {
                background: linear-gradient(90deg, #27ae60, #2ecc71);
                width: 100% !important;
            }

            .progress-fill.failed {
                background: linear-gradient(90deg, #e74c3c, #c0392b);
                width: 100% !important;
            }

            .progress-fill.timeout {
                background: linear-gradient(90deg, #f39c12, #e67e22);
                width: 100% !important;
            }

            @keyframes shimmer {
                0% { background-position: 200% 0%; }
                100% { background-position: -200% 0%; }
            }

            .progress-status {
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                text-align: center;
                letter-spacing: 0.5px;
                color: rgba(255, 255, 255, 0.9);
            }

            .progress-status.connected {
                color: #2ecc71;
            }

            .progress-status.failed {
                color: #e74c3c;
            }

            .progress-status.timeout {
                color: #f39c12;
            }

            .loading-dots {
                display: inline-block;
            }

            .loading-dots:after {
                content: "";
                animation: loading-dots 1.5s infinite;
            }

            @keyframes loading-dots {
                0%, 20% { content: ""; }
                40% { content: "."; }
                60% { content: ".."; }
                80%, 100% { content: "..."; }
            }

            @media (max-width: 768px) {
                .progress-item {
                    grid-template-columns: 1fr;
                    gap: 10px;
                    text-align: center;
                }
                
                .progress-label {
                    font-size: 12px;
                }
                
                .progress-title {
                    font-size: 18px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Setup event listeners for API check progress
     */
    setupEventListeners() {
        // Listen for API check progress
        window.addEventListener('apiCheckProgress', (event) => {
            this.updateProgress(event.detail);
        });

        // Listen for API check completion
        window.addEventListener('apiCheckComplete', (event) => {
            this.handleCheckComplete(event.detail);
        });
    }


    /**
     * Show the loading state
     */
    showLoadingState() {
        if (this.statusOverlay) {
            this.statusOverlay.classList.add('show');
        }
    }

    /**
     * Hide the loading state
     */
    hideLoadingState() {
        if (this.statusOverlay) {
            this.shrinkProgressSection();
        }
    }

    /**
     * Shrink the progress section and move page content up
     */
    shrinkProgressSection() {
        console.log('📦 Shrinking progress section...');
        
        if (this.statusOverlay) {
            this.statusOverlay.classList.add('shrinking');
            
            // Remove the element after animation completes
            setTimeout(() => {
                if (this.statusOverlay && this.statusOverlay.parentNode) {
                    this.statusOverlay.style.display = 'none';
                }
            }, 800);
        }
    }

    /**
     * Update progress display
     */
    updateProgress(detail) {
        const { status } = detail;
        this.updateInlineProgress(status);
    }

    /**
     * Update inline progress bars
     */
    updateInlineProgress(status) {
        status.forEach((statusInfo, endpoint) => {
            const progressItem = this.statusOverlay?.querySelector(`[data-endpoint="${endpoint}"]`);
            if (progressItem) {
                const progressFill = progressItem.querySelector('.progress-fill');
                const progressStatus = progressItem.querySelector('.progress-status');
                
                // Update progress item class
                progressItem.className = `progress-item ${statusInfo.status}`;
                
                // Update progress fill
                if (progressFill) {
                    progressFill.className = `progress-fill ${statusInfo.status}`;
                }
                
                // Update status text
                if (progressStatus) {
                    progressStatus.className = `progress-status ${statusInfo.status}`;
                    switch (statusInfo.status) {
                        case 'connected':
                            progressStatus.textContent = 'Connected';
                            break;
                        case 'failed':
                            progressStatus.textContent = 'Failed';
                            break;
                        case 'timeout':
                            progressStatus.textContent = 'Timeout';
                            break;
                        default:
                            progressStatus.innerHTML = 'Checking<span class="loading-dots"></span>';
                    }
                }
            }
        });
    }


    /**
     * Handle API check completion
     */
    handleCheckComplete(detail) {
        const { connectionStatus, connectedCount, totalCount, allConnected } = detail;
        
        console.log(`📊 API Check Complete: ${connectedCount}/${totalCount} connected`);
        
        this.handleInlineCompletion(detail);
    }

    /**
     * Handle completion for inline progress bars
     */
    handleInlineCompletion(detail) {
        const { allConnected } = detail;
        
        if (allConnected) {
            console.log('✅ All APIs connected - shrinking progress section in 1.5 seconds...');
            
            // Add a brief delay to show the success state
            setTimeout(() => {
                this.hideLoadingState();
            }, 1500);
        } else {
            console.log('⚠️ Some APIs failed to connect - keeping progress section visible');
            
            // Add retry functionality for inline progress
            this.addInlineRetryOption();
        }
    }


    /**
     * Add retry option for inline progress
     */
    addInlineRetryOption() {
        if (!this.statusOverlay) return;
        
        // Check if retry option already exists
        if (this.statusOverlay.querySelector('.inline-retry-section')) return;
        
        const retrySection = document.createElement('div');
        retrySection.className = 'inline-retry-section';
        retrySection.style.cssText = `
            margin-top: 20px;
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
        `;
        retrySection.innerHTML = `
            <button onclick="window.codeComprehensionLoader.retryConnection()" 
                    style="background: rgba(39, 174, 96, 0.8); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-right: 10px; font-weight: 600;">
                🔄 Retry Connection
            </button>
            <button onclick="window.codeComprehensionLoader.hideLoadingState()" 
                    style="background: rgba(255, 255, 255, 0.2); color: white; border: 1px solid rgba(255, 255, 255, 0.3); padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600;">
                Continue Anyway
            </button>
        `;
        
        this.statusOverlay.appendChild(retrySection);
    }


    /**
     * Retry API connection
     */
    async retryConnection() {
        console.log('🔄 Retrying API connection...');
        
        this.resetInlineProgress();

        // Retry connection check
        if (this.apiTracker) {
            try {
                await this.apiTracker.checkAPIConnectivity();
            } catch (error) {
                console.error('🚨 Retry failed:', error);
            }
        }
    }

    /**
     * Reset inline progress bars for retry
     */
    resetInlineProgress() {
        // Remove retry section
        const retrySection = this.statusOverlay?.querySelector('.inline-retry-section');
        if (retrySection) {
            retrySection.remove();
        }

        // Reset all progress items
        const progressItems = this.statusOverlay?.querySelectorAll('.progress-item');
        progressItems?.forEach(item => {
            item.className = 'progress-item';
            
            const progressFill = item.querySelector('.progress-fill');
            if (progressFill) {
                progressFill.className = 'progress-fill checking';
            }
            
            const progressStatus = item.querySelector('.progress-status');
            if (progressStatus) {
                progressStatus.className = 'progress-status';
                progressStatus.innerHTML = 'Checking<span class="loading-dots"></span>';
            }
        });
    }


    /**
     * Get current API status for external use
     */
    getAPIStatus() {
        return this.apiTracker ? this.apiTracker.getConnectionStatus() : new Map();
    }

    /**
     * Check if all APIs are connected
     */
    areAllAPIsConnected() {
        return this.apiTracker ? this.apiTracker.areAllAPIsConnected() : false;
    }
}

// Initialize the loader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on code comprehension pages
    const isCodeComprehensionPage = window.location.pathname.includes('/code-comprehension');
    
    if (isCodeComprehensionPage) {
        console.log('🎯 Code Comprehension page detected - initializing loader...');
        
        // Create global loader instance
        window.codeComprehensionLoader = new CodeComprehensionLoader();
        
        // Initialize after a short delay to ensure other scripts are loaded
        setTimeout(() => {
            window.codeComprehensionLoader.init();
        }, 500);
    }
});

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CodeComprehensionLoader;
}