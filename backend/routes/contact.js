const express = require('express');
const { body, validationResult } = require('express-validator');
const Postmark = require('postmark');
const router = express.Router();

// Initialize Postmark client
const postmarkClient = new Postmark.ServerClient(process.env.POSTMARK_API_KEY);

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
        .withMessage('Preferred contact must be either email or phone')
];

// Contact form submission endpoint
router.post('/submit', validateContactForm, async (req, res) => {
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

        // Create email content
        const emailContent = `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
            ${projectType ? `<p><strong>Project Type:</strong> ${projectType}</p>` : ''}
            ${preferredContact ? `<p><strong>Preferred Contact:</strong> ${preferredContact}</p>` : ''}
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
        `;

        // Send email via Postmark
        const emailResponse = await postmarkClient.sendEmail({
            From: process.env.FROM_EMAIL || 'noreply@woodenstonemi.com',
            To: process.env.TO_EMAIL || 'info@woodenstonemi.com',
            Subject: `New Contact Form Submission - ${name}`,
            HtmlBody: emailContent,
            TextBody: `
                New Contact Form Submission
                
                Name: ${name}
                Email: ${email}
                ${phone ? `Phone: ${phone}` : ''}
                ${company ? `Company: ${company}` : ''}
                ${projectType ? `Project Type: ${projectType}` : ''}
                ${preferredContact ? `Preferred Contact: ${preferredContact}` : ''}
                
                Message:
                ${message}
            `,
            ReplyTo: email,
            MessageStream: 'outbound'
        });

        // Send confirmation email to the user
        const confirmationEmail = await postmarkClient.sendEmail({
            From: process.env.FROM_EMAIL || 'noreply@woodenstonemi.com',
            To: email,
            Subject: 'Thank you for contacting The Wooden Stone LLC',
            HtmlBody: `
                <h2>Thank you for contacting us!</h2>
                <p>Dear ${name},</p>
                <p>Thank you for reaching out to The Wooden Stone LLC. We have received your message and will get back to you within 24-48 hours.</p>
                <p>Here's a copy of your message:</p>
                <blockquote>${message}</blockquote>
                <p>If you have any urgent questions, please don't hesitate to call us directly.</p>
                <p>Best regards,<br>The Wooden Stone LLC Team</p>
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
            `,
            MessageStream: 'outbound'
        });

        res.json({
            success: true,
            message: 'Thank you for your message! We will get back to you soon.',
            emailId: emailResponse.MessageID
        });

    } catch (error) {
        console.error('Email sending error:', error);
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
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
