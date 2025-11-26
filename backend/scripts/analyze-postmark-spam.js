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
    // The email we want is the SUBMITTER's email, not the recipient
    // It should be in the email body, typically in a "EMAIL:" or "Email:" field

    // Try to extract from TextBody or HtmlBody first (this is where form data is)
    const body = (message.TextBody || message.HtmlBody || '').toString();

    // Look for email patterns in the body - try to find the form submission email
    // Pattern: "EMAIL:" or "Email:" followed by email address
    const emailPatterns = [
        /EMAIL[:\s]+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
        /Email[:\s]+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
        /<a[^>]*href=["']mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})["']/i,
        /mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i
    ];

    for (const pattern of emailPatterns) {
        const match = body.match(pattern);
        if (match && match[1]) {
            // Skip common business emails
            const email = match[1].toLowerCase();
            if (!email.includes('woodenstonemi.com') && !email.includes('postmark')) {
                return match[1];
            }
        }
    }

    // If no email found in body, try to get from message metadata (but this might be recipient)
    // Only use this as last resort
    if (message.Recipients) {
        if (Array.isArray(message.Recipients) && message.Recipients.length > 0) {
            const recipientEmail = (message.Recipients[0].Email || message.Recipients[0]).toLowerCase();
            // Only return if it's not our business email
            if (!recipientEmail.includes('woodenstonemi.com')) {
                return message.Recipients[0].Email || message.Recipients[0];
            }
        }
    }

    return null;
}

// Extract name from Postmark message
function extractNameFromMessage(message) {
    const body = (message.TextBody || message.HtmlBody || '').toString();

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

            // Filter for contact form submissions and fetch full message details
            for (const message of messages.Messages) {
                const subject = message.Subject || '';

                // Check if it's a contact form submission
                if (subject.includes('Contact Form Submission') ||
                    subject.includes('Project Inquiry') ||
                    subject.includes('New Contact')) {

                    // Fetch full message details to get body content
                    let fullMessage = message;
                    try {
                        if (message.MessageID) {
                            const details = await postmarkClient.getOutboundMessageDetails(message.MessageID);
                            if (details) {
                                fullMessage = details;
                            }
                        }
                    } catch (err) {
                        // If fetching details fails, use the message we have
                        console.warn(`Could not fetch details for message ${message.MessageID}: ${err.message}`);
                    }

                    // Extract email and name from full message
                    const email = extractEmailFromMessage(fullMessage);
                    const name = extractNameFromMessage(fullMessage);
                    const domain = email ? email.split('@')[1] : 'unknown';

                    analysis.contactFormSubmissions.push({
                        messageId: message.MessageID,
                        subject: subject,
                        email: email || 'unknown',
                        name: name || 'unknown',
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
                    if (email && email !== 'unknown' && isRandomPattern(email.split('@')[0])) {
                        analysis.spamIndicators.randomEmailPatterns++;
                    }
                    if (name && name !== 'unknown' && isRandomPattern(name)) {
                        analysis.spamIndicators.randomNamePatterns++;
                    }

                    // Track time patterns
                    analysis.timePatterns.push({
                        timestamp: message.ReceivedAt || message.SentAt,
                        email: email || 'unknown'
                    });
                }
            }

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

    // Identify spam submissions
    const spamSubmissions = analysis.contactFormSubmissions.filter(sub => {
        const emailLocal = sub.email ? sub.email.split('@')[0] : '';
        return isRandomPattern(emailLocal) || (sub.name && isRandomPattern(sub.name));
    });

    // Group by email to find repeat offenders
    const emailGroups = {};
    analysis.contactFormSubmissions.forEach(sub => {
        if (sub.email && sub.email !== 'unknown') {
            if (!emailGroups[sub.email]) {
                emailGroups[sub.email] = [];
            }
            emailGroups[sub.email].push(sub);
        }
    });

    // Find emails with multiple submissions
    const repeatEmails = Object.entries(emailGroups)
        .filter(([email, subs]) => subs.length > 1)
        .sort((a, b) => b[1].length - a[1].length);

    if (spamSubmissions.length > 0) {
        console.log('\n' + '-'.repeat(80));
        console.log('SPAM SUBMISSIONS IDENTIFIED');
        console.log('-'.repeat(80));
        console.log(`Total Spam Submissions: ${spamSubmissions.length} out of ${analysis.contactFormSubmissions.length} (${(spamSubmissions.length / analysis.contactFormSubmissions.length * 100).toFixed(1)}%)`);
        console.log('\nSample Spam Submissions (First 10):');
        spamSubmissions.slice(0, 10).forEach((sub, index) => {
            console.log(`${index + 1}. Email: ${sub.email || 'N/A'}, Name: ${sub.name || 'N/A'}`);
            console.log(`   Subject: ${sub.subject}`);
            console.log(`   Timestamp: ${sub.timestamp}`);
        });
    }

    if (repeatEmails.length > 0) {
        console.log('\n' + '-'.repeat(80));
        console.log('REPEAT SUBMISSIONS (Same Email, Multiple Times)');
        console.log('-'.repeat(80));
        repeatEmails.slice(0, 10).forEach(([email, subs], index) => {
            const isSpam = subs.some(s => {
                const emailLocal = s.email ? s.email.split('@')[0] : '';
                return isRandomPattern(emailLocal) || (s.name && isRandomPattern(s.name));
            });
            console.log(`${index + 1}. ${email}: ${subs.length} submission(s) ${isSpam ? '⚠️ SPAM' : ''}`);
            subs.forEach((sub, i) => {
                console.log(`   ${i + 1}. ${sub.name || 'N/A'} - ${sub.timestamp}`);
            });
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

    const spamCount = spamSubmissions.length;
    const spamPercentage = analysis.contactFormSubmissions.length > 0
        ? (spamCount / analysis.contactFormSubmissions.length * 100).toFixed(1)
        : '0.0';
    console.log(`\nEstimated Spam Percentage: ${spamPercentage}% (${spamCount} spam out of ${analysis.contactFormSubmissions.length} total)`);

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

