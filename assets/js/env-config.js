// Environment configuration for the Code Comprehension Project
window.ENV = {
  // Backend API URLs
  BACKEND_API_URL: 'http://localhost:5000',
  
  // Frontend configuration
  FRONTEND_URL: window.location.origin,
  
  // API endpoints
  API_ENDPOINTS: {
    diagnosis: '/api/v1/diagnosis',
    simulation: '/api/v1/simulation',
    data: '/api/v1/data',
    config: '/api/v1/config'
  },
  
  // Feature flags
  FEATURES: {
    error_diagnosis: true,
    ai_refactoring: true,
    performance_tracking: true
  }
};

// Auto-detect environment and adjust settings
if (window.location.hostname === 'carsontkempf.github.io') {
  // Production environment
  window.ENV.BACKEND_API_URL = 'https://your-backend-server.com';
} else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  // Development environment
  window.ENV.BACKEND_API_URL = 'http://localhost:5000';
}

console.log('Environment loaded:', window.ENV);