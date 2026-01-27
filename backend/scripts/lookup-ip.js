#!/usr/bin/env node

/**
 * Quick IP lookup tool to identify spammers
 * Usage: node backend/scripts/lookup-ip.js <IP_ADDRESS>
 * Example: node backend/scripts/lookup-ip.js 80.85.245.145
 */

const https = require('https');

const ip = process.argv[2];

if (!ip) {
    console.error('Error: IP address required');
    console.log('Usage: node backend/scripts/lookup-ip.js <IP_ADDRESS>');
    console.log('Example: node backend/scripts/lookup-ip.js 80.85.245.145');
    process.exit(1);
}

// Validate IP format
const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
if (!ipRegex.test(ip)) {
    console.error(`Error: "${ip}" is not a valid IP address`);
    process.exit(1);
}

console.log(`Looking up IP: ${ip}...\n`);

const url = `https://ipapi.co/${ip}/json/`;

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const result = JSON.parse(data);
            
            if (result.error) {
                console.error(`Error: ${result.reason || 'IP lookup failed'}`);
                process.exit(1);
            }

            console.log('='.repeat(80));
            console.log('IP ADDRESS INFORMATION');
            console.log('='.repeat(80));
            console.log(`\nIP Address: ${result.ip || ip}`);
            console.log(`\n📍 Location:`);
            console.log(`   Country: ${result.country_name || result.country || 'Unknown'} (${result.country_code || 'Unknown'})`);
            console.log(`   Region: ${result.region || 'Unknown'}`);
            console.log(`   City: ${result.city || 'Unknown'}`);
            console.log(`   Postal Code: ${result.postal || 'Unknown'}`);
            if (result.latitude && result.longitude) {
                console.log(`   Coordinates: ${result.latitude}, ${result.longitude}`);
                console.log(`   Map: https://www.google.com/maps?q=${result.latitude},${result.longitude}`);
            }
            console.log(`   Timezone: ${result.timezone || 'Unknown'}`);

            console.log(`\n🌐 Network Information:`);
            console.log(`   ISP: ${result.org || result.isp || 'Unknown'}`);
            console.log(`   ASN: ${result.asn || 'Unknown'}`);
            console.log(`   ASN Organization: ${result.org || 'Unknown'}`);

            console.log(`\n🔒 Security Flags:`);
            console.log(`   VPN: ${result.vpn === true ? '⚠️  YES - VPN DETECTED' : 'No'}`);
            console.log(`   Proxy: ${result.proxy === true ? '⚠️  YES - PROXY DETECTED' : 'No'}`);
            console.log(`   Tor: ${result.tor === true ? '⚠️  YES - TOR NETWORK DETECTED' : 'No'}`);
            
            if (result.vpn || result.proxy || result.tor) {
                console.log(`\n⚠️  WARNING: This IP is using VPN/Proxy/Tor - may be hiding real location`);
            }

            console.log(`\n📊 Additional Information:`);
            console.log(`   Currency: ${result.currency || 'Unknown'}`);
            console.log(`   Calling Code: ${result.country_calling_code || 'Unknown'}`);
            console.log(`   Languages: ${result.languages || 'Unknown'}`);

            // Threat intelligence
            if (result.vpn || result.proxy) {
                console.log(`\n💡 Recommendations:`);
                console.log(`   - This IP is likely using a VPN/Proxy service`);
                console.log(`   - Consider blocking this IP if it's associated with spam`);
                console.log(`   - The real location may be different from what's shown`);
            }

            console.log('\n' + '='.repeat(80));
        } catch (error) {
            console.error('Error parsing response:', error.message);
            process.exit(1);
        }
    });
}).on('error', (error) => {
    console.error('Error looking up IP:', error.message);
    process.exit(1);
});

