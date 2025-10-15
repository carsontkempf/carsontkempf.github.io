import SimulationAPI from '../services/simulation-api.js';
import HealthMeter from '../components/health-meter.js';

class SimulationView {
    constructor(containerId) {
        this.containerId = containerId;
        this.simulationAPI = new SimulationAPI();
        this.currentThreadId = null;
        this.healthMeter = null;
        this.element = null;
        this.isRunning = false;
        this.init();
    }

    init() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container with id '${this.containerId}' not found`);
            return;
        }

        this.element = document.createElement('div');
        this.element.className = 'simulation-view';
        this.render();
        container.appendChild(this.element);
        
        this.initializeHealthMeter();
        this.attachEventListeners();
    }

    render() {
        this.element.innerHTML = `
            <div class="simulation-controls">
                <div class="control-section">
                    <h3>Simulation Control</h3>
                    <div class="button-group">
                        <button id="run-cycle-btn" class="btn btn-primary">
                            <span class="btn-icon">▶️</span>
                            Run Cycle
                        </button>
                        <button id="reset-session-btn" class="btn btn-secondary">
                            <span class="btn-icon">🔄</span>
                            Reset Session
                        </button>
                    </div>
                </div>
                
                <div class="control-section">
                    <h3>Resimulation</h3>
                    <div class="resimulation-controls">
                        <select id="checkpoint-select" class="form-select">
                            <option value="">Select checkpoint...</option>
                        </select>
                        <button id="resimulate-btn" class="btn btn-warning" disabled>
                            <span class="btn-icon">⏪</span>
                            Resimulate
                        </button>
                    </div>
                </div>
            </div>

            <div class="simulation-status">
                <div class="status-grid">
                    <div class="status-card">
                        <h4>Current Thread</h4>
                        <span id="current-thread" class="status-value">None</span>
                    </div>
                    <div class="status-card">
                        <h4>Simulation Status</h4>
                        <span id="simulation-status" class="status-value">Idle</span>
                    </div>
                    <div class="status-card">
                        <h4>Health Meter</h4>
                        <div id="health-meter-container"></div>
                    </div>
                </div>
            </div>

            <div class="simulation-log">
                <h3>Simulation Log</h3>
                <div class="log-controls">
                    <button id="clear-log-btn" class="btn btn-sm btn-outline">Clear Log</button>
                    <button id="export-log-btn" class="btn btn-sm btn-outline">Export Log</button>
                </div>
                <div id="log-container" class="log-content">
                    <div class="log-entry info">
                        <span class="log-timestamp">[${new Date().toLocaleTimeString()}]</span>
                        <span class="log-message">Simulation view initialized</span>
                    </div>
                </div>
            </div>
        `;
    }

    initializeHealthMeter() {
        this.healthMeter = new HealthMeter('health-meter-container', {
            size: 100,
            thickness: 8,
            title: 'Code Health'
        });
    }

    attachEventListeners() {
        // Run cycle button
        const runBtn = this.element.querySelector('#run-cycle-btn');
        runBtn.addEventListener('click', () => this.handleRunCycle());

        // Reset session button
        const resetBtn = this.element.querySelector('#reset-session-btn');
        resetBtn.addEventListener('click', () => this.handleResetSession());

        // Resimulate button
        const resimulateBtn = this.element.querySelector('#resimulate-btn');
        resimulateBtn.addEventListener('click', () => this.handleResimulate());

        // Checkpoint select
        const checkpointSelect = this.element.querySelector('#checkpoint-select');
        checkpointSelect.addEventListener('change', (e) => {
            const resimulateBtn = this.element.querySelector('#resimulate-btn');
            resimulateBtn.disabled = !e.target.value;
        });

        // Clear log button
        const clearLogBtn = this.element.querySelector('#clear-log-btn');
        clearLogBtn.addEventListener('click', () => this.clearLog());

        // Export log button
        const exportLogBtn = this.element.querySelector('#export-log-btn');
        exportLogBtn.addEventListener('click', () => this.exportLog());

        // Emergency reset listener
        document.addEventListener('emergency-reset', () => this.handleResetSession());
    }

    async handleRunCycle() {
        if (this.isRunning) return;

        try {
            this.setRunning(true);
            this.updateStatus('Running simulation...');
            this.addLogEntry('Starting new simulation cycle...', 'info');

            // Get input data (this would come from a form or current state)
            const inputData = {
                code: "def example_function():\n    return 'Hello, World!'",
                analysis_type: "refactor",
                complexity_level: "medium",
                focus_areas: ["readability", "performance"]
            };

            const result = await this.simulationAPI.runSimulation(inputData);
            
            this.currentThreadId = result.thread_id;
            this.updateCurrentThread(result.thread_id);
            
            // Update health meter
            if (result.state && result.state.health !== undefined) {
                this.healthMeter.updateHealth(result.state.health);
            }

            // Add log entries
            if (result.log_entries) {
                result.log_entries.forEach(entry => {
                    this.addLogEntry(entry.message || JSON.stringify(entry), 'success');
                });
            }

            this.addLogEntry(`Simulation completed successfully. Thread ID: ${result.thread_id}`, 'success');
            this.updateStatus('Completed');

        } catch (error) {
            console.error('Run cycle failed:', error);
            this.addLogEntry(`Simulation failed: ${error.message}`, 'error');
            this.updateStatus('Failed');
        } finally {
            this.setRunning(false);
        }
    }

    async handleResetSession() {
        if (this.isRunning) return;

        try {
            this.updateStatus('Resetting session...');
            this.addLogEntry('Resetting simulation session...', 'info');

            await this.simulationAPI.resetSimulation();
            
            this.currentThreadId = null;
            this.updateCurrentThread('None');
            this.healthMeter.updateHealth(1.0);
            this.clearLog();
            
            this.addLogEntry('Session reset successfully', 'success');
            this.updateStatus('Reset');

        } catch (error) {
            console.error('Reset failed:', error);
            this.addLogEntry(`Reset failed: ${error.message}`, 'error');
            this.updateStatus('Reset Failed');
        }
    }

    async handleResimulate() {
        const checkpointSelect = this.element.querySelector('#checkpoint-select');
        const selectedThreadId = checkpointSelect.value;

        if (!selectedThreadId) return;

        try {
            this.setRunning(true);
            this.updateStatus('Resimulating...');
            this.addLogEntry(`Resimulating from checkpoint: ${selectedThreadId}`, 'info');

            const result = await this.simulationAPI.resimulateFromCheckpoint(selectedThreadId);
            
            this.currentThreadId = selectedThreadId;
            this.updateCurrentThread(selectedThreadId);
            
            // Update health meter
            if (result.state && result.state.health !== undefined) {
                this.healthMeter.updateHealth(result.state.health);
            }

            // Add log entries
            if (result.log_entries) {
                result.log_entries.forEach(entry => {
                    this.addLogEntry(entry.message || JSON.stringify(entry), 'success');
                });
            }

            this.addLogEntry('Resimulation completed successfully', 'success');
            this.updateStatus('Resimulated');

        } catch (error) {
            console.error('Resimulation failed:', error);
            this.addLogEntry(`Resimulation failed: ${error.message}`, 'error');
            this.updateStatus('Resimulation Failed');
        } finally {
            this.setRunning(false);
        }
    }

    setRunning(isRunning) {
        this.isRunning = isRunning;
        const runBtn = this.element.querySelector('#run-cycle-btn');
        const resetBtn = this.element.querySelector('#reset-session-btn');
        const resimulateBtn = this.element.querySelector('#resimulate-btn');

        if (isRunning) {
            runBtn.disabled = true;
            runBtn.innerHTML = '<span class="btn-icon">⏳</span> Running...';
            resetBtn.disabled = true;
            resimulateBtn.disabled = true;
        } else {
            runBtn.disabled = false;
            runBtn.innerHTML = '<span class="btn-icon">▶️</span> Run Cycle';
            resetBtn.disabled = false;
            const checkpointSelect = this.element.querySelector('#checkpoint-select');
            resimulateBtn.disabled = !checkpointSelect.value;
        }
    }

    updateStatus(status) {
        const statusElement = this.element.querySelector('#simulation-status');
        statusElement.textContent = status;
        statusElement.className = `status-value ${status.toLowerCase().replace(' ', '-')}`;
    }

    updateCurrentThread(threadId) {
        const threadElement = this.element.querySelector('#current-thread');
        threadElement.textContent = threadId;
    }

    addLogEntry(message, type = 'info') {
        const logContainer = this.element.querySelector('#log-container');
        const timestamp = new Date().toLocaleTimeString();
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.innerHTML = `
            <span class="log-timestamp">[${timestamp}]</span>
            <span class="log-message">${message}</span>
        `;
        
        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;

        // Limit log entries
        const entries = logContainer.querySelectorAll('.log-entry');
        if (entries.length > 100) {
            entries[0].remove();
        }
    }

    clearLog() {
        const logContainer = this.element.querySelector('#log-container');
        logContainer.innerHTML = '';
        this.addLogEntry('Log cleared', 'info');
    }

    exportLog() {
        const logEntries = this.element.querySelectorAll('.log-entry');
        const logText = Array.from(logEntries)
            .map(entry => entry.textContent)
            .join('\n');

        const blob = new Blob([logText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `simulation-log-${new Date().toISOString().slice(0, 19)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    async loadCheckpoints() {
        // This would load available checkpoints from the backend
        // For now, we'll add some example checkpoints
        const checkpointSelect = this.element.querySelector('#checkpoint-select');
        checkpointSelect.innerHTML = '<option value="">Select checkpoint...</option>';
        
        // Add example checkpoints (these would come from the backend)
        const exampleCheckpoints = [
            'thread_20240115_143045',
            'thread_20240115_142030',
            'thread_20240115_141015'
        ];

        exampleCheckpoints.forEach(threadId => {
            const option = document.createElement('option');
            option.value = threadId;
            option.textContent = threadId;
            checkpointSelect.appendChild(option);
        });
    }

    destroy() {
        if (this.healthMeter) {
            this.healthMeter.destroy();
        }
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

export default SimulationView;