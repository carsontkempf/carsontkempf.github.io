---
layout: post
title: "Chrome-Extension"
date: 2025-05-24 20:57:40 -0000
categories: [Extensions]
permalink: /Chrome-Extension/
---

### [Check out our extension!](https://chromewebstore.google.com/detail/chrome-to-do-list/cjbofglecjgeekcimjbcdkkfiiapnmmj?utm_source=item-share-cb)



# Todo List Extension

## Project Structure

```
root/
├ manifest.json
├ images/ *.png
├ sounds/slot_machine_payout.wav
├ templates/ todo.html, dashboard.html
├ styles/ todo.css, dashboard.css
├ scripts/
├ load-templates.js
├ todo.js
└ dashboard.js
```

---

## Data Structures

| Var | File | Type | Purpose |
|----|----|----|----|
| `tasks` | todo.js | `Array<{title,url}>` | persisted |
| `timers` | dashboard.js | `Array<Timer>` | runtime |

---

## Core Functions

| File | Function | Role |
|------|----------|------|
| load-templates.js | inject templates |
| todo.js | waitForDocumentLoad · loadTasks · saveTasks · renderTasks · handleAddButton |
| dashboard.js | formatTime · tickTimer · renderTimers · waitForElement |

---

## Features

| Priority | Feature |
|----------|---------|
| ★★★ | Site blocker |
| ★★★ | Tag filter UI |
| ★★ | Stopwatch mode |
| ★★ | Productivity charts |
| ★ | Cloud sync |
| ★ | Collaboration

---

# Develop with us!

1. `chrome://extensions` → **Developer Mode** ON  
2. **Load unpacked** → select project root  
3. Confirm *Chrome To‑Do List* v2.3 appears

### GitHub Repo:

[Main Branch](https://github.com/carsontkempf/S.E.-Capstone-I)

[Develop Branch](https://github.com/carsontkempf/S.E.-Capstone-I/tree/develop)