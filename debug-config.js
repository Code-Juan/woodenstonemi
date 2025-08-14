/**
 * Debug Configuration for The Wooden Stone Website
 * 
 * This file contains all debug settings and logging configurations
 * for development and troubleshooting.
 */

const debug = require('debug');

// Debug namespaces
const DEBUG_NAMESPACES = {
    // Image processing
    IMAGE_PROCESSOR: 'image-processor',
    IMAGE_OPTIMIZATION: 'image-optimization',
    IMAGE_WATCHER: 'image-watcher',

    // Server and development
    SERVER: 'server',
    DEV_SERVER: 'dev-server',

    // File operations
    FILE_OPERATIONS: 'file-operations',
    FILE_WATCHER: 'file-watcher',

    // Performance
    PERFORMANCE: 'performance',
    LOADING_TIMES: 'loading-times',

    // Errors and warnings
    ERRORS: 'errors',
    WARNINGS: 'warnings',

    // General application
    APP: 'app',
    ROUTING: 'routing'
};

// Debug configuration
const DEBUG_CONFIG = {
    // Enable all debug namespaces
    enableAll: () => {
        Object.values(DEBUG_NAMESPACES).forEach(namespace => {
            debug.enable(namespace);
        });
    },

    // Enable specific namespaces
    enable: (namespaces) => {
        if (Array.isArray(namespaces)) {
            namespaces.forEach(namespace => debug.enable(namespace));
        } else {
            debug.enable(namespaces);
        }
    },

    // Disable all debug
    disable: () => {
        debug.disable();
    },

    // Get debug instances
    getDebuggers: () => {
        const debuggers = {};
        Object.entries(DEBUG_NAMESPACES).forEach(([key, namespace]) => {
            debuggers[key] = debug(namespace);
        });
        return debuggers;
    }
};

// Performance monitoring
const PERFORMANCE_CONFIG = {
    // Enable performance logging
    enabled: process.env.NODE_ENV === 'development' || process.env.DEBUG_PERFORMANCE === 'true',

    // Log slow operations (in milliseconds)
    slowOperationThreshold: 1000,

    // Log memory usage
    logMemoryUsage: true,

    // Log image processing times
    logImageProcessing: true
};

// Error handling configuration
const ERROR_CONFIG = {
    // Log all errors to console
    logToConsole: true,

    // Log errors to file (if implemented)
    logToFile: false,

    // Include stack traces
    includeStackTraces: true,

    // Error reporting levels
    levels: {
        ERROR: 'error',
        WARN: 'warn',
        INFO: 'info',
        DEBUG: 'debug'
    }
};

// Development server configuration
const DEV_SERVER_CONFIG = {
    port: process.env.PORT || 8000,
    host: process.env.HOST || '127.0.0.1',
    enableCORS: true,
    enableCompression: true,
    enableCache: false, // Disable cache in development
    logRequests: true,
    logErrors: true
};

module.exports = {
    DEBUG_NAMESPACES,
    DEBUG_CONFIG,
    PERFORMANCE_CONFIG,
    ERROR_CONFIG,
    DEV_SERVER_CONFIG
};
