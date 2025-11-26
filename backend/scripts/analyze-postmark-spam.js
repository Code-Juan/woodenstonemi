#!/usr/bin/env node

/**
 * Analyze spam patterns using Postmark API
 * Usage: node backend/scripts/analyze-postmark-spam.js [days-back]
 * 
 * Requires POSTMARK_API_KEY in environment or .env file
 */

const Postmark = require('postmark');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'config', '.env') });

// Get days back from command line (default: 30)
const daysBack = parseInt(process.argv[2]) || 30;

// Check for API key
if (!process.env.POSTMARK_API_KEY) {
    console.error('Error: POSTMARK_API_KEY not found in environment variables.');
    console.log('Please set it in backend/config/.env or as an environment variable.');
    process.exit(1);
}

const postmarkClient = new Postmark.ServerClient(process.env.POSTMARK_API_KEY);

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

// Extract email from Postmark message
function extractEmailFromMessage(message) {
    // Try to extract from To field
    if (message.To) {
        const match = message.To.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        if (match) return match[1];
    }

    // Try to extract from TextBody or HtmlBody
    const body = message.TextBody || message.HtmlBody || '';
    const emailMatch = body.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) return emailMatch[1];

    return null;
}

// Extract name from Postmark message
function extractNameFromMessage(message) {
    const body = message.TextBody || message.HtmlBody || '';

    // Look for "Name:" pattern
    const nameMatch = body.match(/NAME[:\s]+([^\n<]+)/i);
    if (nameMatch) {
        return nameMatch[1].trim();
    }

    return null;
}

// Analyze messages
async function analyzePostmarkMessages() {
    try {
        console.log(`Fetching messages from Postmark (last ${daysBack} days)...`);
        console.log('This may take a while if you have many messages...\n');

        const analysis = {
            total: 0,
            contactFormSubmissions: [],
            byDomain: {},
            bySubject: {},
            timePatterns: [],
            spamIndicators: {
                randomEmailPatterns: 0,
                randomNamePatterns: 0,
                rapidSubmissions: 0
            }
        };

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysBack);

        let offset = 0;
        const count = 500; // Postmark API limit per request
        let hasMore = true;

        while (hasMore) {
            const messages = await postmarkClient.getOutboundMessages({
                count: count,
                offset: offset,
                fromdate: startDate.toISOString().split('T')[0],
                todate: endDate.toISOString().split('T')[0]
            });

            if (!messages.Messages || messages.Messages.length === 0) {
                hasMore = false;
                break;
            }

            analysis.total += messages.Messages.length;

            // Filter for contact form submissions
            messages.Messages.forEach(message => {
                const subject = message.Subject || '';

                // Check if it's a contact form submission
                if (subject.includes('Contact Form Submission') ||
                    subject.includes('Project Inquiry') ||
                    subject.includes('New Contact')) {

                    const email = extractEmailFromMessage(message);
                    const name = extractNameFromMessage(message);
                    const domain = email ? email.split('@')[1] : 'unknown';

                    analysis.contactFormSubmissions.push({
                        messageId: message.MessageID,
                        subject: subject,
                        email: email,
                        name: name,
                        domain: domain,
                        timestamp: message.ReceivedAt || message.SentAt,
                        status: message.Status
                    });

                    // Track domains
                    if (domain && domain !== 'unknown') {
                        if (!analysis.byDomain[domain]) {
                            analysis.byDomain[domain] = 0;
                        }
                        analysis.byDomain[domain]++;
                    }

                    // Track subjects
                    if (!analysis.bySubject[subject]) {
                        analysis.bySubject[subject] = 0;
                    }
                    analysis.bySubject[subject]++;

                    // Detect spam patterns
                    if (email && isRandomPattern(email.split('@')[0])) {
                        analysis.spamIndicators.randomEmailPatterns++;
                    }
                    if (name && isRandomPattern(name)) {
                        analysis.spamIndicators.randomNamePatterns++;
                    }

                    // Track time patterns
                    analysis.timePatterns.push({
                        timestamp: message.ReceivedAt || message.SentAt,
                        email: email
                    });
                }
            });

            // Check if there are more messages
            if (messages.Messages.length < count) {
                hasMore = false;
            } else {
                offset += count;
            }

            // Progress indicator
            process.stdout.write(`\rProcessed ${analysis.total} messages, found ${analysis.contactFormSubmissions.length} contact form submissions...`);
        }

        console.log('\n');

        // Sort time patterns
        analysis.timePatterns.sort((a, b) =>
            new Date(a.timestamp) - new Date(b.timestamp)
        );

        // Detect rapid submissions (same email, multiple submissions within short time)
        const emailGroups = {};
        analysis.contactFormSubmissions.forEach(sub => {
            if (sub.email) {
                if (!emailGroups[sub.email]) {
                    emailGroups[sub.email] = [];
                }
                emailGroups[sub.email].push(sub);
            }
        });

        Object.values(emailGroups).forEach(group => {
            if (group.length > 1) {
                const sorted = group.sort((a, b) =>
                    new Date(a.timestamp) - new Date(b.timestamp)
                );

                for (let i = 1; i < sorted.length; i++) {
                    const timeDiff = new Date(sorted[i].timestamp) - new Date(sorted[i - 1].timestamp);
                    if (timeDiff < 5 * 60 * 1000) { // Less than 5 minutes
                        analysis.spamIndicators.rapidSubmissions++;
                    }
                }
            }
        });

        return analysis;
    } catch (error) {
        console.error('Error fetching messages from Postmark:', error.message);
        throw error;
    }
}

// Generate report
function generateReport(analysis) {
    console.log('\n' + '='.repeat(80));
    console.log('POSTMARK SPAM ANALYSIS REPORT');
    console.log('='.repeat(80));
    console.log(`\nTotal Messages Analyzed: ${analysis.total}`);
    console.log(`Contact Form Submissions Found: ${analysis.contactFormSubmissions.length}`);

    if (analysis.timePatterns.length > 0) {
        console.log(`Date Range: ${new Date(analysis.timePatterns[0].timestamp).toLocaleString()} - ${new Date(analysis.timePatterns[analysis.timePatterns.length - 1].timestamp).toLocaleString()
            }`);
    }

    // Spam Indicators
    console.log('\n' + '-'.repeat(80));
    console.log('SPAM INDICATORS');
    console.log('-'.repeat(80));
    console.log(`Random Email Patterns Detected: ${analysis.spamIndicators.randomEmailPatterns}`);
    console.log(`Random Name Patterns Detected: ${analysis.spamIndicators.randomNamePatterns}`);
    console.log(`Rapid Submissions (<5 min apart): ${analysis.spamIndicators.rapidSubmissions}`);

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

    // Sample spam submissions
    const spamSubmissions = analysis.contactFormSubmissions.filter(sub => {
        const emailLocal = sub.email ? sub.email.split('@')[0] : '';
        return isRandomPattern(emailLocal) || (sub.name && isRandomPattern(sub.name));
    });

    if (spamSubmissions.length > 0) {
        console.log('\n' + '-'.repeat(80));
        console.log('SAMPLE SPAM SUBMISSIONS (First 10)');
        console.log('-'.repeat(80));
        spamSubmissions.slice(0, 10).forEach((sub, index) => {
            console.log(`${index + 1}. Email: ${sub.email || 'N/A'}, Name: ${sub.name || 'N/A'}`);
            console.log(`   Subject: ${sub.subject}`);
            console.log(`   Timestamp: ${sub.timestamp}`);
        });
    }

    // Recommendations
    console.log('\n' + '-'.repeat(80));
    console.log('RECOMMENDATIONS');
    console.log('-'.repeat(80));

    if (analysis.spamIndicators.randomEmailPatterns > analysis.contactFormSubmissions.length * 0.3) {
        console.log('⚠️  High percentage of random email patterns detected. Consider implementing gibberish detection.');
    }

    if (analysis.spamIndicators.rapidSubmissions > 0) {
        console.log('⚠️  Rapid submissions detected. Consider implementing rate limiting.');
    }

    const spamPercentage = (analysis.spamIndicators.randomEmailPatterns / analysis.contactFormSubmissions.length * 100).toFixed(1);
    console.log(`\nEstimated Spam Percentage: ${spamPercentage}%`);

    console.log('\n' + '='.repeat(80));
}

// Main execution
(async () => {
    try {
        const analysis = await analyzePostmarkMessages();
        generateReport(analysis);
    } catch (error) {
        console.error('\nError:', error.message);
        process.exit(1);
    }
})();

