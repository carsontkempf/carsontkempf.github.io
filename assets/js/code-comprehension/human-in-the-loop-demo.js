/**
 * Human-in-the-Loop Demo JavaScript
 * 
 * This file demonstrates how to interact with the human-in-the-loop API
 * from the frontend Jekyll website.
 */

class HumanInTheLoopAPI {
    constructor(baseURL = '/api/v1/hil') {
        this.baseURL = baseURL;
        this.currentWorkflow = null;
        this.pollingInterval = null;
    }

    /**
     * Start a new human-in-the-loop workflow
     */
    async startWorkflow(codeInput, options = {}) {
        try {
            const payload = {
                original_code: codeInput,
                code_id: options.codeId || `code-${Date.now()}`,
                confusion_threshold: options.confusionThreshold || 300,
                llm_model: options.llmModel || 'ollama:gpt-oss'
            };

            const response = await fetch(`${this.baseURL}/workflow/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            
            if (result.success) {
                this.currentWorkflow = result.thread_id;
                
                // Start monitoring if workflow is paused
                if (result.status === 'paused_for_human_input') {
                    this.startPolling();
                }
                
                return result;
            } else {
                throw new Error(result.error || 'Failed to start workflow');
            }
        } catch (error) {
            console.error('Error starting workflow:', error);
            throw error;
        }
    }

    /**
     * Get the current state of a workflow
     */
    async getWorkflowState(threadId = null) {
        try {
            const workflowId = threadId || this.currentWorkflow;
            if (!workflowId) {
                throw new Error('No workflow ID provided');
            }

            const response = await fetch(`${this.baseURL}/workflow/${workflowId}/state`);
            const result = await response.json();
            
            return result;
        } catch (error) {
            console.error('Error getting workflow state:', error);
            throw error;
        }
    }

    /**
     * Approve the current workflow step
     */
    async approveStep(threadId = null, message = '', reason = '') {
        try {
            const workflowId = threadId || this.currentWorkflow;
            if (!workflowId) {
                throw new Error('No workflow ID provided');
            }

            const payload = { message, reason };

            const response = await fetch(`${this.baseURL}/workflow/${workflowId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            
            if (result.success) {
                // Continue polling if still paused
                if (result.status === 'paused_for_human_input') {
                    this.startPolling();
                } else {
                    this.stopPolling();
                }
            }
            
            return result;
        } catch (error) {
            console.error('Error approving step:', error);
            throw error;
        }
    }

    /**
     * Reject the current workflow step
     */
    async rejectStep(threadId = null, message = '', reason = '') {
        try {
            const workflowId = threadId || this.currentWorkflow;
            if (!workflowId) {
                throw new Error('No workflow ID provided');
            }

            const payload = { message, reason };

            const response = await fetch(`${this.baseURL}/workflow/${workflowId}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            this.stopPolling(); // Workflow terminated
            
            return result;
        } catch (error) {
            console.error('Error rejecting step:', error);
            throw error;
        }
    }

    /**
     * Edit the workflow state
     */
    async editState(edits, threadId = null, message = '', reason = '') {
        try {
            const workflowId = threadId || this.currentWorkflow;
            if (!workflowId) {
                throw new Error('No workflow ID provided');
            }

            const payload = { 
                edits, 
                message: message || 'State edited via frontend',
                reason: reason || 'Human intervention'
            };

            const response = await fetch(`${this.baseURL}/workflow/${workflowId}/edit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            
            if (result.success && result.status === 'paused_for_human_input') {
                this.startPolling();
            } else {
                this.stopPolling();
            }
            
            return result;
        } catch (error) {
            console.error('Error editing state:', error);
            throw error;
        }
    }

    /**
     * Get approval history for a workflow
     */
    async getApprovalHistory(threadId = null) {
        try {
            const workflowId = threadId || this.currentWorkflow;
            if (!workflowId) {
                throw new Error('No workflow ID provided');
            }

            const response = await fetch(`${this.baseURL}/workflow/${workflowId}/history`);
            const result = await response.json();
            
            return result;
        } catch (error) {
            console.error('Error getting approval history:', error);
            throw error;
        }
    }

    /**
     * Get available interrupt types
     */
    async getInterruptTypes() {
        try {
            const response = await fetch(`${this.baseURL}/interrupt-types`);
            const result = await response.json();
            
            return result;
        } catch (error) {
            console.error('Error getting interrupt types:', error);
            throw error;
        }
    }

    /**
     * Start polling for workflow state changes
     */
    startPolling(interval = 2000) {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }

        this.pollingInterval = setInterval(async () => {
            try {
                const state = await this.getWorkflowState();
                this.onStateUpdate(state);
                
                // Stop polling if workflow is no longer paused
                if (!state.pending_approval) {
                    this.stopPolling();
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, interval);
    }

    /**
     * Stop polling for workflow state changes
     */
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    /**
     * Override this method to handle state updates
     */
    onStateUpdate(state) {
        console.log('Workflow state updated:', state);
        
        // Dispatch custom event for UI components to listen to
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('hilStateUpdate', {
                detail: state
            }));
        }
    }

    /**
     * Reset a workflow
     */
    async resetWorkflow(threadId = null) {
        try {
            const workflowId = threadId || this.currentWorkflow;
            if (!workflowId) {
                throw new Error('No workflow ID provided');
            }

            const response = await fetch(`${this.baseURL}/workflow/${workflowId}/reset`, {
                method: 'POST'
            });

            const result = await response.json();
            
            if (result.success) {
                this.stopPolling();
                this.currentWorkflow = null;
            }
            
            return result;
        } catch (error) {
            console.error('Error resetting workflow:', error);
            throw error;
        }
    }
}

/**
 * Demo UI Controller
 */
class HILDemoUI {
    constructor() {
        this.api = new HumanInTheLoopAPI();
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Listen for workflow state updates
        window.addEventListener('hilStateUpdate', (event) => {
            this.updateUI(event.detail);
        });

        // Initialize demo controls if elements exist
        this.setupDemoControls();
    }

    setupDemoControls() {
        const startBtn = document.getElementById('hil-start-workflow');
        const approveBtn = document.getElementById('hil-approve');
        const rejectBtn = document.getElementById('hil-reject');
        const resetBtn = document.getElementById('hil-reset');
        const codeInput = document.getElementById('hil-code-input');
        const statusDisplay = document.getElementById('hil-status');

        if (startBtn && codeInput) {
            startBtn.addEventListener('click', async () => {
                try {
                    const code = codeInput.value.trim();
                    if (!code) {
                        alert('Please enter some code to analyze');
                        return;
                    }

                    this.updateStatus('Starting workflow...');
                    const result = await this.api.startWorkflow(code);
                    this.updateStatus(`Workflow started: ${result.thread_id}`);
                    
                    if (result.status === 'paused_for_human_input') {
                        this.showApprovalButtons();
                    }
                } catch (error) {
                    this.updateStatus(`Error: ${error.message}`);
                }
            });
        }

        if (approveBtn) {
            approveBtn.addEventListener('click', async () => {
                try {
                    this.updateStatus('Approving step...');
                    const result = await this.api.approveStep(null, 'Approved via demo UI');
                    this.updateStatus(`Step approved: ${result.status}`);
                    
                    if (result.status !== 'paused_for_human_input') {
                        this.hideApprovalButtons();
                    }
                } catch (error) {
                    this.updateStatus(`Error: ${error.message}`);
                }
            });
        }

        if (rejectBtn) {
            rejectBtn.addEventListener('click', async () => {
                try {
                    this.updateStatus('Rejecting step...');
                    const result = await this.api.rejectStep(null, 'Rejected via demo UI');
                    this.updateStatus(`Step rejected: ${result.status}`);
                    this.hideApprovalButtons();
                } catch (error) {
                    this.updateStatus(`Error: ${error.message}`);
                }
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', async () => {
                try {
                    this.updateStatus('Resetting workflow...');
                    await this.api.resetWorkflow();
                    this.updateStatus('Workflow reset');
                    this.hideApprovalButtons();
                } catch (error) {
                    this.updateStatus(`Error: ${error.message}`);
                }
            });
        }
    }

    updateUI(state) {
        console.log('Updating UI with state:', state);
        
        if (state.pending_approval) {
            this.showApprovalButtons();
            this.updateStatus(`Waiting for approval: ${state.interrupt_message || 'Please review'}`);
        } else {
            this.hideApprovalButtons();
        }
    }

    updateStatus(message) {
        const statusDisplay = document.getElementById('hil-status');
        if (statusDisplay) {
            statusDisplay.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        }
        console.log('HIL Status:', message);
    }

    showApprovalButtons() {
        const approveBtn = document.getElementById('hil-approve');
        const rejectBtn = document.getElementById('hil-reject');
        
        if (approveBtn) approveBtn.style.display = 'inline-block';
        if (rejectBtn) rejectBtn.style.display = 'inline-block';
    }

    hideApprovalButtons() {
        const approveBtn = document.getElementById('hil-approve');
        const rejectBtn = document.getElementById('hil-reject');
        
        if (approveBtn) approveBtn.style.display = 'none';
        if (rejectBtn) rejectBtn.style.display = 'none';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HumanInTheLoopAPI, HILDemoUI };
}

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
    window.HumanInTheLoopAPI = HumanInTheLoopAPI;
    window.HILDemoUI = HILDemoUI;
    
    // Initialize demo UI when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.hilDemo = new HILDemoUI();
        });
    } else {
        window.hilDemo = new HILDemoUI();
    }
}