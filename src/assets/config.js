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
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
} else {
    // Make available globally for browser use
    window.appConfig = config;
}
