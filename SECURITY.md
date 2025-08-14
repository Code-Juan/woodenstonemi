# Security Protocol for EmailJS Credentials

## 🚨 IMPORTANT: Credentials are currently exposed in code

Your EmailJS credentials are currently hardcoded in `script.js`. This is a security risk if your repository is public.

## Immediate Actions Required:

### 1. Create Environment Variables
Create a `.env` file in your project root (this file is already in .gitignore):

```bash
EMAILJS_USER_ID=ghhELlW-s8HL820_1
EMAILJS_SERVICE_ID=service_w7te4xp
EMAILJS_TEMPLATE_ID=template_zwu0xh8
```

### 2. For Static Site Hosting (GitHub Pages, Netlify, etc.)
Since this is a static site, you'll need to:

**Option A: Use Build-time Environment Variables**
- Set environment variables in your hosting platform
- Use a build process to inject them into the JavaScript

**Option B: Use a Backend Proxy**
- Create a simple backend service to handle email sending
- Keep credentials on the server side

**Option C: Use EmailJS Public Key Only (Current Setup)**
- The current setup uses only the public key
- This is relatively safe as it's designed to be public
- However, consider rate limiting and monitoring

## Current Risk Assessment:

✅ **Low Risk**: EmailJS public keys are designed to be public
⚠️ **Medium Risk**: Service and template IDs could be used to send emails through your account
🚨 **High Risk**: If someone gets your SMTP password, they could send emails as you

## Recommended Security Measures:

1. **Monitor EmailJS Dashboard** for unusual activity
2. **Set up rate limiting** in EmailJS if available
3. **Regularly rotate credentials** if possible
4. **Use environment variables** for production deployments
5. **Consider using a backend service** for sensitive applications

## For Production Deployment:

If deploying to a hosting service, set these environment variables:
- `EMAILJS_USER_ID`
- `EMAILJS_SERVICE_ID` 
- `EMAILJS_TEMPLATE_ID`

## Emergency Actions:

If credentials are compromised:
1. **Immediately change your EmailJS password**
2. **Regenerate your public key** in EmailJS dashboard
3. **Update your SMTP password** in GoDaddy
4. **Monitor for unauthorized email activity**
