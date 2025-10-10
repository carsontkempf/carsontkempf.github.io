# Code Comprehension Project - Frontend

AI-powered code analysis and refactoring system frontend interface.

## Overview

This is the frontend component of the Code Comprehension Project, designed to interact with a remote Flask backend server that provides AI-powered code analysis, refactoring, and improvement capabilities.

## Architecture

```
dashboards/code-comprehension/
├── src/                          # Source code
│   ├── app.js                   # Main application entry point
│   ├── config.js                # Configuration and API endpoints
│   ├── components/              # Reusable UI components
│   │   ├── header.js           # Application header
│   │   ├── footer.js           # Application footer
│   │   └── health-meter.js     # Health visualization component
│   ├── services/               # API client services
│   │   ├── simulation-api.js   # Simulation control endpoints
│   │   ├── data-api.js         # Data management endpoints
│   │   └── config-api.js       # Configuration endpoints
│   ├── views/                  # Main application pages
│   │   ├── simulation-view.js  # Simulation control interface
│   │   ├── prompt-editor-view.js (planned)
│   │   ├── data-visualization-view.js (planned)
│   │   └── settings-view.js (planned)
│   └── tests/                  # Unit tests (planned)
├── public/                     # Static assets
│   └── index.html             # Main HTML page
├── package.json               # Project dependencies
└── README.md                 # This file
```

## Features

### Current Features
- **Simulation Control**: Run code analysis cycles, reset sessions, resimulate from checkpoints
- **Health Monitoring**: Visual health meters showing code quality metrics
- **Real-time Logging**: Live simulation logs with filtering and export
- **Backend Integration**: Full API integration with remote Flask server

### Planned Features
- **Prompt Editor**: Visual prompt customization and annotation tools
- **Data Visualization**: Interactive trees, charts, and statistics
- **Settings Management**: Configuration of analysis parameters and variables
- **Advanced Metrics**: Detailed performance and improvement tracking

## Backend API Integration

The frontend communicates with a remote Flask backend server via REST API:

### API Endpoints

#### Simulation & Core Control
- `POST /api/v1/simulation/run` - Execute simulation cycle
- `POST /api/v1/simulation/resimulate/<thread_id>` - Resimulate from checkpoint
- `POST /api/v1/simulation/reset` - Reset session
- `GET /api/v1/simulation/state/<thread_id>` - Get simulation state
- `GET /api/v1/simulation/log/<thread_id>` - Get simulation log
- `POST /api/v1/simulation/set_genetic_code` - Update system prompt
- `POST /api/v1/simulation/set_baseline_health` - Update health metrics

#### Data & Catalog Management
- `GET /api/v1/data/prompts/all` - Get prompt catalog
- `POST /api/v1/data/prompts/update/<prompt_id>` - Update prompt
- `GET /api/v1/data/memory/permanent` - Get permanent vaccinations
- `POST /api/v1/data/memory/temp` - Update temporary vaccinations
- `GET /api/v1/data/statistics/all` - Get performance statistics
- `GET /api/v1/data/refactoring_tree` - Get refactoring tree
- `POST /api/v1/data/save_snapshot/<thread_id>` - Save state snapshot

#### Configuration & Variables
- `GET /api/v1/config/variables/all` - Get available variables
- `POST /api/v1/config/variables/select` - Select variable for tool
- `GET /api/v1/config/analysis/all` - Get analysis configuration

## Configuration

Update the backend server URL in `src/config.js`:

```javascript
const config = {
    api: {
        baseUrl: 'https://your-backend-server.com',
        // ... rest of config
    }
};
```

## Development

### Frontend-Only Development

This is a pure frontend project that connects to a remote backend server. No local backend setup required.

#### Local Development
```bash
# Start Jekyll development server
JEKYLL_ENV=development bundle exec jekyll serve --config _config-dev.yml

# Access the application at:
# http://localhost:4000/code-comprehension/
```

#### Production Mode
```bash
# Start Jekyll in production mode
JEKYLL_ENV=production bundle exec jekyll serve --config _config.yml
```

### Backend Configuration

Update the remote backend URL in `src/config.js`:

```javascript
const config = {
    api: {
        baseUrl: 'https://your-remote-backend-server.com',
        // ... rest of config
    }
};
```

The frontend expects your remote backend to provide the following API endpoints:
- Simulation control (`/api/v1/simulation/*`)
- Data management (`/api/v1/data/*`)
- Configuration (`/api/v1/config/*`)

### File Structure
- Use lowercase-hyphen naming convention for all files
- ES6 modules with `.js` extensions
- Vanilla JavaScript (no framework dependencies)
- Responsive CSS with modern features

### Code Style
- ES6+ JavaScript features
- Async/await for API calls
- Class-based components
- Event-driven architecture

## Integration with Jekyll

This frontend integrates with the existing Jekyll site structure:

- Accessible via `/code-comprehension/` permalink
- Uses existing authentication system
- Inherits site styling and navigation
- Maintains responsive design consistency

## Deployment

The frontend is static and deploys with the Jekyll site:

1. Files are served directly by GitHub Pages
2. No build process required
3. Backend URL configured for production environment
4. CORS configured on backend for frontend domain

## Future Enhancements

1. **Progressive Web App (PWA)** features
2. **Real-time WebSocket** connections for live updates
3. **Advanced visualizations** with D3.js or similar
4. **Code editor integration** with syntax highlighting
5. **Offline capabilities** for cached data
6. **Mobile-optimized** interface improvements

## License

MIT License - see main repository for details.