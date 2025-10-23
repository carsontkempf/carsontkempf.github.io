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
            <div class="code-comprehension-interface">
                <div class="main-interface">
                    <h2>Code Comprehension Analysis</h2>
                    <div class="input-section">
                        <label for="code-input">Enter your code to analyze:</label>
                        <textarea 
                            id="code-input" 
                            class="code-textbox" 
                            placeholder="def example_function():
    # Enter your Python code here
    return 'Hello, World!'"
                            rows="15"
                        ></textarea>
                    </div>
                    
                    <div class="control-section">
                        <button id="play-btn" class="play-button">
                            <span class="play-icon">▶</span>
                            Analyze Code
                        </button>
                        <div class="status-indicator">
                            <span id="analysis-status" class="status-text">Ready</span>
                        </div>
                    </div>
                </div>

                <div class="streaming-output">
                    <h3>Analysis Output</h3>
                    <div class="output-controls">
                        <button id="clear-output-btn" class="btn btn-sm btn-outline">Clear Output</button>
                        <button id="export-output-btn" class="btn btn-sm btn-outline">Export Results</button>
                    </div>
                    <div id="output-container" class="output-content">
                        <div class="output-entry info">
                            <span class="output-timestamp">[${new Date().toLocaleTimeString()}]</span>
                            <span class="output-message">Ready for code analysis</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    initializeHealthMeter() {
        // Health meter is not needed for the textbox interface
        // this.healthMeter = new HealthMeter('health-meter-container', {
        //     size: 100,
        //     thickness: 8,
        //     title: 'Code Health'
        // });
    }

    attachEventListeners() {
        // Play button for code analysis
        const playBtn = this.element.querySelector('#play-btn');
        playBtn.addEventListener('click', () => this.handleAnalyzeCode());

        // Clear output button
        const clearOutputBtn = this.element.querySelector('#clear-output-btn');
        clearOutputBtn.addEventListener('click', () => this.clearOutput());

        // Export output button
        const exportOutputBtn = this.element.querySelector('#export-output-btn');
        exportOutputBtn.addEventListener('click', () => this.exportOutput());
    }

    async handleAnalyzeCode() {
        if (this.isRunning) return;

        const codeInput = this.element.querySelector('#code-input');
        const code = codeInput.value.trim();

        if (!code) {
            this.addOutputEntry('Please enter some code to analyze', 'error');
            return;
        }

        try {
            this.setRunning(true);
            this.updateAnalysisStatus('Starting analysis...');
            this.addOutputEntry('Initializing code comprehension analysis...', 'info');

            // Start the streaming analysis
            const response = await fetch(`${window.location.origin}/api/code-comprehension/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Analysis failed');
            }

            this.currentSessionId = data.session_id;
            this.addOutputEntry(`Analysis started. Session ID: ${data.session_id}`, 'success');
            
            // Start listening to the stream
            this.listenToStream(data.session_id);

        } catch (error) {
            console.error('Code analysis failed:', error);
            this.addOutputEntry(`Analysis failed: ${error.message}`, 'error');
            this.updateAnalysisStatus('Failed');
            this.setRunning(false);
        }
    }

    listenToStream(sessionId) {
        // Create EventSource for Server-Sent Events
        const eventSource = new EventSource(`${window.location.origin}/api/code-comprehension/stream/${sessionId}`);
        
        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleStreamMessage(data);
            } catch (error) {
                console.error('Error parsing stream message:', error);
            }
        };

        eventSource.onerror = (error) => {
            console.error('Stream error:', error);
            this.addOutputEntry('Stream connection error occurred', 'error');
            eventSource.close();
            this.setRunning(false);
        };

        eventSource.onopen = () => {
            this.addOutputEntry('Connected to analysis stream', 'info');
        };

        // Store reference to close later if needed
        this.currentEventSource = eventSource;
    }

    handleStreamMessage(data) {
        switch (data.type) {
            case 'workflow_start':
                this.updateAnalysisStatus('Running workflow...');
                this.addOutputEntry(data.message, 'info');
                break;
            
            case 'node_start':
                this.updateAnalysisStatus(`Running Node ${data.node}...`);
                this.addOutputEntry(`Node ${data.node}: ${data.message}`, 'info');
                break;
            
            case 'node_stream':
                this.addOutputEntry(`Node ${data.node}: ${data.content}`, 'stream');
                break;
            
            case 'node_complete':
                this.addOutputEntry(`Node ${data.node}: ${data.message}`, 'success');
                if (data.metrics) {
                    this.addOutputEntry(`Metrics: ${JSON.stringify(data.metrics, null, 2)}`, 'data');
                }
                break;
            
            case 'completion':
                this.updateAnalysisStatus('Completed');
                this.addOutputEntry(data.message, 'success');
                this.setRunning(false);
                if (this.currentEventSource) {
                    this.currentEventSource.close();
                }
                break;
            
            case 'error':
                this.updateAnalysisStatus('Error');
                this.addOutputEntry(`Error: ${data.message}`, 'error');
                this.setRunning(false);
                if (this.currentEventSource) {
                    this.currentEventSource.close();
                }
                break;
            
            case 'heartbeat':
                // Silent heartbeat, just keep connection alive
                break;
            
            default:
                this.addOutputEntry(`Unknown message type: ${data.type}`, 'info');
        }
    }

    updateAnalysisStatus(status) {
        const statusElement = this.element.querySelector('#analysis-status');
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.className = `status-text ${status.toLowerCase().replace(' ', '-')}`;
        }
    }

    setRunning(isRunning) {
        this.isRunning = isRunning;
        const playBtn = this.element.querySelector('#play-btn');

        if (isRunning) {
            playBtn.disabled = true;
            playBtn.innerHTML = '<span class="play-icon">⏳</span> Analyzing...';
        } else {
            playBtn.disabled = false;
            playBtn.innerHTML = '<span class="play-icon">▶</span> Analyze Code';
        }
    }

    addOutputEntry(message, type = 'info') {
        const outputContainer = this.element.querySelector('#output-container');
        const timestamp = new Date().toLocaleTimeString();
        
        const outputEntry = document.createElement('div');
        outputEntry.className = `output-entry ${type}`;
        outputEntry.innerHTML = `
            <span class="output-timestamp">[${timestamp}]</span>
            <span class="output-message">${message}</span>
        `;
        
        outputContainer.appendChild(outputEntry);
        outputContainer.scrollTop = outputContainer.scrollHeight;

        // Limit output entries
        const entries = outputContainer.querySelectorAll('.output-entry');
        if (entries.length > 200) {
            entries[0].remove();
        }
    }

    clearOutput() {
        const outputContainer = this.element.querySelector('#output-container');
        outputContainer.innerHTML = '';
        this.addOutputEntry('Output cleared', 'info');
    }

    exportOutput() {
        const outputEntries = this.element.querySelectorAll('.output-entry');
        const outputText = Array.from(outputEntries)
            .map(entry => entry.textContent)
            .join('\n');

        const blob = new Blob([outputText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code-analysis-${new Date().toISOString().slice(0, 19)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    destroy() {
        // Close any active EventSource connections
        if (this.currentEventSource) {
            this.currentEventSource.close();
        }
        
        // Clean up DOM elements
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

export default SimulationView;