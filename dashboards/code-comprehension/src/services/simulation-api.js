import config from '../config.js';

class SimulationAPI {
    constructor() {
        this.baseUrl = config.api.baseUrl;
        this.endpoints = config.api.endpoints.simulation;
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

    // POST /simulation/run - Execute a new simulation cycle
    async runSimulation(inputData) {
        return this.makeRequest(this.endpoints.run, {
            method: 'POST',
            body: JSON.stringify(inputData),
        });
    }

    // POST /simulation/resimulate/<thread_id> - Resimulate from checkpoint
    async resimulateFromCheckpoint(threadId) {
        return this.makeRequest(`${this.endpoints.resimulate}/${threadId}`, {
            method: 'POST',
        });
    }

    // POST /simulation/reset - Reset current session
    async resetSimulation() {
        return this.makeRequest(this.endpoints.reset, {
            method: 'POST',
        });
    }

    // GET /simulation/state/<thread_id> - Get current simulation state
    async getSimulationState(threadId) {
        return this.makeRequest(`${this.endpoints.state}/${threadId}`);
    }

    // GET /simulation/log/<thread_id> - Get simulation log
    async getSimulationLog(threadId) {
        return this.makeRequest(`${this.endpoints.log}/${threadId}`);
    }

    // POST /simulation/set_genetic_code - Update system genetic code
    async setGeneticCode(geneticCode) {
        return this.makeRequest(this.endpoints.setGeneticCode, {
            method: 'POST',
            body: JSON.stringify({ genetic_code: geneticCode }),
        });
    }

    // POST /simulation/set_baseline_health - Update baseline health metrics
    async setBaselineHealth(healthConfig) {
        return this.makeRequest(this.endpoints.setBaselineHealth, {
            method: 'POST',
            body: JSON.stringify({ health_config: healthConfig }),
        });
    }
}

export default SimulationAPI;