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
        .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
        .withMessage('Please provide a valid email address')
        .custom((value) => {
            // Additional validation: check for common disposable email domains
            const disposableDomains = [
                '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
                'mailinator.com', 'throwaway.email', 'temp-mail.org',
                'yopmail.com', 'getnada.com', 'sharklasers.com'
            ];
            const domain = value.split('@')[1];
            if (disposableDomains.includes(domain)) {
                throw new Error('Disposable email addresses are not allowed');
            }
            return true;
        }),
    body('phone')
        .optional()
        .trim()
        .isLength({ min: 10, max: 20 })
        .withMessage('Phone number must be between 10 and 20 characters'),
    body('company')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Company name is required and must be less than 100 characters'),
    body('projectType')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Project type is required and must be less than 50 characters'),
    body('projectDescription')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Project description must be between 10 and 2000 characters'),
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

// Send confirmation email to user
async function sendConfirmationEmail(userEmail, userName) {
    try {
        // Validate email and name before sending
        if (!userEmail || !userName) {
            console.log('Skipping confirmation email: missing email or name', { userEmail, userName });
            return;
        }

        const confirmationEmail = {
            From: process.env.FROM_EMAIL,
            To: userEmail,
            Subject: 'Thank you for contacting The Wooden Stone LLC',
            HtmlBody: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .header { background-color: #f8f9fa; padding: 20px; border-bottom: 3px solid #007bff; }
                        .content { padding: 20px; }
                        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>Thank you for contacting The Wooden Stone LLC</h2>
                    </div>
                    <div class="content">
                        <p>Dear ${userName},</p>
                        <p>Thank you for reaching out to us. We have received your inquiry and will review it carefully.</p>
                        <p>Our team will get back to you within 24-48 hours with a detailed response.</p>
                        <p>If you have any urgent questions, please don't hesitate to call us directly.</p>
                        <p>Best regards,<br>The Wooden Stone LLC Team</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated confirmation email. Please do not reply to this message.</p>
                    </div>
                </body>
                </html>
            `,
            TextBody: `
Thank you for contacting The Wooden Stone LLC

Dear ${userName},

Thank you for reaching out to us. We have received your inquiry and will review it carefully.

Our team will get back to you within 24-48 hours with a detailed response.

If you have any urgent questions, please don't hesitate to call us directly.

Best regards,
The Wooden Stone LLC Team

---
This is an automated confirmation email. Please do not reply to this message.
            `,
            MessageStream: 'outbound'
        };

        await postmarkClient.sendEmail(confirmationEmail);
    } catch (error) {
        // Log error but don't fail the request
        console.error('Confirmation email error:', error.message);
    }
}

// Generate HTML email template
function generateEmailHTML(data) {
    const { name, email, phone, company, projectType, projectDescription, preferredContact, budget, timeline, additionalInfo, attachments } = data;

    const attachmentsList = attachments && attachments.length > 0
        ? attachments.map(file => `<li>${file.originalname} (${(file.size / 1024 / 1024).toFixed(2)} MB)</li>`).join('')
        : '<li>No attachments</li>';

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
                .header { background-color: #f8f9fa; padding: 20px; border-bottom: 3px solid #007bff; }
                .content { padding: 20px; }
                .section { margin-bottom: 20px; }
                .label { font-weight: bold; color: #007bff; }
                .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>New Contact Form Submission - The Wooden Stone LLC</h2>
            </div>
            <div class="content">
                <div class="section">
                    <h3>Contact Information</h3>
                    <p><span class="label">Name:</span> ${name}</p>
                    <p><span class="label">Email:</span> <a href="mailto:${email}">${email}</a></p>
                    <p><span class="label">Phone:</span> ${phone || 'Not provided'}</p>
                    <p><span class="label">Company:</span> ${company}</p>
                    <p><span class="label">Preferred Contact:</span> ${preferredContact || 'Not specified'}</p>
                </div>
                
                <div class="section">
                    <h3>Project Details</h3>
                    <p><span class="label">Project Type:</span> ${projectType}</p>
                    <p><span class="label">Budget Range:</span> ${budget || 'Not specified'}</p>
                    <p><span class="label">Timeline:</span> ${timeline || 'Not specified'}</p>
                </div>
                
                <div class="section">
                    <h3>Project Description</h3>
                    <p>${(projectDescription || '').replace(/\n/g, '<br>')}</p>
                </div>
                
                ${additionalInfo ? `
                <div class="section">
                    <h3>Additional Information</h3>
                    <p>${(additionalInfo || '').replace(/\n/g, '<br>')}</p>
                </div>
                ` : ''}
                
                <div class="section">
                    <h3>Attachments</h3>
                    <ul>${attachmentsList}</ul>
                </div>
            </div>
            <div class="footer">
                <p>This message was sent from the contact form on your website.</p>
                <p>Submitted on: ${new Date().toLocaleString()}</p>
            </div>
        </body>
        </html>
    `;
}

// Generate text email template
function generateEmailText(data) {
    const { name, email, phone, company, projectType, projectDescription, preferredContact, budget, timeline, additionalInfo, attachments } = data;

    const attachmentsList = attachments && attachments.length > 0
        ? attachments.map(file => `- ${file.originalname} (${(file.size / 1024 / 1024).toFixed(2)} MB)`).join('\n')
        : '- No attachments';

    return `
New Contact Form Submission - The Wooden Stone LLC

CONTACT INFORMATION:
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Company: ${company}
Preferred Contact: ${preferredContact || 'Not specified'}

PROJECT DETAILS:
Project Type: ${projectType}
Budget Range: ${budget || 'Not specified'}
Timeline: ${timeline || 'Not specified'}

PROJECT DESCRIPTION:
${projectDescription || 'No description provided'}

${additionalInfo ? `
ADDITIONAL INFORMATION:
${additionalInfo}
` : ''}

ATTACHMENTS:
${attachmentsList}

---
This message was sent from the contact form on your website.
Submitted on: ${new Date().toLocaleString()}
    `;
}

// Clean up uploaded files
function cleanupFiles(files) {
    if (!files || !Array.isArray(files)) return;

    files.forEach(file => {
        if (file.path && fs.existsSync(file.path)) {
            fs.unlink(file.path, (err) => {
                if (err) {
                    console.error('Error deleting file:', err.message);
                }
            });
        }
    });
}

// POST /api/contact - Handle contact form submission
router.post('/', upload.array('attachments', parseInt(process.env.MAX_FILES_PER_REQUEST) || 5), async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        // Extract form data
        const {
            name,
            email,
            phone,
            company,
            projectType,
            projectDescription,
            preferredContact,
            budget,
            timeline,
            additionalInfo
        } = req.body;

        // Prepare email content
        const emailContent = {
            From: process.env.FROM_EMAIL,
            To: process.env.TO_EMAIL,
            Subject: `New Contact Form Submission - ${projectType} Project`,
            HtmlBody: generateEmailHTML({
                name,
                email,
                phone,
                company,
                projectType,
                projectDescription,
                preferredContact,
                budget,
                timeline,
                additionalInfo,
                attachments: req.files
            }),
            TextBody: generateEmailText({
                name,
                email,
                phone,
                company,
                projectType,
                projectDescription,
                preferredContact,
                budget,
                timeline,
                additionalInfo,
                attachments: req.files
            }),
            MessageStream: 'outbound'
        };

        // Send email
        const response = await postmarkClient.sendEmail(emailContent);

        // Send confirmation email to user
        await sendConfirmationEmail(email, name);

        // Clean up uploaded files
        cleanupFiles(req.files);

        res.json({
            success: true,
            message: 'Thank you for your message. We will get back to you soon!',
            messageId: response.MessageID
        });

    } catch (error) {
        console.error('Email sending error:', error.message);

        // Clean up files even if email fails
        cleanupFiles(req.files);

        res.status(500).json({
            success: false,
            message: 'Sorry, there was an error sending your message. Please try again or contact us directly.'
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
