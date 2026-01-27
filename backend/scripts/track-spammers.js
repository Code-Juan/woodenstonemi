#!/usr/bin/env node

/**
 * Enhanced spam tracker with IP geolocation, VPN detection, and bot identification
 * Usage: node backend/scripts/track-spammers.js [log-file-path]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const DEFAULT_LOG_FILE = path.join(__dirname, '..', 'logs', 'submissions.log');
const logFilePath = process.argv[2] || DEFAULT_LOG_FILE;

// Free IP geolocation API (no key required)
const IP_GEOLOCATION_API = 'https://ipapi.co';
const VPN_CHECK_API = 'https://ipapi.co'; // Same API provides VPN/proxy detection

// Cache for IP lookups (to avoid repeated API calls)
const ipCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Read log file
function readLogFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.error(`Error: Log file not found at ${filePath}`);
        process.exit(1);
    }

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

// Lookup IP information (geolocation, VPN, etc.)
function lookupIP(ip) {
    return new Promise((resolve, reject) => {
        // Check cache first
        if (ipCache.has(ip)) {
            const cached = ipCache.get(ip);
            if (Date.now() - cached.timestamp < CACHE_TTL) {
                return resolve(cached.data);
            }
        }

        // Skip localhost/private IPs
        if (ip === 'unknown' || ip === '::1' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
            return resolve({
                ip: ip,
                country: 'Local',
                city: 'Local',
                isp: 'Local',
                is_vpn: false,
                is_proxy: false,
                is_tor: false,
                error: 'Local/private IP'
            });
        }

        // Use ipapi.co (free tier: 1000 requests/day)
        const url = `${IP_GEOLOCATION_API}/${ip}/json/`;
        
        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    
                    // Handle API errors
                    if (result.error) {
                        return resolve({
                            ip: ip,
                            country: 'Unknown',
                            city: 'Unknown',
                            isp: 'Unknown',
                            is_vpn: false,
                            is_proxy: false,
                            is_tor: false,
                            error: result.reason || 'API error'
                        });
                    }
                    
                    const ipInfo = {
                        ip: ip,
                        country: result.country_name || result.country || 'Unknown',
                        country_code: result.country_code || 'Unknown',
                        city: result.city || 'Unknown',
                        region: result.region || 'Unknown',
                        isp: result.org || result.isp || 'Unknown',
                        asn: result.asn || null,
                        is_vpn: result.vpn === true || false,
                        is_proxy: result.proxy === true || false,
                        is_tor: result.tor === true || false,
                        latitude: result.latitude || null,
                        longitude: result.longitude || null,
                        timezone: result.timezone || null
                    };

                    // Cache the result
                    ipCache.set(ip, { data: ipInfo, timestamp: Date.now() });
                    resolve(ipInfo);
                } catch (error) {
                    console.warn(`Warning: Could not parse IP lookup for ${ip}: ${error.message}`);
                    resolve({
                        ip: ip,
                        country: 'Unknown',
                        city: 'Unknown',
                        isp: 'Unknown',
                        is_vpn: false,
                        is_proxy: false,
                        is_tor: false,
                        error: error.message
                    });
                }
            });
        }).on('error', (error) => {
            console.warn(`Warning: IP lookup failed for ${ip}: ${error.message}`);
            resolve({
                ip: ip,
                country: 'Unknown',
                city: 'Unknown',
                isp: 'Unknown',
                is_vpn: false,
                is_proxy: false,
                is_tor: false,
                error: error.message
            });
        });
    });
}

// Analyze submissions with IP tracking
async function analyzeWithIPTracking(submissions) {
    console.log('Analyzing submissions and looking up IP information...');
    console.log('This may take a while due to API rate limits...\n');

    const analysis = {
        total: submissions.length,
        byIP: {},
        suspiciousIPs: [],
        vpnUsers: [],
        botIndicators: [],
        geographicDistribution: {},
        ispDistribution: {},
        timePatterns: []
    };

    // Get unique IPs first to minimize API calls
    // Use real IP from IP chain or Cloudflare header if main IP is private
    const uniqueIPs = new Set();
    submissions.forEach(sub => {
        let ip = sub.ip || 'unknown';
        
        // If IP is private/local, try to get real IP from headers
        if (ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.') || ip === 'unknown') {
            // Try Cloudflare connecting IP first
            if (sub.headers && sub.headers['cf-connecting-ip']) {
                ip = sub.headers['cf-connecting-ip'];
            }
            // Otherwise try first IP in IP chain
            else if (sub.ipChain && Array.isArray(sub.ipChain) && sub.ipChain.length > 0) {
                // Find first public IP in chain
                const publicIP = sub.ipChain.find(chainIP => 
                    chainIP && 
                    !chainIP.startsWith('127.') && 
                    !chainIP.startsWith('192.168.') && 
                    !chainIP.startsWith('10.') && 
                    !chainIP.startsWith('172.')
                );
                if (publicIP) {
                    ip = publicIP;
                }
            }
        }
        
        if (ip !== 'unknown' && !ip.startsWith('127.') && !ip.startsWith('192.168.') && !ip.startsWith('10.') && !ip.startsWith('172.')) {
            uniqueIPs.add(ip);
        }
    });

    console.log(`Found ${uniqueIPs.size} unique IP addresses to lookup...\n`);

    // Lookup all unique IPs first
    const ipInfoMap = new Map();
    let lookupCount = 0;
    for (const ip of uniqueIPs) {
        lookupCount++;
        process.stdout.write(`\rLooking up IP ${lookupCount}/${uniqueIPs.size}: ${ip}...`);
        const ipInfo = await lookupIP(ip);
        ipInfoMap.set(ip, ipInfo);
        
        // Rate limiting: wait 100ms between API calls to avoid hitting rate limits
        if (lookupCount < uniqueIPs.size) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    console.log('\n');

    // Process submissions with IP information
    for (let i = 0; i < submissions.length; i++) {
        const submission = submissions[i];
        let ip = submission.ip || 'unknown';
        
        // If IP is private/local, try to get real IP from headers
        if (ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.') || ip === 'unknown') {
            // Try Cloudflare connecting IP first
            if (submission.headers && submission.headers['cf-connecting-ip']) {
                ip = submission.headers['cf-connecting-ip'];
            }
            // Otherwise try first IP in IP chain
            else if (submission.ipChain && Array.isArray(submission.ipChain) && submission.ipChain.length > 0) {
                // Find first public IP in chain
                const publicIP = submission.ipChain.find(chainIP => 
                    chainIP && 
                    !chainIP.startsWith('127.') && 
                    !chainIP.startsWith('192.168.') && 
                    !chainIP.startsWith('10.') && 
                    !chainIP.startsWith('172.')
                );
                if (publicIP) {
                    ip = publicIP;
                }
            }
        }
        
        const ipInfo = ipInfoMap.get(ip) || {
            ip: ip,
            country: 'Unknown',
            city: 'Unknown',
            isp: 'Unknown',
            is_vpn: false,
            is_proxy: false,
            is_tor: false
        };

        // Group by IP
        if (!analysis.byIP[ip]) {
            analysis.byIP[ip] = {
                count: 0,
                emails: new Set(),
                submissions: [],
                ipInfo: ipInfo,
                firstSeen: submission.timestamp,
                lastSeen: submission.timestamp
            };
        }

        analysis.byIP[ip].count++;
        analysis.byIP[ip].emails.add(submission.email);
        analysis.byIP[ip].submissions.push({
            timestamp: submission.timestamp,
            email: submission.email,
            name: submission.name,
            recaptchaScore: submission.recaptcha?.score || null
        });

        if (submission.timestamp < analysis.byIP[ip].firstSeen) {
            analysis.byIP[ip].firstSeen = submission.timestamp;
        }
        if (submission.timestamp > analysis.byIP[ip].lastSeen) {
            analysis.byIP[ip].lastSeen = submission.timestamp;
        }

        // Track geographic distribution
        const country = ipInfo.country || 'Unknown';
        if (!analysis.geographicDistribution[country]) {
            analysis.geographicDistribution[country] = 0;
        }
        analysis.geographicDistribution[country]++;

        // Track ISP distribution
        const isp = ipInfo.isp || 'Unknown';
        if (!analysis.ispDistribution[isp]) {
            analysis.ispDistribution[isp] = 0;
        }
        analysis.ispDistribution[isp]++;

        // Identify VPN/Proxy users
        if (ipInfo.is_vpn || ipInfo.is_proxy || ipInfo.is_tor) {
            const existingVpn = analysis.vpnUsers.find(v => v.ip === ip);
            if (!existingVpn) {
                analysis.vpnUsers.push({
                    ip: ip,
                    country: ipInfo.country,
                    isp: ipInfo.isp,
                    is_vpn: ipInfo.is_vpn,
                    is_proxy: ipInfo.is_proxy,
                    is_tor: ipInfo.is_tor,
                    submissionCount: 1,
                    emails: [submission.email]
                });
            } else {
                existingVpn.submissionCount++;
                if (!existingVpn.emails.includes(submission.email)) {
                    existingVpn.emails.push(submission.email);
                }
            }
        }

        // Detect bot indicators
        const botScore = calculateBotScore(submission, ipInfo);
        if (botScore > 0.5) {
            analysis.botIndicators.push({
                ip: ip,
                email: submission.email,
                name: submission.name,
                botScore: botScore,
                reasons: getBotReasons(submission, ipInfo),
                timestamp: submission.timestamp
            });
        }

        // Track time patterns
        analysis.timePatterns.push({
            timestamp: submission.timestamp,
            ip: ip,
            email: submission.email
        });
    }

    // Identify suspicious IPs (multiple submissions, VPN, low reCAPTCHA scores)
    Object.keys(analysis.byIP).forEach(ip => {
        const ipData = analysis.byIP[ip];
        const suspiciousReasons = [];

        if (ipData.count > 3) {
            suspiciousReasons.push(`Multiple submissions (${ipData.count})`);
        }
        if (ipData.ipInfo.is_vpn || ipData.ipInfo.is_proxy) {
            suspiciousReasons.push('VPN/Proxy detected');
        }
        if (ipData.ipInfo.is_tor) {
            suspiciousReasons.push('Tor network detected');
        }
        const lowScores = ipData.submissions.filter(s => s.recaptchaScore && s.recaptchaScore < 0.5);
        if (lowScores.length > 0) {
            suspiciousReasons.push(`Low reCAPTCHA scores (${lowScores.length})`);
        }

        if (suspiciousReasons.length > 0) {
            analysis.suspiciousIPs.push({
                ip: ip,
                ipInfo: ipData.ipInfo,
                count: ipData.count,
                emails: Array.from(ipData.emails),
                reasons: suspiciousReasons,
                firstSeen: ipData.firstSeen,
                lastSeen: ipData.lastSeen
            });
        }
    });

    return analysis;
}

// Calculate bot score (0-1, higher = more likely bot)
function calculateBotScore(submission, ipInfo) {
    let score = 0;
    const reasons = [];

    // VPN/Proxy increases bot likelihood
    if (ipInfo.is_vpn || ipInfo.is_proxy) score += 0.3;
    if (ipInfo.is_tor) score += 0.5;

    // Low reCAPTCHA score
    if (submission.recaptcha?.score && submission.recaptcha.score < 0.5) {
        score += 0.4;
    }

    // Missing or suspicious user agent
    if (!submission.userAgent || submission.userAgent === 'unknown') {
        score += 0.2;
    } else if (isSuspiciousUserAgent(submission.userAgent)) {
        score += 0.3;
    }

    // Random patterns in name/email
    if (isRandomPattern(submission.name)) score += 0.3;
    if (isRandomPattern(submission.email?.split('@')[0])) score += 0.2;

    return Math.min(score, 1.0);
}

function getBotReasons(submission, ipInfo) {
    const reasons = [];
    if (ipInfo.is_vpn || ipInfo.is_proxy) reasons.push('VPN/Proxy');
    if (ipInfo.is_tor) reasons.push('Tor network');
    if (submission.recaptcha?.score && submission.recaptcha.score < 0.5) {
        reasons.push(`Low reCAPTCHA score (${submission.recaptcha.score})`);
    }
    if (isRandomPattern(submission.name)) reasons.push('Random name pattern');
    if (isRandomPattern(submission.email?.split('@')[0])) reasons.push('Random email pattern');
    return reasons;
}

function isSuspiciousUserAgent(userAgent) {
    if (!userAgent) return true;
    const suspicious = ['bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python', 'java'];
    return suspicious.some(pattern => userAgent.toLowerCase().includes(pattern));
}

function isRandomPattern(text) {
    if (!text || text.length < 8) return false;
    const cleaned = text.toLowerCase();
    const vowels = (cleaned.match(/[aeiou]/g) || []).length;
    const consonants = (cleaned.match(/[bcdfghjklmnpqrstvwxyz]/g) || []).length;
    const totalLetters = vowels + consonants;
    if (totalLetters === 0) return false;
    const vowelRatio = vowels / totalLetters;
    return vowelRatio < 0.2 && totalLetters >= 10 && !/\s/.test(text);
}

// Generate comprehensive report
function generateReport(analysis) {
    console.log('\n' + '='.repeat(80));
    console.log('ENHANCED SPAM TRACKER REPORT');
    console.log('='.repeat(80));
    console.log(`\nTotal Submissions Analyzed: ${analysis.total}`);

    if (analysis.timePatterns.length > 0) {
        const sorted = analysis.timePatterns.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        console.log(`Date Range: ${new Date(sorted[0].timestamp).toLocaleString()} - ${new Date(sorted[sorted.length - 1].timestamp).toLocaleString()}`);
    }

    // Suspicious IPs
    if (analysis.suspiciousIPs.length > 0) {
        console.log('\n' + '-'.repeat(80));
        console.log('🚨 SUSPICIOUS IP ADDRESSES');
        console.log('-'.repeat(80));
        analysis.suspiciousIPs
            .sort((a, b) => b.count - a.count)
            .slice(0, 20)
            .forEach((suspicious, index) => {
                console.log(`\n${index + 1}. IP: ${suspicious.ip}`);
                console.log(`   Location: ${suspicious.ipInfo.city}, ${suspicious.ipInfo.country} (${suspicious.ipInfo.country_code})`);
                console.log(`   ISP: ${suspicious.ipInfo.isp}`);
                console.log(`   Submissions: ${suspicious.count}`);
                console.log(`   Emails: ${suspicious.emails.join(', ')}`);
                console.log(`   Flags: ${suspicious.reasons.join(', ')}`);
                if (suspicious.ipInfo.is_vpn) console.log(`   ⚠️  VPN DETECTED`);
                if (suspicious.ipInfo.is_proxy) console.log(`   ⚠️  PROXY DETECTED`);
                if (suspicious.ipInfo.is_tor) console.log(`   ⚠️  TOR NETWORK DETECTED`);
                console.log(`   First Seen: ${new Date(suspicious.firstSeen).toLocaleString()}`);
                console.log(`   Last Seen: ${new Date(suspicious.lastSeen).toLocaleString()}`);
            });
    } else {
        console.log('\n' + '-'.repeat(80));
        console.log('🚨 SUSPICIOUS IP ADDRESSES');
        console.log('-'.repeat(80));
        console.log('No suspicious IPs identified.');
    }

    // VPN/Proxy Users
    if (analysis.vpnUsers.length > 0) {
        console.log('\n' + '-'.repeat(80));
        console.log('🔒 VPN/PROXY/TOR USERS');
        console.log('-'.repeat(80));
        analysis.vpnUsers
            .sort((a, b) => b.submissionCount - a.submissionCount)
            .slice(0, 15)
            .forEach((vpn, index) => {
                console.log(`${index + 1}. ${vpn.ip} - ${vpn.country} (${vpn.isp})`);
                console.log(`   Submissions: ${vpn.submissionCount}, Emails: ${vpn.emails.length}`);
                if (vpn.is_vpn) console.log(`   Type: VPN`);
                if (vpn.is_proxy) console.log(`   Type: Proxy`);
                if (vpn.is_tor) console.log(`   Type: Tor`);
            });
    } else {
        console.log('\n' + '-'.repeat(80));
        console.log('🔒 VPN/PROXY/TOR USERS');
        console.log('-'.repeat(80));
        console.log('No VPN/Proxy/Tor users detected.');
    }

    // Bot Indicators
    if (analysis.botIndicators.length > 0) {
        console.log('\n' + '-'.repeat(80));
        console.log('🤖 BOT INDICATORS (High Bot Score)');
        console.log('-'.repeat(80));
        analysis.botIndicators
            .sort((a, b) => b.botScore - a.botScore)
            .slice(0, 20)
            .forEach((bot, index) => {
                console.log(`${index + 1}. IP: ${bot.ip}, Email: ${bot.email}`);
                console.log(`   Bot Score: ${(bot.botScore * 100).toFixed(1)}%`);
                console.log(`   Reasons: ${bot.reasons.join(', ')}`);
                console.log(`   Timestamp: ${new Date(bot.timestamp).toLocaleString()}`);
            });
    } else {
        console.log('\n' + '-'.repeat(80));
        console.log('🤖 BOT INDICATORS (High Bot Score)');
        console.log('-'.repeat(80));
        console.log('No high bot scores detected.');
    }

    // Geographic Distribution
    console.log('\n' + '-'.repeat(80));
    console.log('🌍 GEOGRAPHIC DISTRIBUTION');
    console.log('-'.repeat(80));
    const topCountries = Object.entries(analysis.geographicDistribution)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    if (topCountries.length > 0) {
        topCountries.forEach(([country, count], index) => {
            console.log(`${index + 1}. ${country}: ${count} submission(s)`);
        });
    } else {
        console.log('No geographic data available.');
    }

    // ISP Distribution
    console.log('\n' + '-'.repeat(80));
    console.log('📡 TOP ISPs');
    console.log('-'.repeat(80));
    const topISPs = Object.entries(analysis.ispDistribution)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    if (topISPs.length > 0) {
        topISPs.forEach(([isp, count], index) => {
            console.log(`${index + 1}. ${isp}: ${count} submission(s)`);
        });
    } else {
        console.log('No ISP data available.');
    }

    // Recommendations
    console.log('\n' + '-'.repeat(80));
    console.log('💡 RECOMMENDATIONS');
    console.log('-'.repeat(80));
    
    if (analysis.suspiciousIPs.length > 0) {
        console.log('\n1. Consider blocking these IP addresses:');
        analysis.suspiciousIPs.slice(0, 10).forEach(suspicious => {
            console.log(`   - ${suspicious.ip} (${suspicious.reasons.join(', ')})`);
        });
    }

    if (analysis.vpnUsers.length > analysis.total * 0.3) {
        console.log('\n2. High percentage of VPN/Proxy users detected. Consider:');
        console.log('   - Implementing stricter reCAPTCHA thresholds for VPN users');
        console.log('   - Requiring additional verification for VPN connections');
    }

    if (analysis.botIndicators.length > 0) {
        console.log('\n3. Bot activity detected. Consider:');
        console.log('   - Implementing additional bot detection measures');
        console.log('   - Adding honeypot fields');
        console.log('   - Increasing reCAPTCHA score threshold');
    }

    if (analysis.suspiciousIPs.length === 0 && analysis.botIndicators.length === 0) {
        console.log('\nNo immediate action required. System appears to be functioning normally.');
    }

    console.log('\n' + '='.repeat(80));
}

// Main execution
(async () => {
    try {
        console.log(`Reading log file: ${logFilePath}`);
        const submissions = readLogFile(logFilePath);

        if (submissions.length === 0) {
            console.log('No submissions found in log file.');
            process.exit(0);
        }

        console.log(`Found ${submissions.length} submission(s)`);
        const analysis = await analyzeWithIPTracking(submissions);
        generateReport(analysis);
    } catch (error) {
        console.error('Error analyzing logs:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
})();

