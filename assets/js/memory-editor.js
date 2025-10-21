/**
 * Memory Editor using EasyMDE for managing AI tool memory
 * Handles separate short-term and long-term memory files per tool/node
 */

class MemoryEditor {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.currentTool = null;
    this.currentMemoryType = null;
    this.editor = null;
    this.apiBaseUrl = options.apiBaseUrl || "http://localhost:5000/api/v1";

    // Debug logging
    console.log("MemoryEditor initialized with API URL:", this.apiBaseUrl);

    if (!this.container) {
      console.error("Container element not found:", containerId);
      return;
    }

    this.init();
  }

  init() {
    this.createUI();
    this.setupEventListeners();
  }

  createUI() {
    this.container.innerHTML = `
            <div class="memory-editor-wrapper">
                <div class="memory-controls">
                    <div class="tool-selector">
                        <label for="tool-select">AI Tool/Node:</label>
                        <select id="tool-select">
                            <option value="">Select a tool...</option>
                            <option value="node-1">Node 1: Ingest Baseline</option>
                            <option value="node-2">Node 2: Perplexity Router</option>
                            <option value="node-3">Node 3: Strategy Prediction</option>
                            <option value="node-4">Node 4: Targeted Execution</option>
                            <option value="node-5">Node 5: Measure & Learn</option>
                            <option value="error-categorization">Error Categorization Agent</option>
                            <option value="error-diagnosis">Error Diagnosis Agent</option>
                        </select>
                    </div>
                    
                    <div class="memory-type-selector">
                        <label>Memory Type:</label>
                        <div class="radio-group">
                            <input type="radio" id="short-term" name="memory-type" value="short-term">
                            <label for="short-term">Short-term Memory</label>
                            <input type="radio" id="long-term" name="memory-type" value="long-term">
                            <label for="long-term">Long-term Memory</label>
                        </div>
                    </div>
                    
                    <div class="memory-actions">
                        <button id="toggle-view" disabled>Toggle Preview</button>
                        <button id="save-backend" disabled>Save in Backend</button>
                    </div>
                </div>
                
                <div class="memory-status">
                    <span id="memory-status-text">Select a tool and memory type to begin</span>
                </div>
                
                <div class="memory-editor-container">
                    <textarea id="memory-editor-textarea" placeholder="Memory content will appear here..."></textarea>
                </div>
            </div>
        `;
  }

  setupEventListeners() {
    const toolSelect = document.getElementById("tool-select");
    const memoryTypeRadios = document.querySelectorAll(
      'input[name="memory-type"]'
    );
    const toggleViewBtn = document.getElementById("toggle-view");
    const saveBackendBtn = document.getElementById("save-backend");

    toolSelect.addEventListener("change", () => {
      this.currentTool = toolSelect.value;
      this.updateControlsState();
      if (this.currentTool && this.currentMemoryType) {
        this.loadMemory();
      }
    });

    memoryTypeRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        this.currentMemoryType = radio.value;
        this.updateControlsState();
        if (this.currentTool && this.currentMemoryType) {
          this.loadMemory();
        }
      });
    });

    toggleViewBtn.addEventListener("click", () => this.toggleView());
    saveBackendBtn.addEventListener("click", () => this.saveMemory());
  }

  updateControlsState() {
    const canOperate = this.currentTool && this.currentMemoryType;
    const toggleViewBtn = document.getElementById("toggle-view");
    const saveBackendBtn = document.getElementById("save-backend");

    toggleViewBtn.disabled = !canOperate;
    saveBackendBtn.disabled = !canOperate;

    if (canOperate && !this.editor) {
      this.initializeEditor();
    }
  }

  initializeEditor() {
    if (this.editor) {
      this.editor.toTextArea();
      this.editor = null;
    }

    const textarea = document.getElementById("memory-editor-textarea");
    this.editor = new EasyMDE({
      toolbar: ["preview"],
      element: textarea,
      placeholder: `Enter ${this.currentMemoryType} memory for ${this.currentTool}...`,
      spellChecker: false,
      autofocus: true,
      status: false,
      autosave: {
        enabled: true,
        uniqueId: `memory-${this.currentTool}-${this.currentMemoryType}`,
        delay: 5000,
        text: "Auto-saved: ",
      },
    });

    // Default to preview mode
    setTimeout(() => {
      if (this.editor && !this.editor.isPreviewActive()) {
        this.editor.togglePreview();
      }
    }, 100);

    // Auto-save on changes
    this.editor.codemirror.on("change", () => {
      if (this.autoSaveTimeout) {
        clearTimeout(this.autoSaveTimeout);
      }
      this.autoSaveTimeout = setTimeout(() => {
        this.saveMemory(true); // Silent save
      }, 10000);
    });
  }

  async loadMemory() {
    if (!this.currentTool || !this.currentMemoryType) return;

    this.setStatus("Loading memory...", "info");

    try {
      console.log(
        `Loading memory from: ${this.apiBaseUrl}/memory/${this.currentTool}/${this.currentMemoryType}`
      );

      const response = await fetch(
        `${this.apiBaseUrl}/memory/${this.currentTool}/${this.currentMemoryType}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const content = data.content || "";

        if (this.editor) {
          this.editor.value(content);
        }

        this.setStatus(
          `Loaded ${this.currentMemoryType} memory for ${this.currentTool}`,
          "success"
        );
        console.log("Memory loaded successfully:", data);
      } else if (response.status === 404) {
        // Memory file doesn't exist yet
        if (this.editor) {
          this.editor.value(
            "# New Memory File\n\nThis is a new memory file. Start adding content here..."
          );
        }
        this.setStatus(
          `No existing ${this.currentMemoryType} memory found for ${this.currentTool} - created new file`,
          "info"
        );
      } else {
        throw new Error(
          `Failed to load memory: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error loading memory:", error);

      // Fallback to local storage or demo content
      if (this.editor) {
        const fallbackContent = this.getFallbackContent();
        this.editor.value(fallbackContent);
      }

      this.setStatus(
        `Backend not available - working in offline mode. Error: ${error.message}`,
        "error"
      );
    }
  }

  async saveMemory(silent = false) {
    if (!this.currentTool || !this.currentMemoryType || !this.editor) return;

    if (!silent) {
      this.setStatus("Saving memory...", "info");
    }

    try {
      const content = this.editor.value();
      console.log(
        `Saving memory to: ${this.apiBaseUrl}/memory/${this.currentTool}/${this.currentMemoryType}`
      );

      const response = await fetch(
        `${this.apiBaseUrl}/memory/${this.currentTool}/${this.currentMemoryType}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (!silent) {
          this.setStatus(
            `Saved ${this.currentMemoryType} memory for ${this.currentTool}`,
            "success"
          );
        }
        console.log("Memory saved successfully:", data);

        // Also save to localStorage as backup
        this.saveToLocalStorage(content);
      } else {
        throw new Error(
          `Failed to save memory: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error saving memory:", error);

      // Save to localStorage as fallback
      const content = this.editor.value();
      this.saveToLocalStorage(content);

      this.setStatus(
        `Backend not available - saved locally. Error: ${error.message}`,
        "error"
      );
    }
  }

  getFallbackContent() {
    // Try to load from localStorage first
    const localContent = this.loadFromLocalStorage();
    if (localContent) {
      return localContent;
    }

    // Default content based on tool and memory type
    const toolContent = {
      "error-categorization": {
        "long-term":
          "# Error Categorization - Long Term Memory\n\n## Refactoring Taxonomy\n\nThis agent specializes in categorizing code errors and suggesting appropriate refactoring strategies.\n\n### Key Patterns:\n- Extract Method\n- Extract Class\n- Rename Variable\n- Inline Method\n\n### Error Types:\n- Syntax Errors\n- Logic Errors\n- Naming Issues\n- Structural Problems",
        "short-term":
          "# Error Categorization - Short Term Memory\n\n## Current Session Context\n\n- Current task: [Describe current analysis task]\n- Recent errors encountered: [List recent error patterns]\n- Working patterns: [Note effective strategies]",
      },
      "node-1": {
        "long-term":
          "# Node 1: Ingest Baseline - Long Term Memory\n\n## Purpose\nIngests baseline code and establishes initial analysis state.\n\n## Key Responsibilities:\n- Code validation\n- Baseline metric calculation\n- Session initialization",
        "short-term":
          "# Node 1: Ingest Baseline - Short Term Memory\n\n## Current Session\n- Latest code submission: [timestamp]\n- Baseline metrics: [metrics]\n- Session status: [status]",
      },
    };

    const toolKey = this.currentTool || "error-categorization";
    const memoryKey = this.currentMemoryType || "long-term";

    return (
      toolContent[toolKey]?.[memoryKey] ||
      `# ${this.currentTool} - ${this.currentMemoryType} Memory\n\nThis is a new memory file for ${this.currentTool}.\n\nAdd your content here...`
    );
  }

  saveToLocalStorage(content) {
    if (!this.currentTool || !this.currentMemoryType) return;

    const key = `memory_${this.currentTool}_${this.currentMemoryType}`;
    try {
      localStorage.setItem(key, content);
      console.log("Saved to localStorage:", key);
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }

  loadFromLocalStorage() {
    if (!this.currentTool || !this.currentMemoryType) return null;

    const key = `memory_${this.currentTool}_${this.currentMemoryType}`;
    try {
      const content = localStorage.getItem(key);
      if (content) {
        console.log("Loaded from localStorage:", key);
      }
      return content;
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      return null;
    }
  }

  toggleView() {
    if (!this.editor) return;

    const isPreview = this.editor.isPreviewActive();
    if (isPreview) {
      this.editor.togglePreview();
      document.getElementById("toggle-view").textContent = "Toggle Preview";
    } else {
      this.editor.togglePreview();
      document.getElementById("toggle-view").textContent = "Toggle Edit";
    }
  }

  setStatus(message, type = "info") {
    const statusEl = document.getElementById("memory-status-text");
    statusEl.textContent = message;
    statusEl.className = `status-${type}`;

    // Clear status after 5 seconds
    setTimeout(() => {
      statusEl.textContent = "Ready";
      statusEl.className = "";
    }, 5000);
  }

  destroy() {
    if (this.editor) {
      this.editor.toTextArea();
      this.editor = null;
    }
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }
  }
}

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = MemoryEditor;
}

// Global access
window.MemoryEditor = MemoryEditor;
