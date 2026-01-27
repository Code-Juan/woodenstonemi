#!/usr/bin/env node

/**
 * Automated script to download logs from Render and analyze them
 * Usage: node backend/scripts/download-and-analyze-logs.js
 * 
 * Requires ADMIN_TOKEN in environment or .env file
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'config', '.env') });

// Configuration
const RENDER_BACKEND_URL = process.env.RENDER_BACKEND_URL || 'https://wooden-stone-backend.onrender.com';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const LOG_FILE = path.join(__dirname, '..', 'logs', 'submissions.log');

// Check if token is configured
if (!ADMIN_TOKEN) {
    console.error('Error: ADMIN_TOKEN not found in environment variables.');
    console.log('Please set ADMIN_TOKEN in backend/config/.env or as an environment variable.');
    process.exit(1);
}

// Download log file from Render
function downloadLogs() {
    return new Promise((resolve, reject) => {
        const url = new URL(`${RENDER_BACKEND_URL}/api/contact/logs`);
        url.searchParams.set('token', ADMIN_TOKEN);

        console.log(`Downloading logs from ${RENDER_BACKEND_URL}...`);

        const protocol = url.protocol === 'https:' ? https : http;

        const req = protocol.get(url.toString(), (res) => {
            // Check if we got an error response
            if (res.statusCode === 401) {
                return reject(new Error('Unauthorized. Check your ADMIN_TOKEN.'));
            }
            if (res.statusCode === 404) {
                return reject(new Error('Log file not found. No submissions logged yet.'));
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`Server returned status ${res.statusCode}`));
            }

            // Ensure logs directory exists
            const logsDir = path.dirname(LOG_FILE);
            if (!fs.existsSync(logsDir)) {
                fs.mkdirSync(logsDir, { recursive: true });
            }

            // Write to file
            const fileStream = fs.createWriteStream(LOG_FILE);
            res.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                const stats = fs.statSync(LOG_FILE);
                console.log(`✓ Log file downloaded: ${LOG_FILE}`);
                console.log(`  Size: ${(stats.size / 1024).toFixed(2)} KB`);
                console.log(`  Lines: ${fs.readFileSync(LOG_FILE, 'utf8').split('\n').filter(l => l.trim()).length}`);
                resolve();
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.setTimeout(60000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

// Run the tracking script
function runTrackingScript() {
    return new Promise((resolve, reject) => {
        console.log('\n' + '='.repeat(80));
        console.log('Running spammer tracking analysis...');
        console.log('='.repeat(80) + '\n');

        const { spawn } = require('child_process');
        const scriptPath = path.join(__dirname, 'track-spammers.js');
        
        const child = spawn('node', [scriptPath], {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Tracking script exited with code ${code}`));
            }
        });

        child.on('error', (error) => {
            reject(error);
        });
    });
}

// Main execution
(async () => {
    try {
        // Download logs
        await downloadLogs();

        // Run tracking analysis
        await runTrackingScript();

        console.log('\n✓ Analysis complete!');
    } catch (error) {
        console.error('\n✗ Error:', error.message);
        if (error.message.includes('Unauthorized')) {
            console.log('\nTip: Make sure ADMIN_TOKEN is set correctly in backend/config/.env');
            console.log('     and that Render has been redeployed after adding the token.');
        } else if (error.message.includes('not found')) {
            console.log('\nTip: The log file will be created automatically when the first submission is received.');
        }
        process.exit(1);
    }
})();

