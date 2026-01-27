# Security Protocol for Email System Credentials

## 🚨 IMPORTANT: Email System Security

The current email system uses Postmark for secure email delivery. This document outlines security best practices for the email system.

## Immediate Actions Required:

### 1. Create Environment Variables
Create a `.env` file in your project root (this file is already in .gitignore):

```bash
POSTMARK_API_KEY=your_postmark_api_key_here
FROM_EMAIL=noreply@woodenstonemi.com
TO_EMAIL=info@woodenstonemi.com
```

### 2. For Static Site Hosting (GitHub Pages, Netlify, etc.)
Since this is a static site, you'll need to:

**Option A: Use Build-time Environment Variables**
- Set environment variables in your hosting platform
- Use a build process to inject them into the JavaScript

**Option B: Use a Backend Proxy**
- Create a simple backend service to handle email sending
- Keep credentials on the server side

**Option C: Use Postmark API (Current Setup)**
- The current setup uses Postmark API for secure email delivery
- API keys are stored securely in environment variables
- Includes rate limiting and monitoring

## Current Risk Assessment:

✅ **Low Risk**: Postmark API keys are stored securely in environment variables
⚠️ **Medium Risk**: API keys should be rotated regularly
🚨 **High Risk**: If API keys are exposed, they could be used to send emails through your account

## Recommended Security Measures:

1. **Monitor Postmark Dashboard** for unusual activity
2. **Set up rate limiting** in Postmark if available
3. **Regularly rotate credentials** if possible
4. **Use environment variables** for production deployments
5. **Consider using a backend service** for sensitive applications

## For Production Deployment:

If deploying to a hosting service, set these environment variables:
- `POSTMARK_API_KEY`
- `FROM_EMAIL`
- `TO_EMAIL`

## Emergency Actions:

If credentials are compromised:
1. **Immediately regenerate your Postmark API key**
2. **Update environment variables** with new API key
3. **Monitor Postmark dashboard** for unauthorized activity
4. **Check email delivery logs** for suspicious activity
