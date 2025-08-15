const express = require('express');
const { body, validationResult } = require('express-validator');
const Postmark = require('postmark');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Initialize Postmark client
const postmarkClient = new Postmark.ServerClient(process.env.POSTMARK_API_KEY);

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'temp');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/bmp',
        'image/tiff',
        'application/acad',
        'image/vnd.dwg',
        'application/zip',
        'application/x-rar-compressed'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, Word documents, images, CAD files, and compressed files are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB default
        files: parseInt(process.env.MAX_FILES_PER_REQUEST) || 5
    }
});

// Validation middleware
const validateContactForm = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    body('company')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Company name must be less than 100 characters'),
    body('projectType')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Project type must be less than 50 characters'),
    body('message')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Message must be between 10 and 2000 characters'),
    body('preferredContact')
        .optional()
        .isIn(['email', 'phone'])
        .withMessage('Preferred contact must be either email or phone'),
    // Honeypot field validation (should be empty)
    body(process.env.HONEYPOT_FIELD_NAME || 'website')
        .optional()
        .isEmpty()
        .withMessage('Form submission failed validation')
];

// Contact form submission endpoint
router.post('/submit', upload.array('attachments', parseInt(process.env.MAX_FILES_PER_REQUEST) || 5), validateContactForm, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const {
            name,
            email,
            phone,
            company,
            projectType,
            message,
            preferredContact
        } = req.body;

        // Get interested scopes from form data
        const interestedScopes = Array.isArray(req.body.interestedScopes)
            ? req.body.interestedScopes
            : req.body.interestedScopes ? [req.body.interestedScopes] : [];

        // Create enhanced email content
        const emailContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .header { background-color: #f8f9fa; padding: 20px; border-bottom: 3px solid #007bff; }
                    .content { padding: 20px; }
                    .field { margin-bottom: 15px; }
                    .label { font-weight: bold; color: #007bff; }
                    .value { margin-left: 10px; }
                    .scopes { background-color: #f8f9fa; padding: 10px; border-radius: 5px; }
                    .message-box { background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0; }
                    .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>🛠️ New Contact Form Submission</h2>
                    <p><strong>From:</strong> The Wooden Stone LLC Website</p>
                </div>
                
                <div class="content">
                    <div class="field">
                        <span class="label">Name:</span>
                        <span class="value">${name}</span>
                    </div>
                    
                    <div class="field">
                        <span class="label">Email:</span>
                        <span class="value"><a href="mailto:${email}">${email}</a></span>
                    </div>
                    
                    ${phone ? `<div class="field">
                        <span class="label">Phone:</span>
                        <span class="value"><a href="tel:${phone}">${phone}</a></span>
                    </div>` : ''}
                    
                    ${company ? `<div class="field">
                        <span class="label">Company:</span>
                        <span class="value">${company}</span>
                    </div>` : ''}
                    
                    ${projectType ? `<div class="field">
                        <span class="label">Project Type:</span>
                        <span class="value">${projectType}</span>
                    </div>` : ''}
                    
                    ${preferredContact ? `<div class="field">
                        <span class="label">Preferred Contact:</span>
                        <span class="value">${preferredContact}</span>
                    </div>` : ''}
                    
                    ${interestedScopes.length > 0 ? `<div class="field">
                        <span class="label">Interested Scopes:</span>
                        <div class="value scopes">${interestedScopes.join(', ')}</div>
                    </div>` : ''}
                    
                    <div class="field">
                        <span class="label">Message:</span>
                        <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
                    </div>
                    
                    ${req.files && req.files.length > 0 ? `<div class="field">
                        <span class="label">Attachments:</span>
                        <div class="value">${req.files.map(file => file.originalname).join(', ')}</div>
                    </div>` : ''}
                </div>
                
                <div class="footer">
                    <p>This message was sent from the contact form on woodenstonemi.com</p>
                    <p>Submitted at: ${new Date().toLocaleString()}</p>
                </div>
            </body>
            </html>
        `;

        // Prepare attachments for Postmark
        const attachments = req.files ? req.files.map(file => ({
            Name: file.originalname,
            Content: fs.readFileSync(file.path).toString('base64'),
            ContentType: file.mimetype
        })) : [];

        // Send email via Postmark
        const emailResponse = await postmarkClient.sendEmail({
            From: process.env.FROM_EMAIL || 'noreply@woodenstonemi.com',
            To: process.env.TO_EMAIL || 'info@woodenstonemi.com',
            Subject: `🛠️ New Contact Form Submission - ${name} (${projectType || 'General Inquiry'})`,
            HtmlBody: emailContent,
            TextBody: `
New Contact Form Submission

Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}
${company ? `Company: ${company}` : ''}
${projectType ? `Project Type: ${projectType}` : ''}
${preferredContact ? `Preferred Contact: ${preferredContact}` : ''}
${interestedScopes.length > 0 ? `Interested Scopes: ${interestedScopes.join(', ')}` : ''}

Message:
${message}

${req.files && req.files.length > 0 ? `Attachments: ${req.files.map(file => file.originalname).join(', ')}` : ''}

Submitted at: ${new Date().toLocaleString()}
            `,
            ReplyTo: email,
            MessageStream: 'outbound',
            Attachments: attachments
        });

        // Send confirmation email to the user
        const confirmationEmail = await postmarkClient.sendEmail({
            From: process.env.FROM_EMAIL || 'noreply@woodenstonemi.com',
            To: email,
            Subject: 'Thank you for contacting The Wooden Stone LLC',
            HtmlBody: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .header { background-color: #f8f9fa; padding: 20px; border-bottom: 3px solid #007bff; }
                        .content { padding: 20px; }
                        .message-box { background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0; }
                        .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>Thank you for contacting us!</h2>
                    </div>
                    
                    <div class="content">
                        <p>Dear ${name},</p>
                        
                        <p>Thank you for reaching out to <strong>The Wooden Stone LLC</strong>. We have received your message and will get back to you within 24-48 hours.</p>
                        
                        <p>Here's a copy of your message:</p>
                        <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
                        
                        <p>If you have any urgent questions, please don't hesitate to call us directly.</p>
                        
                        <p><strong>Best regards,<br>The Wooden Stone LLC Team</strong></p>
                    </div>
                    
                    <div class="footer">
                        <p>The Wooden Stone LLC<br>
                        44720 Trinity Dr, Clinton Township, MI 48038</p>
                    </div>
                </body>
                </html>
            `,
            TextBody: `
Thank you for contacting us!

Dear ${name},

Thank you for reaching out to The Wooden Stone LLC. We have received your message and will get back to you within 24-48 hours.

Here's a copy of your message:
${message}

If you have any urgent questions, please don't hesitate to call us directly.

Best regards,
The Wooden Stone LLC Team

The Wooden Stone LLC
44720 Trinity Dr, Clinton Township, MI 48038
            `,
            MessageStream: 'outbound'
        });

        // Clean up uploaded files
        if (req.files) {
            req.files.forEach(file => {
                try {
                    fs.unlinkSync(file.path);
                } catch (err) {
                    console.error('Error deleting file:', err);
                }
            });
        }

        res.json({
            success: true,
            message: 'Thank you for your message! We will get back to you soon.',
            emailId: emailResponse.MessageID
        });

    } catch (error) {
        console.error('Email sending error:', error);

        // Clean up uploaded files on error
        if (req.files) {
            req.files.forEach(file => {
                try {
                    fs.unlinkSync(file.path);
                } catch (err) {
                    console.error('Error deleting file:', err);
                }
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to send email. Please try again later or contact us directly.'
        });
    }
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'contact-api',
        timestamp: new Date().toISOString(),
        postmark: process.env.POSTMARK_API_KEY ? 'configured' : 'not configured'
    });
});

module.exports = router;
