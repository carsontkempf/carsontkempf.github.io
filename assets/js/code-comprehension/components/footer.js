class Footer {
    constructor() {
        this.element = null;
        this.init();
    }

    init() {
        this.element = document.createElement('footer');
        this.element.className = 'app-footer';
        this.render();
    }

    render() {
        this.element.innerHTML = `
            <div class="footer-content">
                <div class="footer-left">
                    <span class="footer-text">Code Comprehension Project</span>
                    <span class="footer-version">v1.0.0</span>
                </div>
                <div class="footer-center">
                    <div class="status-indicators">
                        <div class="status-item">
                            <span class="status-label">Backend:</span>
                            <span class="status-indicator" id="backend-status">🔴 Disconnected</span>
                        </div>
                        <div class="status-item">
                            <span class="status-label">Last Update:</span>
                            <span class="status-value" id="last-update">Never</span>
                        </div>
                    </div>
                </div>
                <div class="footer-right">
                    <div class="footer-stats">
                        <span class="stat-item">
                            <span class="stat-label">Sessions:</span>
                            <span class="stat-value" id="session-count">0</span>
                        </span>
                        <span class="stat-item">
                            <span class="stat-label">Vaccinations:</span>
                            <span class="stat-value" id="vaccination-count">0</span>
                        </span>
                    </div>
                </div>
            </div>
        `;

        this.startStatusUpdates();
    }

    updateBackendStatus(isConnected) {
        const statusIndicator = this.element.querySelector('#backend-status');
        if (isConnected) {
            statusIndicator.innerHTML = '🟢 Connected';
            statusIndicator.className = 'status-indicator connected';
        } else {
            statusIndicator.innerHTML = '🔴 Disconnected';
            statusIndicator.className = 'status-indicator disconnected';
        }
    }

    updateLastUpdate() {
        const lastUpdateSpan = this.element.querySelector('#last-update');
        lastUpdateSpan.textContent = new Date().toLocaleTimeString();
    }

    updateStats(sessionCount, vaccinationCount) {
        const sessionCountSpan = this.element.querySelector('#session-count');
        const vaccinationCountSpan = this.element.querySelector('#vaccination-count');
        
        sessionCountSpan.textContent = sessionCount;
        vaccinationCountSpan.textContent = vaccinationCount;
    }

    startStatusUpdates() {
        // Update timestamp every minute
        setInterval(() => {
            this.updateLastUpdate();
        }, 60000);
    }

    getElement() {
        return this.element;
    }
}

export default Footer;