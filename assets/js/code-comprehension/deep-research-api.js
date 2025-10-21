/**
 * Deep Research API Client for streaming research sessions
 * Handles Server-Sent Events (SSE) streaming from the Flask backend
 */

class DeepResearchAPI {
    constructor(baseUrl = null) {
        // Get base URL from environment config or default to localhost
        this.baseUrl = baseUrl || window.ENV_CONFIG?.API_BASE_URL || 'http://localhost:5000';
        this.apiPrefix = '/api/v1/deep_research';
        this.activeStreams = new Map(); // Store active EventSource connections
    }

    /**
     * Start a new research session
     * @param {string} researchTopic - The topic to research
     * @param {Object} options - Optional configuration
     * @returns {Promise} Response with session_id
     */
    async startResearch(researchTopic, options = {}) {
        const payload = {
            research_topic: researchTopic,
            max_loops: options.maxLoops || 3,
            config: {
                fetch_full_page: options.fetchFullPage || true,
                max_results_per_search: options.maxResults || 5
            }
        };

        try {
            const response = await fetch(`${this.baseUrl}${this.apiPrefix}/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to start research session');
            }

            return data;
        } catch (error) {
            console.error('Error starting research session:', error);
            throw error;
        }
    }

    /**
     * Stream real-time updates for a research session using Server-Sent Events
     * @param {string} sessionId - The session identifier
     * @param {Object} callbacks - Event callback functions
     * @returns {EventSource} The EventSource instance for manual control
     */
    streamResearch(sessionId, callbacks = {}) {
        const {
            onProgress = () => {},
            onStatus = () => {},
            onResult = () => {},
            onError = () => {},
            onComplete = () => {},
            onToken = () => {} // For streaming LLM tokens
        } = callbacks;

        // Close existing stream for this session if any
        this.stopStream(sessionId);

        const eventSource = new EventSource(`${this.baseUrl}${this.apiPrefix}/stream/${sessionId}`);
        this.activeStreams.set(sessionId, eventSource);

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                switch (data.event_type) {
                    case 'status_update':
                        onStatus(data.data);
                        break;
                    case 'final_result':
                        onResult(data.data);
                        onComplete(sessionId, data.data);
                        this.stopStream(sessionId); // Auto-close on completion
                        break;
                    case 'on_chain_start':
                        onProgress({
                            type: 'step_start',
                            step: data.event_name,
                            message: data.data.message,
                            timestamp: data.timestamp
                        });
                        break;
                    case 'on_chain_end':
                        onProgress({
                            type: 'step_end',
                            step: data.event_name,
                            message: data.data.message,
                            timestamp: data.timestamp
                        });
                        break;
                    case 'on_llm_stream':
                        if (data.data.token) {
                            onToken(data.data.token);
                        }
                        break;
                    case 'on_llm_end':
                        onProgress({
                            type: 'llm_complete',
                            message: data.data.message,
                            timestamp: data.timestamp
                        });
                        break;
                    default:
                        onProgress(data);
                }
            } catch (error) {
                console.error('Error parsing SSE data:', error);
                onError(error);
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE connection error:', error);
            onError(error);
            this.stopStream(sessionId);
        };

        eventSource.onopen = () => {
            console.log(`SSE connection opened for session ${sessionId}`);
        };

        return eventSource;
    }

    /**
     * Stop streaming for a specific session
     * @param {string} sessionId - The session identifier
     */
    stopStream(sessionId) {
        const eventSource = this.activeStreams.get(sessionId);
        if (eventSource) {
            eventSource.close();
            this.activeStreams.delete(sessionId);
            console.log(`SSE stream closed for session ${sessionId}`);
        }
    }

    /**
     * Stop all active streams
     */
    stopAllStreams() {
        for (const [sessionId, eventSource] of this.activeStreams) {
            eventSource.close();
            console.log(`SSE stream closed for session ${sessionId}`);
        }
        this.activeStreams.clear();
    }

    /**
     * Get current status of a research session
     * @param {string} sessionId - The session identifier
     * @returns {Promise} Session status data
     */
    async getStatus(sessionId) {
        try {
            const response = await fetch(`${this.baseUrl}${this.apiPrefix}/status/${sessionId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to get session status');
            }

            return data;
        } catch (error) {
            console.error('Error getting session status:', error);
            throw error;
        }
    }

    /**
     * Get final result of a completed research session
     * @param {string} sessionId - The session identifier
     * @returns {Promise} Final research result
     */
    async getResult(sessionId) {
        try {
            const response = await fetch(`${this.baseUrl}${this.apiPrefix}/result/${sessionId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to get session result');
            }

            return data;
        } catch (error) {
            console.error('Error getting session result:', error);
            throw error;
        }
    }

    /**
     * Stop a running research session
     * @param {string} sessionId - The session identifier
     * @returns {Promise} Stop confirmation
     */
    async stopResearch(sessionId) {
        try {
            const response = await fetch(`${this.baseUrl}${this.apiPrefix}/stop/${sessionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to stop research session');
            }

            // Also stop the stream
            this.stopStream(sessionId);

            return data;
        } catch (error) {
            console.error('Error stopping research session:', error);
            throw error;
        }
    }

    /**
     * List all active research sessions
     * @returns {Promise} List of active sessions
     */
    async listSessions() {
        try {
            const response = await fetch(`${this.baseUrl}${this.apiPrefix}/sessions`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to list sessions');
            }

            return data;
        } catch (error) {
            console.error('Error listing sessions:', error);
            throw error;
        }
    }
}

// Export for use in other scripts
window.DeepResearchAPI = DeepResearchAPI;