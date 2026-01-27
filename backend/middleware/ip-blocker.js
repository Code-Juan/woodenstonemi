/**
 * IP Blocking Middleware
 * 
 * Blocks requests from IP addresses in the blocklist.
 * Supports both manual and automatic blocking.
 * 
 * Usage:
 * - Manual: Add IPs to backend/logs/blocked-ips.json
 * - Automatic: IPs can be added programmatically via API or script
 */

const fs = require('fs');
const path = require('path');

// Path to blocklist file
const BLOCKLIST_FILE = path.join(__dirname, '..', 'logs', 'blocked-ips.json');

// In-memory cache of blocked IPs (refreshed on each request check)
let blockedIPsCache = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

/**
 * Load blocked IPs from file
 */
function loadBlockedIPs() {
    const now = Date.now();
    
    // Use cache if recent
    if (blockedIPsCache && (now - lastCacheUpdate) < CACHE_TTL) {
        return blockedIPsCache;
    }

    // Initialize blocklist file if it doesn't exist
    const logsDir = path.dirname(BLOCKLIST_FILE);
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }

    if (!fs.existsSync(BLOCKLIST_FILE)) {
        // Create empty blocklist
        const initialBlocklist = {
            ips: [],
            lastUpdated: new Date().toISOString(),
            metadata: {
                totalBlocked: 0,
                autoBlocked: 0,
                manuallyBlocked: 0
            }
        };
        fs.writeFileSync(BLOCKLIST_FILE, JSON.stringify(initialBlocklist, null, 2), 'utf8');
        blockedIPsCache = new Set();
        lastCacheUpdate = now;
        return blockedIPsCache;
    }

    try {
        const content = fs.readFileSync(BLOCKLIST_FILE, 'utf8');
        const blocklist = JSON.parse(content);
        
        // Convert array to Set for faster lookups
        blockedIPsCache = new Set(blocklist.ips || []);
        lastCacheUpdate = now;
        
        return blockedIPsCache;
    } catch (error) {
        console.error('Error loading blocked IPs:', error.message);
        blockedIPsCache = new Set();
        lastCacheUpdate = now;
        return blockedIPsCache;
    }
}

/**
 * Add IP to blocklist
 * @param {string} ip - IP address to block
 * @param {string} reason - Reason for blocking
 * @param {boolean} autoBlocked - Whether this was automatically blocked
 */
function addToBlocklist(ip, reason = 'Manual block', autoBlocked = false) {
    try {
        const logsDir = path.dirname(BLOCKLIST_FILE);
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }

        let blocklist = {
            ips: [],
            lastUpdated: new Date().toISOString(),
            metadata: {
                totalBlocked: 0,
                autoBlocked: 0,
                manuallyBlocked: 0
            },
            entries: {}
        };

        // Load existing blocklist if it exists
        if (fs.existsSync(BLOCKLIST_FILE)) {
            const content = fs.readFileSync(BLOCKLIST_FILE, 'utf8');
            blocklist = JSON.parse(content);
        }

        // Add IP if not already blocked
        if (!blocklist.ips.includes(ip)) {
            blocklist.ips.push(ip);
            blocklist.metadata.totalBlocked++;
            
            if (autoBlocked) {
                blocklist.metadata.autoBlocked++;
            } else {
                blocklist.metadata.manuallyBlocked++;
            }

            blocklist.entries[ip] = {
                blockedAt: new Date().toISOString(),
                reason: reason,
                autoBlocked: autoBlocked
            };

            blocklist.lastUpdated = new Date().toISOString();

            // Save to file
            fs.writeFileSync(BLOCKLIST_FILE, JSON.stringify(blocklist, null, 2), 'utf8');
            
            // Invalidate cache
            blockedIPsCache = null;
            
            console.log(`IP ${ip} added to blocklist. Reason: ${reason}`);
            return true;
        }

        return false; // Already blocked
    } catch (error) {
        console.error('Error adding IP to blocklist:', error.message);
        return false;
    }
}

/**
 * Remove IP from blocklist
 * @param {string} ip - IP address to unblock
 */
function removeFromBlocklist(ip) {
    try {
        if (!fs.existsSync(BLOCKLIST_FILE)) {
            return false;
        }

        const content = fs.readFileSync(BLOCKLIST_FILE, 'utf8');
        const blocklist = JSON.parse(content);

        const index = blocklist.ips.indexOf(ip);
        if (index > -1) {
            blocklist.ips.splice(index, 1);
            delete blocklist.entries[ip];
            blocklist.metadata.totalBlocked--;
            blocklist.lastUpdated = new Date().toISOString();

            fs.writeFileSync(BLOCKLIST_FILE, JSON.stringify(blocklist, null, 2), 'utf8');
            
            // Invalidate cache
            blockedIPsCache = null;
            
            console.log(`IP ${ip} removed from blocklist.`);
            return true;
        }

        return false;
    } catch (error) {
        console.error('Error removing IP from blocklist:', error.message);
        return false;
    }
}

/**
 * Get all blocked IPs
 */
function getBlockedIPs() {
    try {
        if (!fs.existsSync(BLOCKLIST_FILE)) {
            return { ips: [], entries: {}, metadata: { totalBlocked: 0 } };
        }

        const content = fs.readFileSync(BLOCKLIST_FILE, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error('Error getting blocked IPs:', error.message);
        return { ips: [], entries: {}, metadata: { totalBlocked: 0 } };
    }
}

/**
 * Middleware to block requests from blocked IPs
 */
function ipBlockerMiddleware(req, res, next) {
    // Extract client IP (trust proxy is enabled in server.js)
    const clientIP = req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.connection.remoteAddress || 'unknown';

    // Skip blocking for localhost/private IPs in development
    if (process.env.NODE_ENV === 'development' && 
        (clientIP === '127.0.0.1' || clientIP === '::1' || clientIP.startsWith('192.168.') || clientIP.startsWith('10.'))) {
        return next();
    }

    // Load blocked IPs
    const blockedIPs = loadBlockedIPs();

    // Check if IP is blocked
    if (blockedIPs.has(clientIP)) {
        console.log(`Blocked request from IP: ${clientIP}`);
        
        // Get block reason if available
        let blockReason = 'IP address is blocked';
        try {
            if (fs.existsSync(BLOCKLIST_FILE)) {
                const content = fs.readFileSync(BLOCKLIST_FILE, 'utf8');
                const blocklist = JSON.parse(content);
                if (blocklist.entries && blocklist.entries[clientIP]) {
                    blockReason = blocklist.entries[clientIP].reason || blockReason;
                }
            }
        } catch (error) {
            // Ignore errors reading block reason
        }

        return res.status(403).json({
            success: false,
            message: 'Access denied. Your IP address has been blocked.',
            error: 'ip_blocked',
            reason: blockReason
        });
    }

    // IP is not blocked, continue
    next();
}

module.exports = {
    middleware: ipBlockerMiddleware,
    addToBlocklist,
    removeFromBlocklist,
    getBlockedIPs,
    loadBlockedIPs
};

