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
        files: parseInt(process.env.MAX_FILES_PER_REQUEST) || 10
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
    const { name, email, phone, company, projectType, projectDescription, interestedScopes, attachments } = data;

    const attachmentsList = attachments && attachments.length > 0
        ? attachments.map(file => `
            <div class="attachment-item">
                <div class="attachment-icon">📎</div>
                <div class="attachment-details">
                    <div class="attachment-name">${file.originalname}</div>
                    <div class="attachment-size">${(file.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
            </div>`).join('')
        : '<div class="no-attachments">No attachments provided</div>';

    // Map project type values to display names
    const projectTypeDisplayNames = {
        'multi-family': 'Multi-Family',
        'assisted-living': 'Assisted Living',
        'commercial': 'Commercial',
        'single-family': 'Single Family'
    };

    // Map scope values to display names
    const scopeDisplayNames = {
        'stone-countertops': 'Stone Countertops',
        'casework-supply': 'Casework Supply',
        'casework-installation': 'Casework Installation',
        'casework-finish-trim': 'Finish Trim Installation',
        'sink-fixture-supply': 'Sink Fixture Supply',
        'bathroom-accessory-supply': 'Bathroom Accessory Supply'
    };

    const scopesList = interestedScopes && interestedScopes.length > 0
        ? interestedScopes.map(scope => `<div class="scope-tag">${scopeDisplayNames[scope] || scope}</div>`).join('')
        : '<div class="no-scopes">No specific scopes selected</div>';

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Contact Form Submission</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    line-height: 1.6;
                    color: #2d3748;
                    background-color: #f7fafc;
                    padding: 20px;
                }
                
                .email-container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                    overflow: hidden;
                }
                
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 40px 30px;
                    text-align: center;
                }
                
                .header h1 {
                    font-size: 28px;
                    font-weight: 700;
                    margin-bottom: 8px;
                }
                
                .header p {
                    font-size: 16px;
                    opacity: 0.9;
                }
                
                .content {
                    padding: 40px 30px;
                }
                
                .section {
                    margin-bottom: 32px;
                }
                
                .section:last-child {
                    margin-bottom: 0;
                }
                
                .section-title {
                    font-size: 20px;
                    font-weight: 600;
                    color: #2d3748;
                    margin-bottom: 16px;
                    padding-bottom: 8px;
                    border-bottom: 2px solid #e2e8f0;
                }
                
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                
                .info-item {
                    background: #f7fafc;
                    padding: 16px;
                    border-radius: 8px;
                    border-left: 4px solid #667eea;
                }
                
                .info-label {
                    font-size: 12px;
                    font-weight: 600;
                    color: #718096;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 4px;
                }
                
                .info-value {
                    font-size: 16px;
                    font-weight: 500;
                    color: #2d3748;
                }
                
                .info-value a {
                    color: #667eea;
                    text-decoration: none;
                }
                
                .info-value a:hover {
                    text-decoration: underline;
                }
                
                .project-type {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 12px 20px;
                    border-radius: 8px;
                    font-weight: 600;
                    text-align: center;
                    font-size: 16px;
                }
                
                .scopes-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                
                .scope-tag {
                    background: #edf2f7;
                    color: #4a5568;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: 500;
                    border: 1px solid #e2e8f0;
                }
                
                .no-scopes {
                    color: #a0aec0;
                    font-style: italic;
                }
                
                .description {
                    background: #f7fafc;
                    padding: 20px;
                    border-radius: 8px;
                    border-left: 4px solid #48bb78;
                    white-space: pre-line;
                }
                
                .attachments-container {
                    background: #f7fafc;
                    padding: 20px;
                    border-radius: 8px;
                    border-left: 4px solid #ed8936;
                }
                
                .attachment-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: white;
                    border-radius: 6px;
                    margin-bottom: 8px;
                    border: 1px solid #e2e8f0;
                }
                
                .attachment-item:last-child {
                    margin-bottom: 0;
                }
                
                .attachment-icon {
                    font-size: 20px;
                }
                
                .attachment-details {
                    flex: 1;
                }
                
                .attachment-name {
                    font-weight: 500;
                    color: #2d3748;
                    margin-bottom: 2px;
                }
                
                .attachment-size {
                    font-size: 12px;
                    color: #718096;
                }
                
                .no-attachments {
                    color: #a0aec0;
                    font-style: italic;
                    text-align: center;
                    padding: 20px;
                }
                
                .footer {
                    background: #2d3748;
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                
                .footer p {
                    margin-bottom: 8px;
                    font-size: 14px;
                    opacity: 0.8;
                }
                
                .footer p:last-child {
                    margin-bottom: 0;
                }
                
                .timestamp {
                    background: #4a5568;
                    color: white;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 12px;
                    display: inline-block;
                    margin-top: 12px;
                }
                
                @media (max-width: 600px) {
                    .info-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .header, .content {
                        padding: 20px;
                    }
                    
                    .header h1 {
                        font-size: 24px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <h1>New Project Inquiry</h1>
                    <p>The Wooden Stone LLC</p>
                </div>
                
                <div class="content">
                    <div class="section">
                        <div class="section-title">Contact Information</div>
                        <div class="info-grid">
                            <div class="info-item">
                                <div class="info-label">Name</div>
                                <div class="info-value">${name}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Email</div>
                                <div class="info-value"><a href="mailto:${email}">${email}</a></div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Phone</div>
                                <div class="info-value">${phone || 'Not provided'}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Company</div>
                                <div class="info-value">${company}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">Project Type</div>
                        <div class="project-type">${projectTypeDisplayNames[projectType] || projectType}</div>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">Interested Scopes</div>
                        <div class="scopes-container">${scopesList}</div>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">Project Description</div>
                        <div class="description">${projectDescription || 'No description provided'}</div>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">Attachments</div>
                        <div class="attachments-container">${attachmentsList}</div>
                    </div>
                </div>
                
                <div class="footer">
                    <p>This message was sent from the contact form on woodenstonemi.com</p>
                    <p>Please respond to this inquiry within 24-48 hours</p>
                    <div class="timestamp">Submitted: ${new Date().toLocaleString()}</div>
                </div>
            </div>
        </body>
        </html>
    `;
}

// Generate text email template
function generateEmailText(data) {
    const { name, email, phone, company, projectType, projectDescription, interestedScopes, attachments } = data;

    const attachmentsList = attachments && attachments.length > 0
        ? attachments.map(file => `- ${file.originalname} (${(file.size / 1024 / 1024).toFixed(2)} MB)`).join('\n')
        : '- No attachments';

    // Map project type values to display names
    const projectTypeDisplayNames = {
        'multi-family': 'Multi-Family',
        'assisted-living': 'Assisted Living',
        'commercial': 'Commercial',
        'single-family': 'Single Family'
    };

    // Map scope values to display names
    const scopeDisplayNames = {
        'stone-countertops': 'Stone Countertops',
        'casework-supply': 'Casework Supply',
        'casework-installation': 'Casework Installation',
        'casework-finish-trim': 'Finish Trim Installation',
        'sink-fixture-supply': 'Sink Fixture Supply',
        'bathroom-accessory-supply': 'Bathroom Accessory Supply'
    };

    const scopesList = interestedScopes && interestedScopes.length > 0
        ? interestedScopes.map(scope => `- ${scopeDisplayNames[scope] || scope}`).join('\n')
        : '- No specific scopes selected';

    return `
New Contact Form Submission - The Wooden Stone LLC

CONTACT INFORMATION:
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Company: ${company}

PROJECT DETAILS:
Project Type: ${projectTypeDisplayNames[projectType] || projectType}

INTERESTED SCOPES:
${scopesList}

PROJECT DESCRIPTION:
${projectDescription || 'No description provided'}

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
router.post('/', upload.array('attachments', parseInt(process.env.MAX_FILES_PER_REQUEST) || 10), async (req, res) => {
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
            interestedScopes
        } = req.body;

        // Handle interested scopes (checkbox array)
        const scopesArray = Array.isArray(interestedScopes) ? interestedScopes :
            (interestedScopes ? [interestedScopes] : []);

        // Map project type values to display names
        const projectTypeDisplayNames = {
            'multi-family': 'Multi-Family',
            'assisted-living': 'Assisted Living',
            'commercial': 'Commercial',
            'single-family': 'Single Family'
        };

        // Prepare email content
        const emailContent = {
            From: process.env.FROM_EMAIL,
            To: process.env.TO_EMAIL,
            Subject: `New Contact Form Submission - ${projectTypeDisplayNames[projectType] || projectType} Project`,
            HtmlBody: generateEmailHTML({
                name,
                email,
                phone,
                company,
                projectType,
                projectDescription,
                interestedScopes: scopesArray,
                attachments: req.files
            }),
            TextBody: generateEmailText({
                name,
                email,
                phone,
                company,
                projectType,
                projectDescription,
                interestedScopes: scopesArray,
                attachments: req.files
            }),
            MessageStream: 'outbound'
        };

        // Add file attachments if any
        if (req.files && req.files.length > 0) {
            emailContent.Attachments = req.files.map(file => ({
                Name: file.originalname,
                Content: fs.readFileSync(file.path).toString('base64'),
                ContentType: file.mimetype
            }));
        }

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

// Preview email template endpoint
router.get('/preview', (req, res) => {
    // Sample data for preview
    const sampleData = {
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '(555) 123-4567',
        company: 'ABC Construction Company',
        projectType: 'assisted-living',
        projectDescription: 'We are looking to renovate the kitchen areas in our 50-unit assisted living facility. The project includes:\n\n- Replacing all countertops with granite\n- Installing new cabinets\n- Updating sink fixtures\n- Adding bathroom accessories\n\nWe would like to start the project within the next 3 months and are looking for a reliable contractor who can handle the entire scope of work.',
        interestedScopes: ['stone-countertops', 'casework-supply', 'sink-fixture-supply', 'bathroom-accessory-supply'],
        attachments: [
            { originalname: 'Project_Specifications.pdf', size: 2048576 },
            { originalname: 'Floor_Plan_DWG.dwg', size: 1048576 },
            { originalname: 'Budget_Estimate.xlsx', size: 512000 }
        ]
    };

    const htmlPreview = generateEmailHTML(sampleData);
    const textPreview = generateEmailText(sampleData);

    res.json({
        success: true,
        preview: {
            html: htmlPreview,
            text: textPreview,
            sampleData: sampleData
        }
    });
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
