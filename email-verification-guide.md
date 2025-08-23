# Email Verification Implementation Guide

## **Option 1: Simple Email Verification**

Add a verification step where users must click a link in their email before the form is fully submitted.

### **Implementation Steps:**

1. **Generate verification token**
2. **Send verification email**
3. **Verify token before processing form**

### **Code Example:**

```javascript
// In your contact route
const crypto = require('crypto');

// Generate verification token
function generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Store pending submissions (in production, use Redis or database)
const pendingSubmissions = new Map();

// Modified contact form handler
router.post('/verify-email', async (req, res) => {
    const { email } = req.body;
    const token = generateVerificationToken();
    
    // Store submission with token
    pendingSubmissions.set(token, { email, timestamp: Date.now() });
    
    // Send verification email
    const verificationEmail = {
        From: process.env.FROM_EMAIL,
        To: email,
        Subject: 'Verify your email - The Wooden Stone LLC',
        HtmlBody: `
            <h2>Email Verification Required</h2>
            <p>Please click the link below to verify your email address:</p>
            <a href="https://woodenstonemi.com/verify?token=${token}">Verify Email</a>
            <p>This link will expire in 1 hour.</p>
        `
    };
    
    await postmarkClient.sendEmail(verificationEmail);
    res.json({ success: true, message: 'Verification email sent' });
});
```

## **Option 2: reCAPTCHA Integration**

Add Google reCAPTCHA to prevent bots and spam.

### **Implementation:**

1. **Add reCAPTCHA to frontend**
2. **Verify token on backend**
3. **Only process form if verification passes**

## **Option 3: Rate Limiting by Email**

Limit submissions per email address.

```javascript
// Add to your validation
const emailSubmissionCount = new Map();

body('email')
    .custom((value) => {
        const count = emailSubmissionCount.get(value) || 0;
        if (count >= 3) {
            throw new Error('Too many submissions from this email address. Please try again later.');
        }
        emailSubmissionCount.set(value, count + 1);
        return true;
    })
```

## **Recommended Approach:**

For your use case, I recommend:
1. **Frontend validation** (already implemented)
2. **Enhanced backend validation** (already implemented)
3. **Rate limiting** (already implemented)
4. **Optional: reCAPTCHA** for additional spam protection

This provides a good balance of security without making the form too complex for legitimate users.
