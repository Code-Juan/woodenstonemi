# Postmark Email Setup Guide for The Wooden Stone LLC

This guide will walk you through setting up Postmark for your contact form email functionality.

## 🚀 Quick Start Checklist

- [ ] Create Postmark account
- [ ] Set up domain verification
- [ ] Configure DNS records (SPF, DKIM, DMARC)
- [ ] Get API key
- [ ] Update environment variables
- [ ] Test email functionality

## 📋 Step-by-Step Setup

### 1. Create Postmark Account

1. Go to [Postmark App](https://account.postmarkapp.com/sign_up)
2. Sign up for a free account (10,000 emails/month free)
3. Verify your email address

### 2. Create a Server

1. In your Postmark dashboard, click **"Add a Server"**
2. Choose **"Transactional"** (not Broadcast)
3. Name it something like "Wooden Stone Contact Form"
4. Click **"Create Server"**

### 3. Domain Setup

#### 3.1 Add Your Domain

1. In your server settings, go to **"Sender Signatures"**
2. Click **"Add a new signature"**
3. Enter your domain: `woodenstonemi.com`
4. Click **"Add signature"**

#### 3.2 Configure DNS Records

Postmark will provide you with specific DNS records to add. You'll need to add these to your domain's DNS settings:

**SPF Record:**
```
Type: TXT
Name: @ (or your domain)
Value: v=spf1 include:spf.mtasv.net ~all
```

**DKIM Record:**
```
Type: TXT
Name: [Postmark will provide specific name]
Value: [Postmark will provide specific value]
```

**DMARC Record (Optional but recommended):**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@woodenstonemi.com
```

### 4. Get Your API Key

1. In your server settings, go to **"API Tokens"**
2. Click **"Generate Token"**
3. Copy the token (it starts with something like `12345678-1234-1234-1234-123456789012`)

### 5. Update Environment Variables

1. Open `backend/config/.env`
2. Replace `your_postmark_api_key_here` with your actual API key
3. Update email addresses:
   ```
   POSTMARK_API_KEY=your_actual_api_key_here
   FROM_EMAIL=noreply@woodenstonemi.com
   TO_EMAIL=info@woodenstonemi.com
   ```

### 6. Test Your Setup

1. Start your server: `npm run dev`
2. Go to your contact form
3. Submit a test message
4. Check your email inbox
5. Check Postmark's Activity tab for delivery status

## 🔧 Configuration Options

### Email Addresses

You can customize these in your `.env` file:

```env
# Primary recipient for all contact form submissions
TO_EMAIL=info@woodenstonemi.com

# Optional: Different emails for different types of inquiries
SALES_EMAIL=sales@woodenstonemi.com
SUPPORT_EMAIL=support@woodenstonemi.com

# Sender address (must be verified in Postmark)
FROM_EMAIL=noreply@woodenstonemi.com
```

### File Upload Limits

```env
# Maximum file size (10MB = 10485760 bytes)
MAX_FILE_SIZE=10485760

# Maximum number of files per submission
MAX_FILES_PER_REQUEST=5
```

### Rate Limiting

```env
# Rate limit window (15 minutes = 900000ms)
RATE_LIMIT_WINDOW_MS=900000

# Maximum requests per window
RATE_LIMIT_MAX_REQUESTS=100
```

## 📧 Email Templates

The system sends two types of emails:

### 1. Notification Email (to you)
- **Subject:** 🛠️ New Contact Form Submission - [Name] ([Project Type])
- **Recipient:** Your business email
- **Content:** All form details with professional formatting
- **Attachments:** Any files uploaded by the user

### 2. Confirmation Email (to user)
- **Subject:** Thank you for contacting The Wooden Stone LLC
- **Recipient:** The person who submitted the form
- **Content:** Professional thank you message with their original message

## 🛡️ Security Features

### Spam Protection
- **Honeypot field:** Hidden field that bots fill out
- **Rate limiting:** Prevents abuse
- **File type validation:** Only allows safe file types
- **File size limits:** Prevents large uploads

### Data Validation
- Email format validation
- Phone number validation
- Required field validation
- File type and size validation

## 📊 Monitoring & Analytics

### Postmark Dashboard
- **Activity:** See all sent emails
- **Bounces:** Monitor delivery issues
- **Spam complaints:** Track reputation
- **Webhooks:** Get real-time notifications

### Health Check
Visit `/api/contact/health` to check if Postmark is configured correctly.

## 🚨 Troubleshooting

### Common Issues

**"Postmark API key not configured"**
- Check your `.env` file
- Ensure the API key is correct
- Restart your server

**"Domain not verified"**
- Check DNS records are correct
- Wait up to 24 hours for DNS propagation
- Verify domain in Postmark dashboard

**"Emails not sending"**
- Check Postmark Activity tab
- Verify FROM_EMAIL is verified
- Check server logs for errors

**"File uploads not working"**
- Check file size limits
- Verify file types are allowed
- Check uploads/temp directory exists

### Getting Help

1. Check Postmark's [documentation](https://postmarkapp.com/developer)
2. Review server logs for error messages
3. Test with Postmark's [API testing tool](https://account.postmarkapp.com/api_tokens)

## 🔄 Maintenance

### Regular Tasks
- Monitor Postmark Activity for bounces
- Check email delivery rates
- Review spam complaints
- Update DNS records if needed

### Scaling Up
- Consider dedicated IP if volume increases
- Set up webhooks for real-time monitoring
- Configure additional email addresses for different departments

## 📞 Support

For technical issues:
- Postmark Support: [support@postmarkapp.com](mailto:support@postmarkapp.com)
- Postmark Documentation: [https://postmarkapp.com/developer](https://postmarkapp.com/developer)

---

**Last Updated:** August 2024
**Version:** 1.0
