import config from '../config.js';

class ConfigAPI {
    constructor() {
        this.baseUrl = config.api.baseUrl;
        this.endpoints = config.api.endpoints.config;
    }

    async makeRequest(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        // Use Pace.js to track this request if available
        const makeTrackedRequest = async () => {
            const response = await fetch(`${this.baseUrl}${url}`, {
                ...defaultOptions,
                ...options,
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || `HTTP ${response.status}: Request failed`);
            }

            return response.json();
        };

        // Track with Pace.js if available, otherwise make request normally
        if (window.Pace && typeof window.Pace.track === 'function') {
            return window.Pace.track(makeTrackedRequest);
        } else {
            return makeTrackedRequest();
        }
    }

    // GET /config/variables/all - Get available independent variables
    async getAllVariables() {
        return this.makeRequest(this.endpoints.variablesAll);
    }

    // POST /config/variables/select - Select independent variable for tool
    async selectVariable(toolName, variableName) {
        return this.makeRequest(this.endpoints.variablesSelect, {
            method: 'POST',
            body: JSON.stringify({
                tool_name: toolName,
                variable_name: variableName,
            }),
        });
    }

    // GET /config/analysis/all - Get current analysis configuration
    async getAnalysisConfig() {
        return this.makeRequest(this.endpoints.analysisAll);
    }
}

export default ConfigAPI;