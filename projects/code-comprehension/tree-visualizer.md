---
layout: code-comprehension
title: Tree Visualizer
permalink: /code-comprehension/tree-visualizer/
auth_success_callback: initializeTreeVisualizerPage
external_dependencies:
  - type: script
    src: https://cdnjs.cloudflare.com/ajax/libs/raphael/2.3.0/raphael.min.js
  - type: script
    src: https://cdn.jsdelivr.net/npm/treant-js@1.0.0/Treant.js
  - type: style
    href: https://cdn.jsdelivr.net/npm/treant-js@1.0.0/Treant.css
styles:
  - components/code-comprehension/tree-visualizer/styles.html
content_includes:
  - components/code-comprehension/tree-visualizer/content.html
custom_js:
  - /assets/js/code-comprehension/tree-visualizer.js
---