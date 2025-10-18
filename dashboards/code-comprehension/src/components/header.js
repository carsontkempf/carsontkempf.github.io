class Header {
    constructor() {
        this.element = null;
        this.init();
    }

    init() {
        this.element = document.createElement('header');
        this.element.className = 'app-header';
        this.render();
    }

    render() {
        this.element.innerHTML = `
            <div class="header-content">
                <div class="header-left">
                    <h1 class="app-title">Code Comprehension Project</h1>
                    <span class="app-subtitle">AI-Powered Code Analysis & Refactoring</span>
                </div>
                <div class="header-right">
                    <div class="health-indicator">
                        <span class="health-label">System Health:</span>
                        <div class="health-meter" id="global-health-meter">
                            <div class="health-bar" id="global-health-bar"></div>
                        </div>
                        <span class="health-value" id="global-health-value">100%</span>
                    </div>
                    <button class="emergency-reset-btn" id="emergency-reset">Reset</button>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    attachEventListeners() {
        const resetBtn = this.element.querySelector('#emergency-reset');
        resetBtn.addEventListener('click', () => this.handleEmergencyReset());
    }

    updateHealth(healthValue) {
        const healthBar = this.element.querySelector('#global-health-bar');
        const healthValueSpan = this.element.querySelector('#global-health-value');
        
        const percentage = Math.round(healthValue * 100);
        healthBar.style.width = `${percentage}%`;
        healthValueSpan.textContent = `${percentage}%`;
        
        // Update color based on health level
        healthBar.className = 'health-bar';
        if (percentage < 30) {
            healthBar.classList.add('critical');
        } else if (percentage < 60) {
            healthBar.classList.add('warning');
        } else {
            healthBar.classList.add('healthy');
        }
    }

    async handleEmergencyReset() {
        if (confirm('This will reset the entire simulation. Are you sure?')) {
            try {
                // Dispatch custom event for emergency reset
                const event = new CustomEvent('emergency-reset');
                document.dispatchEvent(event);
            } catch (error) {
                console.error('Emergency reset failed:', error);
                alert('Emergency reset failed. Please try again.');
            }
        }
    }

    getElement() {
        return this.element;
    }
}

export default Header;