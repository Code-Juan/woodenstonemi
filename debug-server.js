#!/usr/bin/env node

/**
 * Enhanced Debug Development Server
 * 
 * This server provides comprehensive debugging and monitoring for the website
 * during development, including request logging, performance monitoring,
 * and error tracking.
 * 
 * Usage:
 * - node debug-server.js (basic debug)
 * - DEBUG=* node debug-server.js (full debug)
 * - NODE_ENV=development node debug-server.js (development mode)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { DEBUG_CONFIG, PERFORMANCE_CONFIG, ERROR_CONFIG, DEV_SERVER_CONFIG } = require('./debug-config');

// Initialize debug loggers
const debuggers = DEBUG_CONFIG.getDebuggers();
const serverDebug = debuggers.SERVER;
const perfDebug = debuggers.PERFORMANCE;
const errorDebug = debuggers.ERRORS;

// Server statistics
const serverStats = {
    requests: 0,
    errors: 0,
    startTime: Date.now(),
    requestTimes: [],
    slowRequests: []
};

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
};

// Performance monitoring
function withPerformanceTracking(operation, callback) {
    return async (...args) => {
        const startTime = process.hrtime.bigint();

        try {
            serverDebug(`Starting operation: ${operation}`);
            const result = await callback(...args);

            const endTime = process.hrtime.bigint();
            const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds

            perfDebug(`${operation} completed in ${duration.toFixed(2)}ms`);

            if (duration > PERFORMANCE_CONFIG.slowOperationThreshold) {
                perfDebug(`⚠️  Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`);
            }

            return result;
        } catch (error) {
            const endTime = process.hrtime.bigint();
            const duration = Number(endTime - startTime) / 1000000;

            errorDebug(`❌ ${operation} failed after ${duration.toFixed(2)}ms:`, error.message);
            serverStats.errors++;
            throw error;
        }
    };
}

// File serving with debug logging
async function serveFile(filePath, res) {
    return withPerformanceTracking(`serveFile(${path.basename(filePath)})`, async () => {
        try {
            // Check if file exists
            if (!fs.existsSync(filePath)) {
                serverDebug(`File not found: ${filePath}`);
                return false;
            }

            // Get file stats
            const stats = fs.statSync(filePath);
            serverDebug(`Serving file: ${path.basename(filePath)} (${(stats.size / 1024).toFixed(1)}KB)`);

            // Determine MIME type
            const ext = path.extname(filePath).toLowerCase();
            const contentType = mimeTypes[ext] || 'application/octet-stream';

            // Set headers
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Length', stats.size);

            // Add CORS headers if enabled
            if (DEV_SERVER_CONFIG.enableCORS) {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            }

            // Disable cache in development
            if (!DEV_SERVER_CONFIG.enableCache) {
                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                res.setHeader('Pragma', 'no-cache');
                res.setHeader('Expires', '0');
            }

            // Create read stream and pipe to response
            const fileStream = fs.createReadStream(filePath);

            fileStream.on('error', (error) => {
                errorDebug(`Error reading file ${filePath}:`, error);
                if (!res.headersSent) {
                    res.writeHead(500);
                    res.end('Internal Server Error');
                }
            });

            fileStream.pipe(res);
            return true;

        } catch (error) {
            errorDebug(`Error serving file ${filePath}:`, error);
            return false;
        }
    })();
}

// Directory listing with debug logging
async function serveDirectory(dirPath, req, res) {
    return withPerformanceTracking(`serveDirectory(${path.basename(dirPath)})`, async () => {
        try {
            serverDebug(`Serving directory listing for: ${dirPath}`);

            const files = fs.readdirSync(dirPath);
            const fileList = files.map(file => {
                const filePath = path.join(dirPath, file);
                const stats = fs.statSync(filePath);
                return {
                    name: file,
                    isDirectory: stats.isDirectory(),
                    size: stats.size,
                    modified: stats.mtime
                };
            });

            // Create HTML directory listing
            const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Directory Listing - ${path.basename(dirPath)}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .file { padding: 5px; border-bottom: 1px solid #eee; }
        .directory { color: #0066cc; font-weight: bold; }
        .file-link { text-decoration: none; color: #333; }
        .file-link:hover { text-decoration: underline; }
        .size { color: #666; font-size: 0.9em; }
        .modified { color: #999; font-size: 0.8em; }
    </style>
</head>
<body>
    <h1>Directory Listing: ${path.basename(dirPath)}</h1>
    <div>
        ${fileList.map(file => `
            <div class="file">
                <a href="${file.name}${file.isDirectory ? '/' : ''}" class="file-link ${file.isDirectory ? 'directory' : ''}">
                    ${file.name}${file.isDirectory ? '/' : ''}
                </a>
                ${!file.isDirectory ? `<span class="size">(${(file.size / 1024).toFixed(1)}KB)</span>` : ''}
                <span class="modified">${file.modified.toLocaleString()}</span>
            </div>
        `).join('')}
    </div>
</body>
</html>`;

            res.setHeader('Content-Type', 'text/html');
            res.end(html);
            return true;

        } catch (error) {
            errorDebug(`Error serving directory ${dirPath}:`, error);
            return false;
        }
    })();
}

// Request handler with comprehensive logging
async function handleRequest(req, res) {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substr(2, 9);

    serverStats.requests++;

    // Parse URL
    const parsedUrl = url.parse(req.url);
    const pathname = parsedUrl.pathname;

    serverDebug(`[${requestId}] ${req.method} ${pathname}`);

    // Log request details
    if (DEV_SERVER_CONFIG.logRequests) {
        serverDebug(`[${requestId}] Request details:`, {
            method: req.method,
            url: req.url,
            headers: req.headers,
            userAgent: req.headers['user-agent'],
            ip: req.connection.remoteAddress
        });
    }

    try {
        // Handle OPTIONS requests for CORS
        if (req.method === 'OPTIONS') {
            res.writeHead(200, {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            });
            res.end();
            return;
        }

        // Determine file path
        let filePath = path.join(process.cwd(), pathname === '/' ? 'index.html' : pathname);

        // Security check - prevent directory traversal
        const resolvedPath = path.resolve(filePath);
        const rootPath = path.resolve(process.cwd());

        if (!resolvedPath.startsWith(rootPath)) {
            errorDebug(`[${requestId}] Directory traversal attempt: ${pathname}`);
            res.writeHead(403);
            res.end('Forbidden');
            return;
        }

        // Check if path exists
        if (!fs.existsSync(filePath)) {
            // Try with .html extension
            if (!path.extname(filePath)) {
                const htmlPath = filePath + '.html';
                if (fs.existsSync(htmlPath)) {
                    filePath = htmlPath;
                }
            }
        }

        // Serve file or directory
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);

            if (stats.isDirectory()) {
                // Check for index.html in directory
                const indexPath = path.join(filePath, 'index.html');
                if (fs.existsSync(indexPath)) {
                    await serveFile(indexPath, res);
                } else {
                    await serveDirectory(filePath, req, res);
                }
            } else {
                await serveFile(filePath, res);
            }
        } else {
            // File not found
            serverDebug(`[${requestId}] File not found: ${pathname}`);
            res.writeHead(404);
            res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>404 - File Not Found</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
        .error { color: #d32f2f; font-size: 72px; margin-bottom: 20px; }
        .message { font-size: 18px; color: #666; }
        .back-link { margin-top: 20px; }
        .back-link a { color: #0066cc; text-decoration: none; }
    </style>
</head>
<body>
    <div class="error">404</div>
    <div class="message">File not found: ${pathname}</div>
    <div class="back-link">
        <a href="/">← Back to Home</a>
    </div>
</body>
</html>`);
        }

    } catch (error) {
        errorDebug(`[${requestId}] Error handling request:`, error);
        serverStats.errors++;

        if (!res.headersSent) {
            res.writeHead(500);
            res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>500 - Internal Server Error</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
        .error { color: #d32f2f; font-size: 72px; margin-bottom: 20px; }
        .message { font-size: 18px; color: #666; }
        .details { margin-top: 20px; font-family: monospace; font-size: 12px; color: #999; }
    </style>
</head>
<body>
    <div class="error">500</div>
    <div class="message">Internal Server Error</div>
    ${DEV_SERVER_CONFIG.logErrors ? `<div class="details">${error.message}</div>` : ''}
</body>
</html>`);
        }
    } finally {
        // Log request completion
        const duration = Date.now() - startTime;
        serverStats.requestTimes.push(duration);

        if (duration > 1000) { // Log slow requests
            serverStats.slowRequests.push({
                path: pathname,
                duration,
                timestamp: new Date().toISOString()
            });
            perfDebug(`[${requestId}] Slow request: ${pathname} took ${duration}ms`);
        }

        serverDebug(`[${requestId}] Request completed in ${duration}ms`);
    }
}

// Statistics logging
function logServerStats() {
    setInterval(() => {
        const uptime = Date.now() - serverStats.startTime;
        const avgResponseTime = serverStats.requestTimes.length > 0
            ? serverStats.requestTimes.reduce((a, b) => a + b, 0) / serverStats.requestTimes.length
            : 0;

        serverDebug('📊 Server Statistics:');
        serverDebug(`- Uptime: ${Math.round(uptime / 1000)}s`);
        serverDebug(`- Total requests: ${serverStats.requests}`);
        serverDebug(`- Total errors: ${serverStats.errors}`);
        serverDebug(`- Average response time: ${avgResponseTime.toFixed(2)}ms`);
        serverDebug(`- Slow requests: ${serverStats.slowRequests.length}`);

        // Log memory usage
        const memUsage = process.memoryUsage();
        perfDebug('Memory Usage:', {
            rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
            external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
        });

        // Keep only recent slow requests
        if (serverStats.slowRequests.length > 10) {
            serverStats.slowRequests = serverStats.slowRequests.slice(-10);
        }

        // Keep only recent request times
        if (serverStats.requestTimes.length > 100) {
            serverStats.requestTimes = serverStats.requestTimes.slice(-100);
        }
    }, 30000); // Log every 30 seconds
}

// Create HTTP server
const server = http.createServer(handleRequest);

// Start server
server.listen(DEV_SERVER_CONFIG.port, DEV_SERVER_CONFIG.host, () => {
    serverDebug('🚀 Enhanced Debug Development Server started');
    serverDebug(`📍 Server running at http://${DEV_SERVER_CONFIG.host}:${DEV_SERVER_CONFIG.port}`);
    serverDebug(`🔧 Development mode: ${process.env.NODE_ENV === 'development' ? 'enabled' : 'disabled'}`);
    serverDebug(`📊 Performance monitoring: ${PERFORMANCE_CONFIG.enabled ? 'enabled' : 'disabled'}`);
    serverDebug(`🔍 Error tracking: ${ERROR_CONFIG.logToConsole ? 'enabled' : 'disabled'}`);

    // Log initial memory usage
    const memUsage = process.memoryUsage();
    perfDebug('Initial Memory Usage:', {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`
    });

    // Start statistics logging
    logServerStats();
});

// Handle server errors
server.on('error', (error) => {
    errorDebug('Server error:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    serverDebug('🛑 Received SIGINT, shutting down gracefully...');
    server.close(() => {
        serverDebug('✅ Server shutdown complete');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    serverDebug('🛑 Received SIGTERM, shutting down gracefully...');
    server.close(() => {
        serverDebug('✅ Server shutdown complete');
        process.exit(0);
    });
});

module.exports = {
    server,
    serverStats,
    handleRequest
};
