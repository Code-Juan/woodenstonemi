# EmailJS Setup Guide for Contact Form

This guide will help you set up EmailJS to enable email functionality for the contact form on your website.

## Step 1: Sign up for EmailJS

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click "Sign Up" and create a free account
3. Verify your email address

## Step 2: Create an Email Service

1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the authentication steps for your email provider
5. Note down the **Service ID** (you'll need this later)

## Step 3: Create an Email Template

1. Go to "Email Templates" in your EmailJS dashboard
2. Click "Create New Template"
3. Use this template content:

**Subject:**
```
New Quote Request - {{project_type}} Project
```

**Email Body:**
```
New quote request from {{from_name}} ({{from_company}})

Contact Information:
- Email: {{from_email}}
- Phone: {{from_phone}}

Project Details:
- Project Type: {{project_type}}
- Interested Scopes: {{interested_scopes}}

Project Description:
{{project_description}}

This message was sent from the contact form on your website.
```

4. Save the template and note down the **Template ID**

## Step 4: Get Your User ID

1. In your EmailJS dashboard, go to "Account" → "API Keys"
2. Copy your **Public Key** (this is your User ID)

## Step 5: Update the JavaScript Code

Open `script.js` and replace the placeholder values with your actual credentials:

```javascript
// Replace 'YOUR_USER_ID' with your EmailJS Public Key
emailjs.init('YOUR_USER_ID');

// Replace 'YOUR_SERVICE_ID' with your Email Service ID
// Replace 'YOUR_TEMPLATE_ID' with your Email Template ID
emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
```

## Step 6: Test the Form

1. Upload your updated files to your website
2. Go to the Contact Us page
3. Fill out and submit the form
4. Check your email to confirm you received the message

## Troubleshooting

- **Form not sending**: Check that all EmailJS credentials are correctly entered
- **Email not received**: Check your spam folder and EmailJS dashboard for delivery status
- **Template variables not working**: Make sure the variable names in your template match those in the JavaScript code

## Free Plan Limitations

EmailJS free plan includes:
- 200 emails per month
- Basic email templates
- Standard support

For more emails or advanced features, consider upgrading to a paid plan.

## Alternative: Mailto Fallback

If EmailJS is not configured, the form will fall back to opening the user's default email client with a pre-filled message. This ensures the form always works, even without EmailJS setup.
