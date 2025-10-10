// Main application entry point
import Header from './components/header.js';
import Footer from './components/footer.js';
import SimulationView from './views/simulation-view.js';
import config from './config.js';

class App {
    constructor() {
        this.header = null;
        this.footer = null;
        this.currentView = null;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        console.log('Initializing Code Comprehension Frontend...');
        
        // Create main app structure
        this.createAppStructure();
        
        // Initialize components
        this.initializeHeader();
        this.initializeFooter();
        
        // Load initial view
        this.loadSimulationView();
        
        // Start health monitoring
        this.startHealthMonitoring();
        
        console.log('Code Comprehension Frontend initialized successfully');
    }

    createAppStructure() {
        const body = document.body;
        
        // Clear existing content
        body.innerHTML = '';
        
        // Create main app container
        const appContainer = document.createElement('div');
        appContainer.id = 'app';
        appContainer.className = 'app-container';
        
        // Create header container
        const headerContainer = document.createElement('div');
        headerContainer.id = 'header-container';
        headerContainer.className = 'header-container';
        
        // Create main content container
        const mainContainer = document.createElement('main');
        mainContainer.id = 'main-container';
        mainContainer.className = 'main-container';
        
        // Create footer container
        const footerContainer = document.createElement('div');
        footerContainer.id = 'footer-container';
        footerContainer.className = 'footer-container';
        
        // Append to app container
        appContainer.appendChild(headerContainer);
        appContainer.appendChild(mainContainer);
        appContainer.appendChild(footerContainer);
        
        // Append to body
        body.appendChild(appContainer);
    }

    initializeHeader() {
        this.header = new Header();
        const headerContainer = document.getElementById('header-container');
        headerContainer.appendChild(this.header.getElement());
    }

    initializeFooter() {
        this.footer = new Footer();
        const footerContainer = document.getElementById('footer-container');
        footerContainer.appendChild(this.footer.getElement());
    }

    loadSimulationView() {
        // Clear main container
        const mainContainer = document.getElementById('main-container');
        mainContainer.innerHTML = '<div id="simulation-container"></div>';
        
        // Load simulation view
        this.currentView = new SimulationView('simulation-container');
    }

    startHealthMonitoring() {
        // Monitor remote backend connection and update footer status
        setInterval(async () => {
            try {
                const response = await fetch(`${config.api.baseUrl}/api/v1/health`);
                const isConnected = response.ok;
                
                if (this.footer) {
                    this.footer.updateBackendStatus(isConnected);
                }
                
                if (!isConnected) {
                    console.warn('Remote backend connection lost');
                }
            } catch (error) {
                console.warn('Remote backend health check failed:', error.message);
                if (this.footer) {
                    this.footer.updateBackendStatus(false);
                }
            }
        }, 30000); // Check every 30 seconds
    }

    // View navigation methods
    switchToView(viewName) {
        const mainContainer = document.getElementById('main-container');
        
        // Destroy current view
        if (this.currentView && typeof this.currentView.destroy === 'function') {
            this.currentView.destroy();
        }
        
        // Clear container
        mainContainer.innerHTML = '';
        
        switch (viewName) {
            case 'simulation':
                mainContainer.innerHTML = '<div id="simulation-container"></div>';
                this.currentView = new SimulationView('simulation-container');
                break;
            case 'prompt-editor':
                // TODO: Implement PromptEditorView
                mainContainer.innerHTML = '<div>Prompt Editor View - Coming Soon</div>';
                break;
            case 'data-visualization':
                // TODO: Implement DataVisualizationView
                mainContainer.innerHTML = '<div>Data Visualization View - Coming Soon</div>';
                break;
            case 'settings':
                // TODO: Implement SettingsView
                mainContainer.innerHTML = '<div>Settings View - Coming Soon</div>';
                break;
            default:
                this.loadSimulationView();
                break;
        }
    }
}

// Global app instance
window.CodeComprehensionApp = new App();

export default App;