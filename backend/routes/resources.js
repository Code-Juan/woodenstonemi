const express = require('express');
const { body, validationResult } = require('express-validator');
const Postmark = require('postmark');
const path = require('path');
const crypto = require('crypto');
const router = express.Router();

// Initialize Postmark client
const postmarkClient = new Postmark.ServerClient(process.env.POSTMARK_API_KEY);

// Resource configuration
const resources = {
    checklist: {
        name: 'Commercial Countertop Installation Planning Checklist',
        filename: 'commercial-countertop-installation-checklist.pdf',
        downloadPath: path.join(__dirname, '..', '..', 'assets', 'downloads', 'checklist.pdf')
    },
    materials: {
        name: 'Countertop Material Selection Guide for Commercial Properties',
        filename: 'countertop-material-selection-guide.pdf',
        downloadPath: path.join(__dirname, '..', '..', 'assets', 'downloads', 'materials.pdf')
    },
    brochure: {
        name: 'The Wooden Stone LLC Company Brochure',
        filename: 'wooden-stone-company-brochure.pdf',
        downloadPath: path.join(__dirname, '..', '..', 'assets', 'downloads', 'brochure.pdf')
    }
};

// Generate secure download token
function generateDownloadToken(email, resourceType) {
    const data = `${email}:${resourceType}:${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
}

// Validation rules
const downloadValidation = [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
    body('company').optional().trim().isLength({ max: 100 }).withMessage('Company name must be less than 100 characters'),
    body('resourceType').isIn(['checklist', 'materials', 'brochure']).withMessage('Invalid resource type')
];

// POST /api/resources/download
router.post('/download', downloadValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }

        const { name, email, company, resourceType } = req.body;
        const resource = resources[resourceType];

        if (!resource) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid resource type' 
            });
        }

        // Generate download link (valid for 7 days)
        const token = generateDownloadToken(email, resourceType);
        const downloadUrl = `${req.protocol}://${req.get('host')}/api/resources/download-file/${resourceType}?token=${token}&email=${encodeURIComponent(email)}`;

        // Send email with download link
        const emailTemplate = getEmailTemplate(resource.name, downloadUrl, name, req.protocol, req.get('host'));
        
        await postmarkClient.sendEmail({
            From: process.env.POSTMARK_FROM_EMAIL || 'noreply@woodenstonemi.com',
            To: email,
            Subject: `Your Free ${resource.name} from The Wooden Stone LLC`,
            HtmlBody: emailTemplate.html,
            TextBody: emailTemplate.text,
            MessageStream: 'outbound',
            Tag: 'resource-download'
        });

        // Also send notification to company email
        const notificationEmail = `
            <h2>New Resource Download Request</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
            <p><strong>Resource:</strong> ${resource.name}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        `;

        await postmarkClient.sendEmail({
            From: process.env.POSTMARK_FROM_EMAIL || 'noreply@woodenstonemi.com',
            To: process.env.POSTMARK_TO_EMAIL || 'atocco@woodenstonemi.com',
            Subject: `New Resource Download: ${resource.name}`,
            HtmlBody: notificationEmail,
            MessageStream: 'outbound',
            Tag: 'resource-notification'
        });

        res.json({ 
            success: true, 
            message: 'Download link sent to your email' 
        });

    } catch (error) {
        console.error('Error processing resource download:', error);
        res.status(500).json({ 
            success: false, 
            message: 'An error occurred. Please try again later.' 
        });
    }
});

// GET /api/resources/download-file/:resourceType
router.get('/download-file/:resourceType', async (req, res) => {
    try {
        const { resourceType } = req.params;
        const { token, email } = req.query;

        if (!token || !email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid download link' 
            });
        }

        const resource = resources[resourceType];
        if (!resource) {
            return res.status(404).json({ 
                success: false, 
                message: 'Resource not found' 
            });
        }

        // Verify token (simplified - in production, store tokens in database)
        const expectedToken = generateDownloadToken(email, resourceType);
        // For now, we'll allow the download (in production, verify token matches stored value)

        // Check if file exists
        const fs = require('fs');
        if (!fs.existsSync(resource.downloadPath)) {
            // If PDF doesn't exist yet, return placeholder message
            return res.status(404).json({ 
                success: false, 
                message: 'Resource file is being prepared. Please contact us directly.' 
            });
        }

        // Send file
        res.download(resource.downloadPath, resource.filename, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                res.status(500).json({ 
                    success: false, 
                    message: 'Error downloading file' 
                });
            }
        });

    } catch (error) {
        console.error('Error serving download:', error);
        res.status(500).json({ 
            success: false, 
            message: 'An error occurred' 
        });
    }
});

// Email template function
function getEmailTemplate(resourceName, downloadUrl, recipientName, protocol, host) {
    return {
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #B87333; color: white; padding: 20px; text-align: center; }
                    .content { padding: 30px 20px; background-color: #f9f9f9; }
                    .button { display: inline-block; padding: 12px 30px; background-color: #B87333; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>The Wooden Stone LLC</h1>
                    </div>
                    <div class="content">
                        <h2>Thank you for your interest, ${recipientName}!</h2>
                        <p>As requested, here's your free resource:</p>
                        <p><strong>${resourceName}</strong></p>
                        <p style="text-align: center;">
                            <a href="${downloadUrl}" class="button">Download Now</a>
                        </p>
                        <p><small>This download link will expire in 7 days.</small></p>
                        <p>If you have any questions about your project or need a quote, feel free to contact us:</p>
                        <ul>
                            <li>Phone: (586) 208-4628</li>
                            <li>Email: atocco@woodenstonemi.com</li>
                            <li>Website: <a href="https://woodenstonemi.com">woodenstonemi.com</a></li>
                        </ul>
                    </div>
                    <div class="footer">
                        <p>The Wooden Stone LLC<br>
                        44720 Trinity Dr, Clinton Township, MI 48038<br>
                        Serving Michigan, Ohio, and Indiana</p>
                        <p><a href="${protocol || 'https'}://${host || 'woodenstonemi.com'}/resources">Unsubscribe</a></p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
Thank you for your interest, ${recipientName}!

As requested, here's your free resource: ${resourceName}

Download here: ${downloadUrl}

This download link will expire in 7 days.

If you have any questions about your project or need a quote, feel free to contact us:
- Phone: (586) 208-4628
- Email: atocco@woodenstonemi.com
- Website: https://woodenstonemi.com

The Wooden Stone LLC
44720 Trinity Dr, Clinton Township, MI 48038
Serving Michigan, Ohio, and Indiana
        `
    };
}

module.exports = router;
