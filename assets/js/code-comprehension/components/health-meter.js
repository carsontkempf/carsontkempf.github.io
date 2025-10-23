class HealthMeter {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = {
            size: options.size || 120,
            thickness: options.thickness || 12,
            animated: options.animated !== false,
            showValue: options.showValue !== false,
            title: options.title || 'Health',
            ...options
        };
        this.currentHealth = 1.0;
        this.element = null;
        this.init();
    }

    init() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container with id '${this.containerId}' not found`);
            return;
        }

        this.element = document.createElement('div');
        this.element.className = 'health-meter-container';
        this.render();
        container.appendChild(this.element);
    }

    render() {
        const { size, thickness, title, showValue } = this.options;
        const center = size / 2;
        const radius = (size - thickness) / 2;
        const circumference = 2 * Math.PI * radius;

        this.element.innerHTML = `
            <div class="health-meter-wrapper">
                <h4 class="health-meter-title">${title}</h4>
                <div class="health-meter-display" style="width: ${size}px; height: ${size}px;">
                    <svg width="${size}" height="${size}" class="health-meter-svg">
                        <!-- Background circle -->
                        <circle
                            cx="${center}"
                            cy="${center}"
                            r="${radius}"
                            fill="none"
                            stroke="#e0e0e0"
                            stroke-width="${thickness}"
                            class="health-meter-bg"
                        />
                        <!-- Progress circle -->
                        <circle
                            cx="${center}"
                            cy="${center}"
                            r="${radius}"
                            fill="none"
                            stroke="#4caf50"
                            stroke-width="${thickness}"
                            stroke-dasharray="${circumference}"
                            stroke-dashoffset="${circumference}"
                            stroke-linecap="round"
                            class="health-meter-progress"
                            id="health-progress-${this.containerId}"
                            transform="rotate(-90 ${center} ${center})"
                        />
                    </svg>
                    ${showValue ? `
                        <div class="health-meter-value">
                            <span class="health-percentage" id="health-percentage-${this.containerId}">100%</span>
                            <span class="health-status" id="health-status-${this.containerId}">Excellent</span>
                        </div>
                    ` : ''}
                </div>
                <div class="health-meter-indicators">
                    <div class="health-indicator critical">
                        <span class="indicator-color"></span>
                        <span class="indicator-label">Critical (&lt;30%)</span>
                    </div>
                    <div class="health-indicator warning">
                        <span class="indicator-color"></span>
                        <span class="indicator-label">Warning (30-60%)</span>
                    </div>
                    <div class="health-indicator healthy">
                        <span class="indicator-color"></span>
                        <span class="indicator-label">Healthy (&gt;60%)</span>
                    </div>
                </div>
            </div>
        `;
    }

    updateHealth(healthValue, animated = true) {
        if (healthValue < 0 || healthValue > 1) {
            console.warn('Health value should be between 0 and 1');
            healthValue = Math.max(0, Math.min(1, healthValue));
        }

        this.currentHealth = healthValue;
        const percentage = Math.round(healthValue * 100);
        
        // Update progress circle
        const progressCircle = this.element.querySelector(`#health-progress-${this.containerId}`);
        if (progressCircle) {
            const circumference = 2 * Math.PI * ((this.options.size - this.options.thickness) / 2);
            const offset = circumference - (healthValue * circumference);
            
            if (animated && this.options.animated) {
                progressCircle.style.transition = 'stroke-dashoffset 0.5s ease-in-out, stroke 0.3s ease-in-out';
            } else {
                progressCircle.style.transition = 'none';
            }
            
            progressCircle.style.strokeDashoffset = offset;
            
            // Update color based on health level
            if (percentage < 30) {
                progressCircle.style.stroke = '#f44336'; // Red
            } else if (percentage < 60) {
                progressCircle.style.stroke = '#ff9800'; // Orange
            } else {
                progressCircle.style.stroke = '#4caf50'; // Green
            }
        }

        // Update percentage display
        const percentageElement = this.element.querySelector(`#health-percentage-${this.containerId}`);
        if (percentageElement) {
            percentageElement.textContent = `${percentage}%`;
        }

        // Update status text
        const statusElement = this.element.querySelector(`#health-status-${this.containerId}`);
        if (statusElement) {
            let status;
            if (percentage < 30) {
                status = 'Critical';
            } else if (percentage < 60) {
                status = 'Warning';
            } else if (percentage < 80) {
                status = 'Good';
            } else {
                status = 'Excellent';
            }
            statusElement.textContent = status;
        }

        // Trigger health change event
        const event = new CustomEvent('health-change', {
            detail: { health: healthValue, percentage: percentage }
        });
        this.element.dispatchEvent(event);
    }

    getHealth() {
        return this.currentHealth;
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }

    // Animation methods
    pulse() {
        if (this.element) {
            this.element.classList.add('health-meter-pulse');
            setTimeout(() => {
                this.element.classList.remove('health-meter-pulse');
            }, 1000);
        }
    }

    flash() {
        if (this.element) {
            this.element.classList.add('health-meter-flash');
            setTimeout(() => {
                this.element.classList.remove('health-meter-flash');
            }, 500);
        }
    }
}

export default HealthMeter;