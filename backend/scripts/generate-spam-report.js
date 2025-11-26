#!/usr/bin/env node

/**
 * Generate comprehensive spam analysis report
 * Combines data from local logs and Postmark API
 * Usage: node backend/scripts/generate-spam-report.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const LOG_FILE = path.join(__dirname, '..', 'logs', 'submissions.log');
const REPORT_FILE = path.join(__dirname, '..', 'logs', 'spam-report.txt');

console.log('Generating comprehensive spam analysis report...\n');

let report = '';
report += '='.repeat(80) + '\n';
report += 'COMPREHENSIVE SPAM ANALYSIS REPORT\n';
report += 'Generated: ' + new Date().toLocaleString() + '\n';
report += '='.repeat(80) + '\n\n';

// Analyze local logs if they exist
if (fs.existsSync(LOG_FILE)) {
    report += 'SECTION 1: LOCAL LOG ANALYSIS\n';
    report += '-'.repeat(80) + '\n';
    
    try {
        const output = execSync(`node ${path.join(__dirname, 'analyze-submission-logs.js')}`, {
            encoding: 'utf8'
        });
        report += output + '\n\n';
    } catch (error) {
        report += 'Error analyzing local logs: ' + error.message + '\n\n';
    }
} else {
    report += 'SECTION 1: LOCAL LOG ANALYSIS\n';
    report += '-'.repeat(80) + '\n';
    report += 'No local log file found. Start the server to begin logging submissions.\n\n';
}

// Analyze Postmark if API key is available
if (process.env.POSTMARK_API_KEY) {
    report += 'SECTION 2: POSTMARK API ANALYSIS\n';
    report += '-'.repeat(80) + '\n';
    
    try {
        const output = execSync(`node ${path.join(__dirname, 'analyze-postmark-spam.js')} 30`, {
            encoding: 'utf8',
            env: { ...process.env }
        });
        report += output + '\n\n';
    } catch (error) {
        report += 'Error analyzing Postmark messages: ' + error.message + '\n\n';
    }
} else {
    report += 'SECTION 2: POSTMARK API ANALYSIS\n';
    report += '-'.repeat(80) + '\n';
    report += 'POSTMARK_API_KEY not found. Skipping Postmark analysis.\n';
    report += 'Set POSTMARK_API_KEY in backend/config/.env to enable this analysis.\n\n';
}

// Summary and recommendations
report += 'SECTION 3: SUMMARY & RECOMMENDATIONS\n';
report += '-'.repeat(80) + '\n';
report += '1. Review the IP addresses and email domains identified above\n';
report += '2. Consider implementing IP-based blocking for suspicious IPs\n';
report += '3. Implement rate limiting per IP address\n';
report += '4. Add gibberish detection for random character patterns\n';
report += '5. Monitor logs regularly to identify new spam patterns\n';
report += '\n' + '='.repeat(80) + '\n';

// Write report to file
const logsDir = path.dirname(REPORT_FILE);
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

fs.writeFileSync(REPORT_FILE, report, 'utf8');

// Also output to console
console.log(report);
console.log(`\nReport saved to: ${REPORT_FILE}`);

