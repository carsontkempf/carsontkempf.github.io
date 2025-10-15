// Frontend configuration for Code Comprehension Project
const config = {
    // Backend API configuration
    api: {
        baseUrl: 'http://131.151.90.18:5000',
        endpoints: {
            // Simulation & Core Control
            simulation: {
                run: '/api/v1/simulation/run',
                resimulate: '/api/v1/simulation/resimulate',
                reset: '/api/v1/simulation/reset',
                state: '/api/v1/simulation/state',
                log: '/api/v1/simulation/log',
                setGeneticCode: '/api/v1/simulation/set_genetic_code',
                setBaselineHealth: '/api/v1/simulation/set_baseline_health'
            },
            // Data & Catalog Management
            data: {
                promptsAll: '/api/v1/data/prompts/all',
                promptsUpdate: '/api/v1/data/prompts/update',
                memoryPermanent: '/api/v1/data/memory/permanent',
                memoryTemp: '/api/v1/data/memory/temp',
                statisticsAll: '/api/v1/data/statistics/all',
                refactoringTree: '/api/v1/data/refactoring_tree',
                saveSnapshot: '/api/v1/data/save_snapshot'
            },
            // Configuration & Variables
            config: {
                variablesAll: '/api/v1/config/variables/all',
                variablesSelect: '/api/v1/config/variables/select',
                analysisAll: '/api/v1/config/analysis/all'
            }
        }
    },
    
    // Default values
    defaults: {
        temperature: 0.7,
        maxTokens: 1000,
        complexityThreshold: 0.5,
        errorWeight: 0.3,
        refactorDepth: 2
    },
    
    // UI settings
    ui: {
        healthMeterUpdateInterval: 1000,
        maxLogEntries: 100,
        autoSaveInterval: 30000,
        treeVisualizationDepth: 5
    },
    
    // Feature flags
    features: {
        realTimeUpdates: true,
        advancedMetrics: true,
        experimentalTools: false
    }
};

export default config;