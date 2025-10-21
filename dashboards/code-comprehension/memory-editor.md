---
layout: code-comprehension
title: "AI Memory Editor"
description: "Manage short-term and long-term memory for AI tools and nodes"
permalink: /code-comprehension/memory-editor/
content_wrapper_id: "memory-editor-wrapper"
auth_success_callback: "initializeMemoryEditor"
external_dependencies:
  - type: style
    href: "https://cdn.jsdelivr.net/npm/easymde/dist/easymde.min.css"
  - type: style
    href: "/assets/css/memory-editor.css"
  - type: script
    src: "https://cdn.jsdelivr.net/npm/easymde/dist/easymde.min.js"
custom_js:
  - "/assets/js/memory-editor.js"
back_url: "/code-comprehension/"
back_text: "← Back to Code Comprehension"
---

# AI Memory Editor

Manage short-term and long-term memory files for each AI tool and node in the code comprehension system.

## Overview

Each AI tool and node in our system maintains two types of memory:

- **Short-term Memory**: Temporary context and recent learnings that are relevant for immediate processing
- **Long-term Memory**: Persistent knowledge and patterns that should be retained across sessions

## Memory Structure

The memory system organizes information by:

1. **Tool/Node Identifier**: Each component has a unique identifier
2. **Memory Type**: Short-term vs Long-term categorization
3. **Content Format**: Markdown format for easy editing and readability

## Usage Instructions

1. **Select a Tool/Node**: Choose from the dropdown which AI component's memory you want to edit
2. **Choose Memory Type**: Select either short-term or long-term memory
3. **Load Existing Memory**: Click "Load Memory" to retrieve existing content
4. **Edit Content**: Use the markdown editor to modify the memory content
5. **Save Changes**: Click "Save Memory" to persist your changes

## Memory Editor Interface

<div id="memory-editor-container"></div>

<script>
let memoryEditor;

function initializeMemoryEditor() {
    // Initialize the memory editor when auth is successful
    memoryEditor = new MemoryEditor('memory-editor-container', {
        apiBaseUrl: '{{ site.data.api.base_url | default: "http://localhost:5000/api/v1" }}'
    });
}

// Cleanup when leaving the page
window.addEventListener('beforeunload', () => {
    if (memoryEditor) {
        memoryEditor.destroy();
    }
});
</script>