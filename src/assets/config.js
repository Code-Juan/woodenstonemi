// Configuration for API endpoints
const config = {
    // Automatically detect environment and use appropriate backend URL
    apiUrl: window.location.hostname === 'localhost' 
        ? 'http://localhost:3000' 
        : 'https://wooden-stone-backend.onrender.com',
    
    // Environment detection
    isDevelopment: window.location.hostname === 'localhost',
    isProduction: window.location.hostname === 'woodenstonemi.com' || window.location.hostname === 'www.woodenstonemi.com',
    
    // API endpoints
    endpoints: {
        contact: '/api/contact',
        health: '/api/contact/health'
    },
    
    // Google Analytics 4 Configuration
    ga4MeasurementId: 'G-SSW2QFJYGW',
    
    // Tawk.to Live Chat Configuration
    tawkToPropertyId: '6978d91335a2d2198418d18e',
    tawkToWidgetId: '1jg00vt28',
    tawkToApiKey: 'ddf975d22553c51d9bae63b315c22700009c4a3b'
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
} else {
    // Make available globally for browser use
    window.appConfig = config;
}
