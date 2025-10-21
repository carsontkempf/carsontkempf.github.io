/**
 * Deep Research UI Component
 * Provides user interface for the streaming deep research functionality
 */

class DeepResearchUI {
    constructor(containerId, apiClient = null) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container with ID '${containerId}' not found`);
        }

        this.api = apiClient || new DeepResearchAPI();
        this.currentSessionId = null;
        this.currentStream = null;
        
        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="deep-research-container">
                <div class="research-header">
                    <h3>🔍 Deep Research Agent</h3>
                    <p>AI-powered research with real-time streaming</p>
                </div>

                <div class="research-form">
                    <div class="form-group">
                        <label for="research-topic">Research Topic:</label>
                        <input 
                            type="text" 
                            id="research-topic" 
                            placeholder="Enter your research topic (e.g., Benefits of Paneer)"
                            class="research-input"
                        />
                    </div>
                    
                    <div class="form-group">
                        <label for="max-loops">Max Research Loops:</label>
                        <select id="max-loops" class="research-select">
                            <option value="1">1 Loop</option>
                            <option value="2">2 Loops</option>
                            <option value="3" selected>3 Loops</option>
                            <option value="4">4 Loops</option>
                            <option value="5">5 Loops</option>
                        </select>
                    </div>

                    <div class="form-actions">
                        <button id="start-research" class="btn btn-primary">
                            Start Research
                        </button>
                        <button id="stop-research" class="btn btn-secondary" disabled>
                            Stop Research
                        </button>
                    </div>
                </div>

                <div class="research-status" id="research-status" style="display: none;">
                    <div class="status-header">
                        <span class="status-indicator" id="status-indicator">⏳</span>
                        <span id="status-text">Initializing...</span>
                    </div>
                    <div class="current-step" id="current-step"></div>
                </div>

                <div class="research-progress" id="research-progress" style="display: none;">
                    <h4>🔄 Progress Log</h4>
                    <div class="progress-log" id="progress-log"></div>
                </div>

                <div class="llm-tokens" id="llm-tokens" style="display: none;">
                    <h4>🤖 AI Thinking (Live Tokens)</h4>
                    <div class="tokens-display" id="tokens-display"></div>
                </div>

                <div class="research-result" id="research-result" style="display: none;">
                    <h4>📋 Research Results</h4>
                    <div class="result-content" id="result-content"></div>
                    <div class="result-actions">
                        <button id="download-result" class="btn btn-secondary">
                            Download Report
                        </button>
                        <button id="copy-result" class="btn btn-secondary">
                            Copy to Clipboard
                        </button>
                    </div>
                </div>

                <div class="active-sessions" id="active-sessions">
                    <h4>📊 Active Sessions</h4>
                    <div class="sessions-list" id="sessions-list"></div>
                    <button id="refresh-sessions" class="btn btn-secondary">
                        Refresh Sessions
                    </button>
                </div>
            </div>
        `;

        this.addStyles();
    }

    addStyles() {
        if (document.getElementById('deep-research-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'deep-research-styles';
        styles.textContent = `
            .deep-research-container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .research-header {
                text-align: center;
                margin-bottom: 30px;
            }

            .research-header h3 {
                margin: 0 0 10px 0;
                color: #2c3e50;
            }

            .research-header p {
                margin: 0;
                color: #7f8c8d;
            }

            .form-group {
                margin-bottom: 15px;
            }

            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: 600;
                color: #34495e;
            }

            .research-input, .research-select {
                width: 100%;
                padding: 10px;
                border: 2px solid #ecf0f1;
                border-radius: 6px;
                font-size: 14px;
                transition: border-color 0.3s;
            }

            .research-input:focus, .research-select:focus {
                outline: none;
                border-color: #3498db;
            }

            .form-actions {
                display: flex;
                gap: 10px;
                margin-top: 20px;
            }

            .btn {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
            }

            .btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }

            .btn-primary {
                background-color: #3498db;
                color: white;
            }

            .btn-primary:hover:not(:disabled) {
                background-color: #2980b9;
            }

            .btn-secondary {
                background-color: #95a5a6;
                color: white;
            }

            .btn-secondary:hover:not(:disabled) {
                background-color: #7f8c8d;
            }

            .research-status {
                background-color: #f8f9fa;
                border-left: 4px solid #3498db;
                padding: 15px;
                margin: 20px 0;
                border-radius: 0 6px 6px 0;
            }

            .status-header {
                font-weight: 600;
                margin-bottom: 5px;
            }

            .status-indicator {
                margin-right: 8px;
            }

            .current-step {
                font-size: 12px;
                color: #7f8c8d;
            }

            .research-progress {
                margin: 20px 0;
            }

            .progress-log {
                background-color: #2c3e50;
                color: #ecf0f1;
                padding: 15px;
                border-radius: 6px;
                font-family: 'Monaco', 'Menlo', monospace;
                font-size: 12px;
                max-height: 300px;
                overflow-y: auto;
                white-space: pre-wrap;
            }

            .llm-tokens {
                margin: 20px 0;
            }

            .tokens-display {
                background-color: #34495e;
                color: #ecf0f1;
                padding: 15px;
                border-radius: 6px;
                font-family: 'Monaco', 'Menlo', monospace;
                font-size: 12px;
                max-height: 200px;
                overflow-y: auto;
                white-space: pre-wrap;
                line-height: 1.4;
            }

            .research-result {
                margin: 20px 0;
                border: 2px solid #27ae60;
                border-radius: 6px;
                padding: 20px;
                background-color: #d5f4e6;
            }

            .result-content {
                background-color: white;
                padding: 15px;
                border-radius: 6px;
                margin-bottom: 15px;
                white-space: pre-wrap;
                line-height: 1.6;
                max-height: 400px;
                overflow-y: auto;
            }

            .result-actions {
                display: flex;
                gap: 10px;
            }

            .active-sessions {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 2px solid #ecf0f1;
            }

            .sessions-list {
                min-height: 60px;
                margin-bottom: 15px;
                padding: 10px;
                background-color: #f8f9fa;
                border-radius: 6px;
            }

            .session-item {
                padding: 8px;
                margin-bottom: 8px;
                background-color: white;
                border-radius: 4px;
                border-left: 4px solid #3498db;
                font-size: 12px;
            }

            .session-item.completed {
                border-left-color: #27ae60;
            }

            .session-item.error {
                border-left-color: #e74c3c;
            }

            .loading {
                animation: pulse 1.5s ease-in-out infinite;
            }

            @keyframes pulse {
                0% { opacity: 0.6; }
                50% { opacity: 1; }
                100% { opacity: 0.6; }
            }
        `;
        document.head.appendChild(styles);
    }

    attachEventListeners() {
        // Start research button
        document.getElementById('start-research').addEventListener('click', () => {
            this.startResearch();
        });

        // Stop research button
        document.getElementById('stop-research').addEventListener('click', () => {
            this.stopResearch();
        });

        // Download result button
        document.getElementById('download-result').addEventListener('click', () => {
            this.downloadResult();
        });

        // Copy result button
        document.getElementById('copy-result').addEventListener('click', () => {
            this.copyResult();
        });

        // Refresh sessions button
        document.getElementById('refresh-sessions').addEventListener('click', () => {
            this.refreshSessions();
        });

        // Enter key in topic input
        document.getElementById('research-topic').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.startResearch();
            }
        });

        // Load initial sessions
        this.refreshSessions();
    }

    async startResearch() {
        const topicInput = document.getElementById('research-topic');
        const maxLoopsSelect = document.getElementById('max-loops');
        const startBtn = document.getElementById('start-research');
        const stopBtn = document.getElementById('stop-research');

        const topic = topicInput.value.trim();
        if (!topic) {
            alert('Please enter a research topic');
            return;
        }

        try {
            // Update UI state
            startBtn.disabled = true;
            stopBtn.disabled = false;
            this.showStatus('🚀 Starting research...', 'starting');
            this.clearProgress();
            this.clearTokens();
            this.hideResult();

            // Start research session
            const response = await this.api.startResearch(topic, {
                maxLoops: parseInt(maxLoopsSelect.value)
            });

            this.currentSessionId = response.session_id;
            
            // Start streaming
            this.currentStream = this.api.streamResearch(this.currentSessionId, {
                onProgress: (data) => this.handleProgress(data),
                onStatus: (data) => this.handleStatus(data),
                onResult: (data) => this.handleResult(data),
                onError: (error) => this.handleError(error),
                onComplete: (sessionId, data) => this.handleComplete(sessionId, data),
                onToken: (token) => this.handleToken(token)
            });

        } catch (error) {
            console.error('Error starting research:', error);
            this.handleError(error);
            startBtn.disabled = false;
            stopBtn.disabled = true;
        }
    }

    async stopResearch() {
        if (!this.currentSessionId) return;

        try {
            await this.api.stopResearch(this.currentSessionId);
            this.resetUI();
        } catch (error) {
            console.error('Error stopping research:', error);
            this.handleError(error);
        }
    }

    showStatus(message, status = 'running') {
        const statusDiv = document.getElementById('research-status');
        const statusIndicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');

        const indicators = {
            starting: '🚀',
            running: '⏳',
            completed: '✅',
            error: '❌',
            stopped: '⏹️'
        };

        statusIndicator.textContent = indicators[status] || '⏳';
        statusText.textContent = message;
        statusDiv.style.display = 'block';

        if (status === 'running') {
            statusIndicator.classList.add('loading');
        } else {
            statusIndicator.classList.remove('loading');
        }
    }

    handleProgress(data) {
        const progressDiv = document.getElementById('research-progress');
        const progressLog = document.getElementById('progress-log');

        progressDiv.style.display = 'block';

        const timestamp = new Date(data.timestamp).toLocaleTimeString();
        const logEntry = `[${timestamp}] ${data.type || 'info'}: ${data.message || JSON.stringify(data)}\n`;
        
        progressLog.textContent += logEntry;
        progressLog.scrollTop = progressLog.scrollHeight;

        // Update current step
        if (data.step) {
            document.getElementById('current-step').textContent = `Current: ${data.step}`;
        }
    }

    handleStatus(data) {
        this.showStatus(
            `Status: ${data.status} | Step: ${data.current_step || 'Unknown'}`,
            data.status
        );
    }

    handleResult(data) {
        this.showResult(data.result);
        this.showStatus('✅ Research completed!', 'completed');
        this.refreshSessions();
    }

    handleError(error) {
        this.showStatus(`❌ Error: ${error.message || error}`, 'error');
        this.resetUI();
    }

    handleComplete(sessionId, data) {
        console.log('Research session completed:', sessionId, data);
        this.resetUI();
    }

    handleToken(token) {
        const tokensDiv = document.getElementById('llm-tokens');
        const tokensDisplay = document.getElementById('tokens-display');

        tokensDiv.style.display = 'block';
        
        // Append token to display
        tokensDisplay.textContent += token;
        tokensDisplay.scrollTop = tokensDisplay.scrollHeight;
    }

    showResult(result) {
        const resultDiv = document.getElementById('research-result');
        const resultContent = document.getElementById('result-content');

        resultContent.textContent = result;
        resultDiv.style.display = 'block';
    }

    hideResult() {
        document.getElementById('research-result').style.display = 'none';
    }

    clearProgress() {
        document.getElementById('progress-log').textContent = '';
        document.getElementById('research-progress').style.display = 'none';
    }

    clearTokens() {
        document.getElementById('tokens-display').textContent = '';
        document.getElementById('llm-tokens').style.display = 'none';
    }

    resetUI() {
        const startBtn = document.getElementById('start-research');
        const stopBtn = document.getElementById('stop-research');

        startBtn.disabled = false;
        stopBtn.disabled = true;
        this.currentSessionId = null;
        this.currentStream = null;
    }

    async refreshSessions() {
        try {
            const response = await this.api.listSessions();
            this.displaySessions(response.sessions);
        } catch (error) {
            console.error('Error refreshing sessions:', error);
        }
    }

    displaySessions(sessions) {
        const sessionsList = document.getElementById('sessions-list');
        
        if (sessions.length === 0) {
            sessionsList.innerHTML = '<p style="color: #7f8c8d; text-align: center;">No active sessions</p>';
            return;
        }

        sessionsList.innerHTML = sessions.map(session => `
            <div class="session-item ${session.status}">
                <strong>Topic:</strong> ${session.research_topic}<br>
                <strong>Status:</strong> ${session.status}<br>
                <strong>ID:</strong> ${session.session_id}<br>
                <strong>Created:</strong> ${new Date(session.created_at).toLocaleString()}
            </div>
        `).join('');
    }

    downloadResult() {
        const resultContent = document.getElementById('result-content').textContent;
        if (!resultContent) return;

        const blob = new Blob([resultContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `research-result-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async copyResult() {
        const resultContent = document.getElementById('result-content').textContent;
        if (!resultContent) return;

        try {
            await navigator.clipboard.writeText(resultContent);
            const btn = document.getElementById('copy-result');
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        } catch (error) {
            console.error('Error copying to clipboard:', error);
        }
    }
}

// Export for use in other scripts
window.DeepResearchUI = DeepResearchUI;