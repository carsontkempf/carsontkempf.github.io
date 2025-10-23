import config from '../config.js';

class DataAPI {
    constructor() {
        this.baseUrl = config.api.baseUrl;
        this.endpoints = config.api.endpoints.data;
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

    // GET /data/prompts/all - Get prompt catalog
    async getAllPrompts() {
        return this.makeRequest(this.endpoints.promptsAll);
    }

    // POST /data/prompts/update/<prompt_id> - Update specific prompt
    async updatePrompt(promptId, promptData) {
        return this.makeRequest(`${this.endpoints.promptsUpdate}/${promptId}`, {
            method: 'POST',
            body: JSON.stringify(promptData),
        });
    }

    // GET /data/memory/permanent - Get permanent vaccinations
    async getPermanentMemory() {
        return this.makeRequest(this.endpoints.memoryPermanent);
    }

    // POST /data/memory/temp - Update temporary vaccinations
    async updateTempMemory(memoryData) {
        return this.makeRequest(this.endpoints.memoryTemp, {
            method: 'POST',
            body: JSON.stringify(memoryData),
        });
    }

    // GET /data/statistics/all - Get performance statistics
    async getAllStatistics() {
        return this.makeRequest(this.endpoints.statisticsAll);
    }

    // GET /data/refactoring_tree - Get refactoring tree structure
    async getRefactoringTree() {
        return this.makeRequest(this.endpoints.refactoringTree);
    }

    // POST /data/save_snapshot/<thread_id> - Save current state snapshot
    async saveSnapshot(threadId) {
        return this.makeRequest(`${this.endpoints.saveSnapshot}/${threadId}`, {
            method: 'POST',
        });
    }
}

export default DataAPI;