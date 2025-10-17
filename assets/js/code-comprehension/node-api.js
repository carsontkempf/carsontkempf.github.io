/**
 * Node API Service - Handles all node-related API operations
 * For the 5-node circular processing system
 */

class NodeAPI {
  constructor() {
    this.baseURL = this.getAPIBaseURL();
  }

  getAPIBaseURL() {
    // Check if ENV is loaded from env-config.js
    if (typeof window !== 'undefined' && window.ENV) {
      return window.ENV.BACKEND_API_URL + window.ENV.API_ENDPOINTS.nodes;
    }
    // Fallback for development
    return 'http://127.0.0.1:5000/api/v1/node';
  }

  /**
   * Create input data for a specific node
   */
  async createInput(nodeId, inputData) {
    try {
      const response = await fetch(`${this.baseURL}/${nodeId}/input`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputData)
      });
      
      const data = await response.json();
      return { success: response.ok, data, status: response.status };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Read output data from a specific node
   */
  async readOutput(nodeId) {
    try {
      const response = await fetch(`${this.baseURL}/${nodeId}/output`, {
        method: 'GET'
      });
      
      const data = await response.json();
      return { success: response.ok, data, status: response.status };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update input data for a specific node
   */
  async updateInput(nodeId, inputData) {
    try {
      const response = await fetch(`${this.baseURL}/${nodeId}/input`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputData)
      });
      
      const data = await response.json();
      return { success: response.ok, data, status: response.status };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete output data from a specific node
   */
  async deleteOutput(nodeId) {
    try {
      const response = await fetch(`${this.baseURL}/${nodeId}/output`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      return { success: response.ok, data, status: response.status };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get status of all nodes
   */
  async getNodeStatus() {
    try {
      const response = await fetch(`${this.baseURL}/status`, {
        method: 'GET'
      });
      
      const data = await response.json();
      return { success: response.ok, data, status: response.status };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Reset the entire node system
   */
  async resetNodeSystem() {
    try {
      const response = await fetch(`${this.baseURL}/reset`, {
        method: 'POST'
      });
      
      const data = await response.json();
      return { success: response.ok, data, status: response.status };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Chain nodes together - take output from one node and feed to next
   */
  async chainNodes(fromNodeId, toNodeId) {
    try {
      // Get output from source node
      const outputResult = await this.readOutput(fromNodeId);
      if (!outputResult.success) {
        return outputResult;
      }

      // Transform output data to input format for next node
      const transformedData = this.transformNodeData(outputResult.data, fromNodeId, toNodeId);

      // Send to next node as input
      const inputResult = await this.createInput(toNodeId, transformedData);
      return inputResult;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Transform data between nodes (can be customized per node pair)
   */
  transformNodeData(data, fromNodeId, toNodeId) {
    // Basic transformation - in a real implementation, 
    // this would contain specific transformation logic for each node pair
    const transformedData = {
      timestamp: new Date().toISOString(),
      source_node: fromNodeId,
      transformed_for: toNodeId,
      original_data: data
    };

    // Add node-specific transformations
    switch (`${fromNodeId}->${toNodeId}`) {
      case '1->2':
        // Node 1 to Node 2: Baseline to Perplexity Router
        transformedData.baseline_results = data.baseline_metrics || {};
        transformedData.routing_config = data.routing_config || {};
        break;
      case '2->3':
        // Node 2 to Node 3: Router to Strategy Prediction
        transformedData.model_output = data;
        transformedData.strategy_params = {};
        break;
      case '3->4':
        // Node 3 to Node 4: Strategy to Execution
        transformedData.execution_strategy = data.predicted_strategies || [];
        transformedData.target_code = data.target_code || '';
        break;
      case '4->5':
        // Node 4 to Node 5: Execution to Measurement
        transformedData.execution_results = data;
        transformedData.measurement_config = {};
        break;
      case '5->1':
        // Node 5 to Node 1: Measurement back to Baseline (new cycle)
        transformedData.feedback_data = data.feedback_for_next_cycle || {};
        break;
      default:
        // Generic transformation
        break;
    }

    return transformedData;
  }
}

// Create global instance
window.NodeAPI = new NodeAPI();