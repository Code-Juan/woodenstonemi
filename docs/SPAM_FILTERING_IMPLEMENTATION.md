# Spam Filtering Implementation Guide

## Overview

This document describes the spam filtering features that have been implemented to protect the contact form from spam submissions.

## Implemented Features

### 1. Name Pattern Detection ✅
**Location**: `backend/routes/contact.js`

Detects and blocks gibberish/random character patterns in names (e.g., "wvRFOqzhUlbbBTZmxyDzHI").

**How it works**:
- Checks for excessive consecutive consonants (5+ in a row)
- Analyzes vowel-to-consonant ratio (random strings have low vowel ratio < 0.2)
- Detects alternating case patterns
- Blocks submissions with suspicious name patterns

**Configuration**: Automatic, no configuration needed.

### 2. Duplicate Submission Blocking ✅
**Location**: `backend/routes/contact.js`

Prevents the same email address from submitting multiple forms within a short time window.

**How it works**:
- Tracks submission history per email address
- Blocks submissions if the same email submits 2+ times within 5 minutes
- Automatically cleans up old history to prevent memory leaks

**Configuration**: 
- Time window: 5 minutes (hardcoded, can be adjusted in code)
- Threshold: 2 submissions per window

### 3. reCAPTCHA v3 Integration ✅
**Location**: 
- Frontend: `src/pages/contact-us/index.html`
- Backend: `backend/routes/contact.js`

Google's invisible reCAPTCHA v3 provides bot detection without user interaction.

**How it works**:
- Executes on form submission
- Returns a score (0.0 to 1.0) indicating likelihood of bot behavior
- Blocks submissions below the threshold score

**Configuration**:
1. Get reCAPTCHA keys from: https://www.google.com/recaptcha/admin
2. Add to `backend/config/.env`:
   ```
   RECAPTCHA_SITE_KEY=your_site_key_here
   RECAPTCHA_SECRET_KEY=your_secret_key_here
   RECAPTCHA_SCORE_THRESHOLD=0.5
   ```
3. Update the reCAPTCHA script in `src/pages/contact-us/index.html`:
   ```html
   <script src="https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY"></script>
   ```

**Note**: If reCAPTCHA keys are not configured, the system will skip verification (useful for development).

### 4. Stricter Rate Limiting ✅
**Location**: `backend/server.js`

Reduced rate limits to prevent spam flooding.

**How it works**:
- General API rate limit: 10 requests per 15 minutes per IP (reduced from 100)
- Contact form rate limit: 5 submissions per 15 minutes per IP
- Uses IP-based tracking (works behind proxies with `trust proxy` enabled)

**Configuration**: 
- Set in `backend/config/.env`:
  ```
  RATE_LIMIT_MAX_REQUESTS=10
  ```
- Contact form limit is hardcoded to 5 (can be adjusted in `server.js`)

### 5. Submission Timing Detection ✅
**Location**: 
- Frontend: `src/pages/contact-us/index.html`
- Backend: `backend/routes/contact.js`

Detects bot-like behavior by analyzing how quickly forms are submitted.

**How it works**:
- Tracks time from form load to submission
- Blocks submissions that are too fast (< 3 seconds) with substantial content
- Helps catch automated form fillers

**Configuration**: Automatic, no configuration needed.

## Error Messages

The system returns user-friendly error messages for different spam detection scenarios:

- **reCAPTCHA failed**: "Security verification failed. Please refresh the page and try again."
- **Duplicate submission**: "You have already submitted a form recently. Please wait a few minutes before submitting again."
- **Invalid name**: "Please provide a valid name (first and last name)."
- **Submission too fast**: "Form submission appears automated. Please take your time filling out the form."

## Logging

All blocked spam attempts are still logged to `backend/logs/submissions.log` for analysis, even when they're rejected.

## Testing

To test the spam filters:

1. **Name Pattern Detection**: Try submitting with a name like "AbCdEfGhIjKlMnOp"
2. **Duplicate Blocking**: Submit the form twice quickly with the same email
3. **Rate Limiting**: Submit the form 6+ times within 15 minutes
4. **reCAPTCHA**: Configure keys and test with low scores (if possible)

## Monitoring

Monitor spam blocking effectiveness:
- Check server logs for "Spam blocked" messages
- Review `backend/logs/submissions.log` for patterns
- Run analysis scripts: `npm run analyze:logs` or `npm run analyze:postmark`

## Next Steps (Optional Enhancements)

1. **IP Blocking**: Add persistent IP blacklist for repeat offenders
2. **Email Domain Reputation**: Check against known spam domain lists
3. **Content Analysis**: Analyze project descriptions for spam patterns
4. **Machine Learning**: Train models on spam patterns for better detection

## Troubleshooting

**reCAPTCHA not working**:
- Verify site key and secret key are correct
- Check that the script tag has the correct site key
- Ensure domain is registered in reCAPTCHA admin console

**Rate limiting too strict**:
- Adjust `RATE_LIMIT_MAX_REQUESTS` in `.env`
- Modify contact form limit in `server.js`

**False positives**:
- Adjust `RECAPTCHA_SCORE_THRESHOLD` (lower = more strict)
- Modify name pattern detection thresholds in `isRandomPattern()` function
- Review logs to identify legitimate submissions being blocked

