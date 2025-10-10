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

        const response = await fetch(`${this.baseUrl}${url}`, {
            ...defaultOptions,
            ...options,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `HTTP ${response.status}: Request failed`);
        }

        return response.json();
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