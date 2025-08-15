const Postmark = require('postmark');
require('dotenv').config({ path: './config/.env' });

async function testPostmark() {
    console.log('🧪 Testing Postmark Configuration...\n');

    // Check environment variables
    console.log('📋 Environment Check:');
    console.log(`POSTMARK_API_KEY: ${process.env.POSTMARK_API_KEY ? '✅ Set' : '❌ Not set'}`);
    console.log(`FROM_EMAIL: ${process.env.FROM_EMAIL || '❌ Not set'}`);
    console.log(`TO_EMAIL: ${process.env.TO_EMAIL || '❌ Not set'}`);
    console.log('');

    if (!process.env.POSTMARK_API_KEY) {
        console.log('❌ POSTMARK_API_KEY not found in environment variables');
        console.log('Please update backend/config/.env with your Postmark API key');
        return;
    }

    if (!process.env.FROM_EMAIL || !process.env.TO_EMAIL) {
        console.log('❌ FROM_EMAIL or TO_EMAIL not set');
        console.log('Please update backend/config/.env with your email addresses');
        return;
    }

    try {
        // Initialize Postmark client
        const postmarkClient = new Postmark.ServerClient(process.env.POSTMARK_API_KEY);

        console.log('🔗 Testing Postmark connection...');

        // Test email content
        const testEmail = {
            From: process.env.FROM_EMAIL,
            To: process.env.TO_EMAIL,
            Subject: '🧪 Postmark Test Email - The Wooden Stone LLC',
            HtmlBody: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .header { background-color: #f8f9fa; padding: 20px; border-bottom: 3px solid #007bff; }
                        .content { padding: 20px; }
                        .success { color: #28a745; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>✅ Postmark Test Successful!</h2>
                    </div>
                    <div class="content">
                        <p>This is a test email to verify that your Postmark configuration is working correctly.</p>
                        <p class="success">🎉 Your contact form email system is ready to use!</p>
                        <p><strong>Test Details:</strong></p>
                        <ul>
                            <li>From: ${process.env.FROM_EMAIL}</li>
                            <li>To: ${process.env.TO_EMAIL}</li>
                            <li>Sent at: ${new Date().toLocaleString()}</li>
                        </ul>
                        <p>You can now test your contact form at your website.</p>
                    </div>
                </body>
                </html>
            `,
            TextBody: `
Postmark Test Successful!

This is a test email to verify that your Postmark configuration is working correctly.

🎉 Your contact form email system is ready to use!

Test Details:
- From: ${process.env.FROM_EMAIL}
- To: ${process.env.TO_EMAIL}
- Sent at: ${new Date().toLocaleString()}

You can now test your contact form at your website.
            `,
            MessageStream: 'outbound'
        };

        // Send test email
        const response = await postmarkClient.sendEmail(testEmail);

        console.log('✅ Test email sent successfully!');
        console.log(`📧 Message ID: ${response.MessageID}`);
        console.log(`📬 Sent to: ${process.env.TO_EMAIL}`);
        console.log('');
        console.log('🎉 Postmark configuration is working correctly!');
        console.log('');
        console.log('Next steps:');
        console.log('1. Check your email inbox for the test message');
        console.log('2. Test your contact form on your website');
        console.log('3. Monitor Postmark Activity dashboard for delivery status');

    } catch (error) {
        console.log('❌ Error testing Postmark:');
        console.log(error.message);
        console.log('');
        console.log('🔧 Troubleshooting:');
        console.log('1. Check your API key is correct');
        console.log('2. Verify your domain is set up in Postmark');
        console.log('3. Ensure FROM_EMAIL is verified in Postmark');
        console.log('4. Check Postmark dashboard for any errors');
    }
}

// Run the test
testPostmark();
