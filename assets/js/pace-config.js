/**
 * Pace.js Configuration for Code Comprehension Project
 * Tracks API connections to Flask backend and shows progress until all are connected
 */

// Configure Pace.js before it loads
window.paceOptions = {
    // Auto-start Pace.js when page loads
    ajax: {
        // Track all AJAX requests
        trackMethods: ['GET', 'POST', 'PUT', 'DELETE'],
        // Ignore specific URLs that shouldn't show loading (like health checks)
        ignoreURLs: [
            '/health',
            '/ping',
            'analytics',
            'googletag',
            'googletagmanager',
            'facebook.net',
            'doubleclick.net'
        ]
    },
    
    // Track document ready state
    document: true,
    
    // Track specific elements that need to load
    elements: {
        selectors: [
            '#project-content-wrapper',
            '#pdf-interface-container',
            '.code-section',
            '.api-status'
        ]
    },
    
    // Don't track event lag for better performance
    eventLag: false,
    
    // Restart on navigation events (for SPA-like behavior)
    restartOnPushState: true,
    restartOnRequestAfter: 300,
    
    // Minimum time to show the progress bar (prevents flashing)
    minTime: 500,
    
    // Time to show at 100% before hiding
    ghostTime: 250,
    
    // Color scheme for the progress bar
    theme: 'minimal',
    
    // Target for progress bar (will be overridden by CSS)
    target: 'body'
};

/**
 * Custom API Connection Tracker
 * Specifically tracks the Flask backend API endpoints
 */
class APIConnectionTracker {
    constructor() {
        this.apiBaseUrl = 'http://131.151.90.18:5000';
        this.criticalEndpoints = [
            '/api/v1/simulation/state',
            '/api/v1/data/prompts/all',
            '/api/v1/config/variables/all'
        ];
        this.connectionStatus = new Map();
        this.totalChecks = 0;
        this.completedChecks = 0;
    }

    /**
     * Check connectivity to critical API endpoints
     */
    async checkAPIConnectivity() {
        console.log('🔗 Starting API connectivity check...');
        
        // Reset counters
        this.totalChecks = this.criticalEndpoints.length;
        this.completedChecks = 0;
        
        // Start Pace.js tracking for our API checks
        if (window.Pace && typeof window.Pace.track === 'function') {
            window.Pace.track(() => {
                return this.performConnectivityChecks();
            });
        } else {
            return this.performConnectivityChecks();
        }
    }

    /**
     * Perform the actual connectivity checks
     */
    async performConnectivityChecks() {
        const checkPromises = this.criticalEndpoints.map(endpoint => 
            this.checkSingleEndpoint(endpoint)
        );

        try {
            await Promise.allSettled(checkPromises);
            this.logConnectionSummary();
            return this.connectionStatus;
        } catch (error) {
            console.error('❌ API connectivity check failed:', error);
            throw error;
        }
    }

    /**
     * Check a single API endpoint
     */
    async checkSingleEndpoint(endpoint) {
        const fullUrl = `${this.apiBaseUrl}${endpoint}`;
        const timeoutMs = 5000; // 5 second timeout

        try {
            console.log(`🔍 Checking: ${endpoint}`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const status = response.ok ? 'connected' : 'error';
            this.connectionStatus.set(endpoint, {
                status: status,
                statusCode: response.status,
                timestamp: new Date().toISOString()
            });

            console.log(`✅ ${endpoint}: ${status} (${response.status})`);
            
        } catch (error) {
            const status = error.name === 'AbortError' ? 'timeout' : 'failed';
            this.connectionStatus.set(endpoint, {
                status: status,
                error: error.message,
                timestamp: new Date().toISOString()
            });

            console.log(`❌ ${endpoint}: ${status} - ${error.message}`);
        } finally {
            this.completedChecks++;
            this.updateProgress();
        }
    }

    /**
     * Update progress for visual feedback
     */
    updateProgress() {
        const progress = (this.completedChecks / this.totalChecks) * 100;
        console.log(`📊 API Check Progress: ${progress.toFixed(1)}% (${this.completedChecks}/${this.totalChecks})`);
        
        // Dispatch custom event for UI components to listen to
        window.dispatchEvent(new CustomEvent('apiCheckProgress', {
            detail: {
                progress: progress,
                completed: this.completedChecks,
                total: this.totalChecks,
                status: this.connectionStatus
            }
        }));
    }

    /**
     * Log connection summary
     */
    logConnectionSummary() {
        console.log('📋 API Connection Summary:');
        const connected = Array.from(this.connectionStatus.values()).filter(s => s.status === 'connected').length;
        const total = this.connectionStatus.size;
        
        console.log(`   Connected: ${connected}/${total} endpoints`);
        
        this.connectionStatus.forEach((status, endpoint) => {
            const icon = status.status === 'connected' ? '✅' : '❌';
            console.log(`   ${icon} ${endpoint}: ${status.status}`);
        });

        // Dispatch completion event
        window.dispatchEvent(new CustomEvent('apiCheckComplete', {
            detail: {
                connectionStatus: this.connectionStatus,
                connectedCount: connected,
                totalCount: total,
                allConnected: connected === total
            }
        }));
    }

    /**
     * Get current connection status
     */
    getConnectionStatus() {
        return this.connectionStatus;
    }

    /**
     * Check if all critical APIs are connected
     */
    areAllAPIsConnected() {
        if (this.connectionStatus.size === 0) return false;
        
        return Array.from(this.connectionStatus.values())
            .every(status => status.status === 'connected');
    }
}

// Initialize API tracker
window.apiTracker = new APIConnectionTracker();

// Auto-run API connectivity check when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Code Comprehension Project - Starting API connectivity checks...');
    
    // Wait a bit for other scripts to load
    setTimeout(async () => {
        try {
            await window.apiTracker.checkAPIConnectivity();
        } catch (error) {
            console.error('🚨 Failed to complete API connectivity check:', error);
        }
    }, 1000);
});

// Listen for page navigation events to re-check APIs
window.addEventListener('beforeunload', () => {
    console.log('🔄 Page unloading - API checks will restart on next page');
});

// Export for use in other modules
window.CodeComprehensionAPI = {
    tracker: () => window.apiTracker,
    checkConnectivity: () => window.apiTracker.checkAPIConnectivity(),
    getStatus: () => window.apiTracker.getConnectionStatus(),
    isAllConnected: () => window.apiTracker.areAllAPIsConnected()
};