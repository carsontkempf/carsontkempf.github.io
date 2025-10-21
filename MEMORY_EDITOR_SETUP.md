# AI Memory Editor - Setup & Usage Guide

## ✅ Implementation Complete

Your AI Memory Editor has been successfully implemented and integrated into your Jekyll code comprehension project.

## 🚀 Quick Start

### 1. Start the Backend Server
```bash
cd backends/Error-Annotater
python run.py --host 127.0.0.1 --port 5001
```

### 2. Start the Jekyll Site
```bash
bundle exec jekyll serve --host 0.0.0.0 --port 4000
```

### 3. Access the Memory Editor
Visit: `http://localhost:4000/code-comprehension/memory-editor/`

## 📁 Project Structure

### Frontend (Jekyll Site)
```
assets/
├── css/memory-editor.css          # Memory editor styling
└── js/memory-editor.js            # Memory editor JavaScript component

dashboards/code-comprehension/
└── memory-editor.md               # Memory editor page

_data/
└── api.yml                        # API configuration
```

### Backend (Flask API)
```
backends/Error-Annotater/
├── flask_api/entrypoints/
│   └── memory_routes.py           # Memory management API routes
└── data/memory/                   # Memory storage directory
    ├── error-categorization/
    │   ├── long-term/memory.md    # Refactoring taxonomy
    │   └── short-term/memory.md
    ├── error-diagnosis/
    │   ├── long-term/memory.md    # Error diagnosis patterns
    │   └── short-term/memory.md
    └── node-{1-5}/
        ├── long-term/memory.md    # Node-specific knowledge
        └── short-term/memory.md
```

## 🔧 Key Features

### Memory Management
- **Long-term Memory**: Persistent knowledge, patterns, and taxonomies
- **Short-term Memory**: Temporary context and session-specific information
- **Tool-specific Storage**: Separate memory for each AI component
- **Version Control**: Automatic metadata tracking and versioning

### Editor Features
- **EasyMDE Integration**: Full-featured markdown editor
- **Auto-save**: Automatic saving with configurable intervals
- **Offline Mode**: LocalStorage fallback when backend unavailable
- **Search**: Full-text search across all memory files
- **Real-time Status**: Live feedback on operations

### API Endpoints
```
GET    /api/v1/memory/<tool_id>/<memory_type>     # Get memory content
POST   /api/v1/memory/<tool_id>/<memory_type>     # Save memory content
DELETE /api/v1/memory/<tool_id>/<memory_type>     # Delete memory
GET    /api/v1/memory/list                        # List all memories
POST   /api/v1/memory/search                      # Search memories
```

## 🎯 Available Tools/Nodes

1. **node-1**: Ingest Baseline Agent
2. **node-2**: Perplexity Router Agent  
3. **node-3**: Strategy Prediction Agent
4. **node-4**: Targeted Execution Agent
5. **node-5**: Measure & Learn Agent
6. **error-categorization**: Error Categorization Agent
7. **error-diagnosis**: Error Diagnosis Agent

## 📖 Pre-loaded Content

### Error Categorization - Long Term Memory
Contains comprehensive refactoring taxonomy:
- Extract Class/Method/Variable patterns
- Inline Method/Variable strategies
- Rename operations (Attribute/Method/Parameter/Variable)
- Usage guidelines and templates

### Node-specific Memories
Each processing node has detailed documentation of:
- Purpose and responsibilities
- Key patterns and learnings
- Integration points
- Error handling strategies

## 🔍 Testing

### Test File
A standalone test page is available at: `memory-editor-test.html`

### Manual Testing
1. Select a tool from the dropdown
2. Choose memory type (short-term/long-term)
3. Click "Load Memory" to retrieve existing content
4. Edit content using the markdown editor
5. Click "Save Memory" to persist changes

### API Testing
```bash
# Test health endpoint
curl http://localhost:5001/api/health

# List all memories
curl http://localhost:5001/api/v1/memory/list

# Get specific memory
curl http://localhost:5001/api/v1/memory/error-categorization/long-term
```

## 🛡️ Error Handling

### Backend Unavailable
- Editor falls back to localStorage
- Shows offline mode status
- Provides default content templates

### Network Issues
- Automatic retry mechanism
- Clear error messaging
- Graceful degradation

### Validation
- JSON validation for API requests
- Content validation before saving
- User-friendly error messages

## 🔧 Configuration

### API URL Configuration
Edit `_data/api.yml` to change backend URL:
```yaml
base_url: "http://localhost:5001/api/v1"
```

### Port Configuration
- Backend: Default port 5001 (configurable via `--port`)
- Frontend: Default port 4000 (Jekyll standard)

## 🎨 Customization

### Styling
Modify `assets/css/memory-editor.css` for custom styling.

### Functionality
Extend `assets/js/memory-editor.js` for additional features.

### Memory Templates
Add new tool templates in the `getFallbackContent()` function.

## 🚨 Troubleshooting

### Port 5000 Already in Use
```bash
# Use different port
python run.py --port 5001
```

### 404 Error on Memory Editor Page
- Ensure permalink is set: `/code-comprehension/memory-editor/`
- Check Jekyll build output for errors
- Verify file exists in `dashboards/code-comprehension/`

### CORS Issues
- Backend includes CORS headers for localhost
- Check browser console for specific errors
- Ensure both servers are running

### Authentication Issues
- Memory editor requires code-comprehension authentication
- Check user roles and permissions
- Verify Auth0 configuration

## 📈 Usage Analytics

The system tracks:
- Memory file creation/modification dates
- Content length and word counts
- Version numbers for change tracking
- Usage patterns per tool/node

## 🔮 Future Enhancements

Potential improvements:
- Real-time collaborative editing
- Memory diff visualization
- Automated backup to cloud storage
- Integration with external knowledge bases
- AI-powered content suggestions

---

## ✅ Verification Checklist

- [x] Backend server starts without errors
- [x] Frontend page loads without 404
- [x] EasyMDE editor initializes correctly
- [x] API endpoints respond properly
- [x] Memory files can be loaded and saved
- [x] Offline mode works with localStorage
- [x] Search functionality operates
- [x] Pre-loaded content exists and is accessible

Your AI Memory Editor is ready for use! 🎉