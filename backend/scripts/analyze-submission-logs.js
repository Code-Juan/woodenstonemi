#!/usr/bin/env node

/**
 * Analyze submission logs to identify spam patterns
 * Usage: node backend/scripts/analyze-submission-logs.js [log-file-path]
 */

const fs = require('fs');
const path = require('path');

// Default log file path
const DEFAULT_LOG_FILE = path.join(__dirname, '..', 'logs', 'submissions.log');

// Get log file path from command line or use default
const logFilePath = process.argv[2] || DEFAULT_LOG_FILE;

// Check if log file exists
if (!fs.existsSync(logFilePath)) {
    console.error(`Error: Log file not found at ${logFilePath}`);
    console.log('Make sure the server has been running and submissions have been logged.');
    process.exit(1);
}

// Read and parse log file
function readLogFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n').filter(line => line.trim());

    return lines.map((line, index) => {
        try {
            return JSON.parse(line);
        } catch (error) {
            console.warn(`Warning: Could not parse line ${index + 1}: ${error.message}`);
            return null;
        }
    }).filter(entry => entry !== null);
}

// Analyze patterns
function analyzeLogs(submissions) {
    const analysis = {
        total: submissions.length,
        byIP: {},
        byEmail: {},
        byDomain: {},
        timePatterns: [],
        userAgents: {},
        spamIndicators: {
            randomEmailPatterns: 0,
            randomNamePatterns: 0,
            rapidSubmissions: 0,
            suspiciousIPs: []
        }
    };

    // Helper function to detect random character patterns
    function isRandomPattern(text) {
        if (!text || text.length < 8) return false;
        const cleaned = text.toLowerCase();
        const vowels = (cleaned.match(/[aeiou]/g) || []).length;
        const consonants = (cleaned.match(/[bcdfghjklmnpqrstvwxyz]/g) || []).length;
        const totalLetters = vowels + consonants;

        if (totalLetters === 0) return false;
        const vowelRatio = vowels / totalLetters;

        // Random patterns typically have low vowel ratio and no spaces
        return vowelRatio < 0.2 && totalLetters >= 10 && !/\s/.test(text);
    }

    submissions.forEach((submission, index) => {
        const { ip, email, name, company, projectDescription, timestamp, userAgent } = submission;

        // Group by IP
        if (!analysis.byIP[ip]) {
            analysis.byIP[ip] = {
                count: 0,
                emails: new Set(),
                submissions: []
            };
        }
        analysis.byIP[ip].count++;
        analysis.byIP[ip].emails.add(email);
        analysis.byIP[ip].submissions.push({
            timestamp,
            email,
            name
        });

        // Group by email
        if (!analysis.byEmail[email]) {
            analysis.byEmail[email] = {
                count: 0,
                ips: new Set(),
                firstSeen: timestamp,
                lastSeen: timestamp
            };
        }
        analysis.byEmail[email].count++;
        analysis.byEmail[email].ips.add(ip);
        if (timestamp < analysis.byEmail[email].firstSeen) {
            analysis.byEmail[email].firstSeen = timestamp;
        }
        if (timestamp > analysis.byEmail[email].lastSeen) {
            analysis.byEmail[email].lastSeen = timestamp;
        }

        // Group by email domain
        const domain = email.split('@')[1] || 'unknown';
        if (!analysis.byDomain[domain]) {
            analysis.byDomain[domain] = 0;
        }
        analysis.byDomain[domain]++;

        // Track user agents
        if (userAgent && userAgent !== 'unknown') {
            if (!analysis.userAgents[userAgent]) {
                analysis.userAgents[userAgent] = 0;
            }
            analysis.userAgents[userAgent]++;
        }

        // Detect spam patterns
        if (isRandomPattern(email.split('@')[0])) {
            analysis.spamIndicators.randomEmailPatterns++;
        }
        if (isRandomPattern(name)) {
            analysis.spamIndicators.randomNamePatterns++;
        }
        if (isRandomPattern(company)) {
            analysis.spamIndicators.randomNamePatterns++;
        }

        // Track time patterns
        analysis.timePatterns.push({
            timestamp,
            ip,
            email
        });
    });

    // Identify rapid submissions (same IP, multiple submissions within short time)
    Object.keys(analysis.byIP).forEach(ip => {
        const ipData = analysis.byIP[ip];
        if (ipData.count > 1) {
            const submissions = ipData.submissions.sort((a, b) =>
                new Date(a.timestamp) - new Date(b.timestamp)
            );

            // Check for submissions within 5 minutes of each other
            for (let i = 1; i < submissions.length; i++) {
                const timeDiff = new Date(submissions[i].timestamp) - new Date(submissions[i - 1].timestamp);
                if (timeDiff < 5 * 60 * 1000) { // Less than 5 minutes
                    analysis.spamIndicators.rapidSubmissions++;
                    if (!analysis.spamIndicators.suspiciousIPs.includes(ip)) {
                        analysis.spamIndicators.suspiciousIPs.push(ip);
                    }
                }
            }
        }
    });

    return analysis;
}

// Generate report
function generateReport(analysis) {
    console.log('\n' + '='.repeat(80));
    console.log('SPAM ANALYSIS REPORT');
    console.log('='.repeat(80));
    console.log(`\nTotal Submissions Analyzed: ${analysis.total}`);
    console.log(`Date Range: ${analysis.timePatterns.length > 0 ?
        new Date(analysis.timePatterns[0].timestamp).toLocaleString() : 'N/A'} - ${analysis.timePatterns.length > 0 ?
            new Date(analysis.timePatterns[analysis.timePatterns.length - 1].timestamp).toLocaleString() : 'N/A'
        }`);

    // Spam Indicators
    console.log('\n' + '-'.repeat(80));
    console.log('SPAM INDICATORS');
    console.log('-'.repeat(80));
    console.log(`Random Email Patterns Detected: ${analysis.spamIndicators.randomEmailPatterns}`);
    console.log(`Random Name/Company Patterns Detected: ${analysis.spamIndicators.randomNamePatterns}`);
    console.log(`Rapid Submissions (same IP, <5 min apart): ${analysis.spamIndicators.rapidSubmissions}`);
    console.log(`Suspicious IPs Identified: ${analysis.spamIndicators.suspiciousIPs.length}`);

    // Top IPs
    console.log('\n' + '-'.repeat(80));
    console.log('TOP IP ADDRESSES (by submission count)');
    console.log('-'.repeat(80));
    const topIPs = Object.entries(analysis.byIP)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10);

    topIPs.forEach(([ip, data], index) => {
        console.log(`${index + 1}. ${ip}: ${data.count} submission(s), ${data.emails.size} unique email(s)`);
        if (data.count > 1) {
            console.log(`   First: ${data.submissions[0].timestamp}`);
            console.log(`   Last: ${data.submissions[data.submissions.length - 1].timestamp}`);
        }
    });

    // Top Email Domains
    console.log('\n' + '-'.repeat(80));
    console.log('TOP EMAIL DOMAINS');
    console.log('-'.repeat(80));
    const topDomains = Object.entries(analysis.byDomain)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    topDomains.forEach(([domain, count], index) => {
        console.log(`${index + 1}. ${domain}: ${count} submission(s)`);
    });

    // Suspicious IPs
    if (analysis.spamIndicators.suspiciousIPs.length > 0) {
        console.log('\n' + '-'.repeat(80));
        console.log('SUSPICIOUS IP ADDRESSES (Multiple rapid submissions)');
        console.log('-'.repeat(80));
        analysis.spamIndicators.suspiciousIPs.forEach(ip => {
            const ipData = analysis.byIP[ip];
            console.log(`- ${ip}: ${ipData.count} submission(s) from ${ipData.emails.size} email(s)`);
        });
    }

    // Top Emails (multiple submissions)
    console.log('\n' + '-'.repeat(80));
    console.log('EMAILS WITH MULTIPLE SUBMISSIONS');
    console.log('-'.repeat(80));
    const multipleSubmissions = Object.entries(analysis.byEmail)
        .filter(([email, data]) => data.count > 1)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10);

    if (multipleSubmissions.length > 0) {
        multipleSubmissions.forEach(([email, data], index) => {
            console.log(`${index + 1}. ${email}: ${data.count} submission(s) from ${data.ips.size} IP(s)`);
            console.log(`   First: ${data.firstSeen}`);
            console.log(`   Last: ${data.lastSeen}`);
        });
    } else {
        console.log('No emails with multiple submissions found.');
    }

    // Recommendations
    console.log('\n' + '-'.repeat(80));
    console.log('RECOMMENDATIONS');
    console.log('-'.repeat(80));

    if (analysis.spamIndicators.suspiciousIPs.length > 0) {
        console.log('⚠️  Consider blocking these IP addresses:');
        analysis.spamIndicators.suspiciousIPs.forEach(ip => {
            console.log(`   - ${ip}`);
        });
    }

    if (analysis.spamIndicators.randomEmailPatterns > analysis.total * 0.3) {
        console.log('⚠️  High percentage of random email patterns detected. Consider implementing gibberish detection.');
    }

    if (analysis.spamIndicators.rapidSubmissions > 0) {
        console.log('⚠️  Rapid submissions detected. Consider implementing rate limiting per IP.');
    }

    console.log('\n' + '='.repeat(80));
}

// Main execution
try {
    console.log(`Reading log file: ${logFilePath}`);
    const submissions = readLogFile(logFilePath);

    if (submissions.length === 0) {
        console.log('No submissions found in log file.');
        process.exit(0);
    }

    console.log(`Found ${submissions.length} submission(s)`);
    const analysis = analyzeLogs(submissions);
    generateReport(analysis);
} catch (error) {
    console.error('Error analyzing logs:', error.message);
    process.exit(1);
}

