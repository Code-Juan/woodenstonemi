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
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #667eea; font-size: 16px;">📎</span>
                    <span style="margin-left: 8px; font-weight: 500; color: #2d3748;">${file.originalname}</span>
                    <span style="margin-left: 8px; font-size: 12px; color: #718096;">(${(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </td>
            </tr>`).join('')
        : '<tr><td style="padding: 8px 0; color: #a0aec0; font-style: italic;">No attachments provided</td></tr>';

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
        ? interestedScopes.map(scope => `<div style="background: #f7fafc; color: #2d3748; padding: 8px 12px; margin: 4px 0; border: 1px solid #e2e8f0; font-size: 14px; font-weight: 500;">• ${scopeDisplayNames[scope] || scope}</div>`).join('')
        : '<div style="color: #a0aec0; font-style: italic; padding: 8px 0;">No specific scopes selected</div>';

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Contact Form Submission</title>
        </head>
        <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; line-height: 1.6; color: #2d3748; background-color: #f7fafc;">
                         <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background: white; border: 1px solid #e2e8f0;">
                <!-- Header -->
                <tr>
                                         <td style="background: #667eea; color: white; padding: 30px; text-align: center;">
                        <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: bold;">New Project Inquiry</h1>
                        <p style="margin: 0; font-size: 16px; opacity: 0.9;">The Wooden Stone LLC</p>
                    </td>
                </tr>
                
                <!-- Content -->
                <tr>
                    <td style="padding: 30px;">
                        <!-- Contact Information -->
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 25px;">
                            <tr>
                                <td style="padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; margin-bottom: 16px;">
                                    <h2 style="margin: 0; font-size: 18px; color: #2d3748;">Contact Information</h2>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-top: 16px;">
                                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                        <tr>
                                            <td width="50%" style="padding: 8px; background: #f7fafc; border-left: 4px solid #667eea; margin-bottom: 8px;">
                                                <div style="font-size: 11px; font-weight: bold; color: #718096; text-transform: uppercase; margin-bottom: 4px;">NAME</div>
                                                <div style="font-size: 14px; font-weight: 500; color: #2d3748;">${name}</div>
                                            </td>
                                            <td width="50%" style="padding: 8px; background: #f7fafc; border-left: 4px solid #667eea; margin-bottom: 8px;">
                                                <div style="font-size: 11px; font-weight: bold; color: #718096; text-transform: uppercase; margin-bottom: 4px;">EMAIL</div>
                                                <div style="font-size: 14px; font-weight: 500; color: #2d3748;"><a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a></div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td width="50%" style="padding: 8px; background: #f7fafc; border-left: 4px solid #667eea;">
                                                <div style="font-size: 11px; font-weight: bold; color: #718096; text-transform: uppercase; margin-bottom: 4px;">PHONE</div>
                                                <div style="font-size: 14px; font-weight: 500; color: #2d3748;">${phone || 'Not provided'}</div>
                                            </td>
                                            <td width="50%" style="padding: 8px; background: #f7fafc; border-left: 4px solid #667eea;">
                                                <div style="font-size: 11px; font-weight: bold; color: #718096; text-transform: uppercase; margin-bottom: 4px;">COMPANY</div>
                                                <div style="font-size: 14px; font-weight: 500; color: #2d3748;">${company}</div>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                        
                        <!-- Project Type -->
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 25px;">
                            <tr>
                                <td style="padding-bottom: 8px; border-bottom: 2px solid #e2e8f0;">
                                    <h2 style="margin: 0; font-size: 18px; color: #2d3748;">Project Type</h2>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-top: 16px;">
                                                                         <div style="background: #667eea; color: white; padding: 12px 20px; text-align: center; font-weight: bold; font-size: 16px;">
                                         ${projectTypeDisplayNames[projectType] || projectType}
                                     </div>
                                </td>
                            </tr>
                        </table>
                        
                        <!-- Interested Scopes -->
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 25px;">
                            <tr>
                                <td style="padding-bottom: 8px; border-bottom: 2px solid #e2e8f0;">
                                    <h2 style="margin: 0; font-size: 18px; color: #2d3748;">Interested Scopes</h2>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-top: 16px;">
                                    ${scopesList}
                                </td>
                            </tr>
                        </table>
                        
                        <!-- Project Description -->
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 25px;">
                            <tr>
                                <td style="padding-bottom: 8px; border-bottom: 2px solid #e2e8f0;">
                                    <h2 style="margin: 0; font-size: 18px; color: #2d3748;">Project Description</h2>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-top: 16px; background: #f7fafc; padding: 20px; border-left: 4px solid #48bb78;">
                                    <div style="white-space: pre-line; color: #2d3748;">${projectDescription || 'No description provided'}</div>
                                </td>
                            </tr>
                        </table>
                        
                        <!-- Attachments -->
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 25px;">
                            <tr>
                                <td style="padding-bottom: 8px; border-bottom: 2px solid #e2e8f0;">
                                    <h2 style="margin: 0; font-size: 18px; color: #2d3748;">Attachments</h2>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-top: 16px; background: #f7fafc; padding: 20px; border-left: 4px solid #ed8936;">
                                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                        ${attachmentsList}
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                                         <td style="background: #2d3748; color: white; padding: 25px; text-align: center;">
                        <p style="margin: 0 0 8px 0; font-size: 14px; opacity: 0.8;">This message was sent from the contact form on woodenstonemi.com</p>
                        <p style="margin: 0 0 12px 0; font-size: 14px; opacity: 0.8;">Please respond to this inquiry within 24-48 hours</p>
                                                 <div style="background: #4a5568; color: white; padding: 8px 16px; font-size: 12px; margin-top: 8px;">
                             Submitted: ${new Date().toLocaleString()}
                         </div>
                    </td>
                </tr>
            </table>
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

// ============================================================================
// SPAM DETECTION FUNCTIONS
// ============================================================================

// Detect random/gibberish character patterns in names
function isRandomPattern(text) {
    if (!text || text.length < 8) return false;
    const cleaned = text.toLowerCase().trim();

    // Check for excessive consecutive consonants (common in random strings)
    const consecutiveConsonants = cleaned.match(/[bcdfghjklmnpqrstvwxyz]{5,}/g);
    if (consecutiveConsonants && consecutiveConsonants.length > 0) {
        return true;
    }

    // Check vowel-to-consonant ratio (random strings have low vowel ratio)
    const vowels = (cleaned.match(/[aeiou]/g) || []).length;
    const consonants = (cleaned.match(/[bcdfghjklmnpqrstvwxyz]/g) || []).length;
    const totalLetters = vowels + consonants;

    if (totalLetters === 0) return false;
    const vowelRatio = vowels / totalLetters;

    // Random patterns typically have low vowel ratio (< 0.2) and no spaces
    // Also check for excessive length without spaces (common in spam)
    if (vowelRatio < 0.2 && totalLetters >= 10 && !/\s/.test(text)) {
        return true;
    }

    // Check for alternating case patterns (e.g., "AbCdEfGh")
    const hasAlternatingCase = /([a-z][A-Z]){3,}/.test(text);
    if (hasAlternatingCase && text.length > 12) {
        return true;
    }

    return false;
}

// Check for duplicate submissions (same email within time window)
const submissionHistory = new Map(); // email -> [{timestamp, ip}, ...]

function checkDuplicateSubmission(email, ip, timeWindowMinutes = 5) {
    const now = Date.now();
    const windowMs = timeWindowMinutes * 60 * 1000;

    if (!submissionHistory.has(email)) {
        submissionHistory.set(email, []);
    }

    const history = submissionHistory.get(email);

    // Clean old entries (older than time window)
    const recentHistory = history.filter(entry => (now - entry.timestamp) < windowMs);
    submissionHistory.set(email, recentHistory);

    // Check if there are multiple submissions from same email
    if (recentHistory.length >= 2) {
        return {
            isDuplicate: true,
            count: recentHistory.length + 1,
            lastSubmission: new Date(recentHistory[recentHistory.length - 1].timestamp)
        };
    }

    // Add current submission to history
    recentHistory.push({ timestamp: now, ip });
    submissionHistory.set(email, recentHistory);

    return { isDuplicate: false, count: recentHistory.length };
}

// Clean up old submission history periodically (prevent memory leak)
setInterval(() => {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour

    for (const [email, history] of submissionHistory.entries()) {
        const recentHistory = history.filter(entry => (now - entry.timestamp) < maxAge);
        if (recentHistory.length === 0) {
            submissionHistory.delete(email);
        } else {
            submissionHistory.set(email, recentHistory);
        }
    }
}, 15 * 60 * 1000); // Run every 15 minutes

// Verify reCAPTCHA token
async function verifyRecaptcha(token) {
    if (!process.env.RECAPTCHA_SECRET_KEY) {
        // If no secret key configured, skip verification (for development)
        console.warn('RECAPTCHA_SECRET_KEY not configured, skipping verification');
        return { success: true, score: 0.9 };
    }

    if (!token) {
        return { success: false, error: 'reCAPTCHA token missing' };
    }

    try {
        // Use Node.js built-in https module for compatibility
        const https = require('https');
        const querystring = require('querystring');

        const postData = querystring.stringify({
            secret: process.env.RECAPTCHA_SECRET_KEY,
            response: token
        });

        const options = {
            hostname: 'www.google.com',
            path: '/recaptcha/api/siteverify',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const result = JSON.parse(data);

                        if (result.success) {
                            // reCAPTCHA v3 returns a score (0.0 to 1.0)
                            // Lower scores indicate bot-like behavior
                            const score = result.score || 0.5;
                            const threshold = parseFloat(process.env.RECAPTCHA_SCORE_THRESHOLD || '0.5');

                            resolve({
                                success: score >= threshold,
                                score: score,
                                action: result.action
                            });
                        } else {
                            resolve({
                                success: false,
                                error: result['error-codes']?.join(', ') || 'reCAPTCHA verification failed'
                            });
                        }
                    } catch (error) {
                        reject(error);
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.write(postData);
            req.end();
        });
    } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        return { success: false, error: 'Failed to verify reCAPTCHA' };
    }
}

// ============================================================================
// LOGGING FUNCTION
// ============================================================================

// Logging function for form submissions
function logSubmission(req, formData) {
    try {
        // Ensure logs directory exists
        const logsDir = path.join(__dirname, '..', 'logs');
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }

        // Extract client IP (trust proxy is enabled in server.js)
        const clientIP = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';

        // Prepare log entry
        const logEntry = {
            timestamp: new Date().toISOString(),
            ip: clientIP,
            userAgent: req.headers['user-agent'] || 'unknown',
            email: formData.email,
            name: formData.name,
            company: formData.company,
            projectType: formData.projectType,
            projectDescription: formData.projectDescription ? formData.projectDescription.substring(0, 200) : '', // Truncate for log
            phone: formData.phone || null,
            hasAttachments: (req.files && req.files.length > 0),
            attachmentCount: req.files ? req.files.length : 0,
            headers: {
                'accept': req.headers['accept'],
                'accept-language': req.headers['accept-language'],
                'referer': req.headers['referer']
            }
        };

        // Write to log file (JSON lines format)
        const logFile = path.join(logsDir, 'submissions.log');
        fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n', 'utf8');
    } catch (error) {
        // Don't fail the request if logging fails
        console.error('Error logging submission:', error.message);
    }
}

// POST /api/contact - Handle contact form submission
router.post('/', upload.array('attachments', parseInt(process.env.MAX_FILES_PER_REQUEST) || 10), validateContactForm, async (req, res) => {
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
            interestedScopes,
            recaptchaToken
        } = req.body;

        // Extract client IP for spam checks
        const clientIP = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';

        // ====================================================================
        // SPAM FILTERING CHECKS
        // ====================================================================

        // 1. Verify reCAPTCHA token (if provided)
        if (recaptchaToken) {
            const recaptchaResult = await verifyRecaptcha(recaptchaToken);
            if (!recaptchaResult.success) {
                console.log('Spam blocked: reCAPTCHA failed', { email, score: recaptchaResult.score });
                // Log the blocked submission for analysis
                logSubmission(req, {
                    name,
                    email,
                    phone,
                    company,
                    projectType,
                    projectDescription
                });
                return res.status(400).json({
                    success: false,
                    message: 'reCAPTCHA verification failed. Please try again.',
                    error: 'recaptcha_failed'
                });
            }
            // Log low scores for monitoring
            if (recaptchaResult.score < 0.7) {
                console.log('Low reCAPTCHA score detected', { email, score: recaptchaResult.score });
            }
        }

        // 2. Check for gibberish/random name patterns
        if (name && isRandomPattern(name)) {
            console.log('Spam blocked: Random name pattern detected', { email, name });
            logSubmission(req, {
                name,
                email,
                phone,
                company,
                projectType,
                projectDescription
            });
            return res.status(400).json({
                success: false,
                message: 'Invalid name format. Please provide a valid name.',
                error: 'invalid_name'
            });
        }

        // 3. Check for duplicate submissions (same email, rapid submissions)
        const duplicateCheck = checkDuplicateSubmission(email, clientIP, 5); // 5 minute window
        if (duplicateCheck.isDuplicate) {
            console.log('Spam blocked: Duplicate submission detected', {
                email,
                count: duplicateCheck.count,
                lastSubmission: duplicateCheck.lastSubmission
            });
            logSubmission(req, {
                name,
                email,
                phone,
                company,
                projectType,
                projectDescription
            });
            return res.status(429).json({
                success: false,
                message: 'You have already submitted a form recently. Please wait before submitting again.',
                error: 'duplicate_submission',
                retryAfter: 5
            });
        }

        // 4. Check submission timing (too fast = likely bot)
        const submissionStartTime = req.headers['x-submission-start-time'];
        if (submissionStartTime) {
            const timeSpent = Date.now() - parseInt(submissionStartTime);
            // If form was filled and submitted in less than 3 seconds, likely a bot
            if (timeSpent < 3000 && projectDescription && projectDescription.length > 50) {
                console.log('Spam blocked: Submission too fast', { email, timeSpent });
                logSubmission(req, {
                    name,
                    email,
                    phone,
                    company,
                    projectType,
                    projectDescription
                });
                return res.status(400).json({
                    success: false,
                    message: 'Form submission appears to be automated. Please take your time filling out the form.',
                    error: 'submission_too_fast'
                });
            }
        }

        // Log the submission (automatic logging)
        logSubmission(req, {
            name,
            email,
            phone,
            company,
            projectType,
            projectDescription
        });

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
