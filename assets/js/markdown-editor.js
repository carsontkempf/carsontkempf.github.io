/**
 * Simple Markdown Editor using EasyMDE
 * Minimal implementation with only preview toggle functionality
 */

class MarkdownEditor {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.editor = null;
    this.options = options;

    if (!this.container) {
      console.error("Container element not found:", containerId);
      return;
    }

    this.init();
  }

  init() {
    this.createUI();
    this.initializeEditor();
  }

  createUI() {
    this.container.innerHTML = `
            <div class="markdown-editor-wrapper">
                <div class="markdown-editor-container">
                    <textarea id="markdown-textarea" placeholder="Write your markdown here..."></textarea>
                </div>
            </div>
        `;
  }

  initializeEditor() {
    const textarea = document.getElementById("markdown-textarea");

    this.editor = new EasyMDE({
      toolbar: ["preview"], // Only show preview button
      element: textarea,
      placeholder: this.options.placeholder || "Write your markdown here...",
      spellChecker: false,
      autofocus: this.options.autofocus || false,
      status: false, // Hide status bar
      initialValue: this.options.initialValue || "",
      minHeight: this.options.minHeight || "300px",
      maxHeight: this.options.maxHeight || undefined,
      forceSync: true,
      sideBySideFullscreen: false,
    });

    // Default to preview mode
    setTimeout(() => {
      if (this.editor && !this.editor.isPreviewActive()) {
        this.editor.togglePreview();
      }
    }, 100);

    // Setup event listeners if provided
    if (this.options.onChange) {
      this.editor.codemirror.on("change", () => {
        this.options.onChange(this.getValue());
      });
    }
  }

  getValue() {
    return this.editor ? this.editor.value() : "";
  }

  setValue(value) {
    if (this.editor) {
      this.editor.value(value);
    }
  }

  togglePreview() {
    if (this.editor) {
      this.editor.togglePreview();
    }
  }

  isPreviewActive() {
    return this.editor ? this.editor.isPreviewActive() : false;
  }

  destroy() {
    if (this.editor) {
      this.editor.toTextArea();
      this.editor = null;
    }
  }

  // Static method to create editor on any textarea
  static createEditor(textareaSelector, options = {}) {
    const textarea = document.querySelector(textareaSelector);
    if (!textarea) {
      console.error("Textarea not found:", textareaSelector);
      return null;
    }

    const editor = new EasyMDE({
      toolbar: ["preview"],
      element: textarea,
      placeholder: options.placeholder || "Write your markdown here...",
      spellChecker: false,
      autofocus: options.autofocus || false,
      status: false,
      initialValue: options.initialValue || "",
      minHeight: options.minHeight || "300px",
      maxHeight: options.maxHeight || undefined,
      forceSync: true,
      sideBySideFullscreen: false,
      ...options,
    });

    // Default to preview mode
    setTimeout(() => {
      if (editor && !editor.isPreviewActive()) {
        editor.togglePreview();
      }
    }, 100);

    return editor;
  }
}

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = MarkdownEditor;
}

// Global access
window.MarkdownEditor = MarkdownEditor;
