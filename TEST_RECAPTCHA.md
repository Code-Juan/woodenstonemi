# Testing reCAPTCHA v3 Setup

## Quick Test Checklist

### ✅ Frontend Test (Browser Console)

1. **Open your contact form page**
   - Go to: `https://woodenstonemi.com/contact-us` (or localhost for testing)

2. **Open Browser Developer Tools** (F12)
   - Go to **Console** tab

3. **Check if reCAPTCHA loaded:**
   ```javascript
   typeof grecaptcha
   ```
   - Should return: `"object"` (not `"undefined"`)

4. **Check if reCAPTCHA is ready:**
   ```javascript
   grecaptcha.ready(() => console.log("reCAPTCHA is ready"))
   ```

5. **Submit the form** and watch the console for:
   - ✅ No errors = Good
   - ❌ "reCAPTCHA error" = Problem with site key or script loading

### ✅ Backend Test (Server Logs)

1. **Submit a legitimate form** (fill it out normally, take your time)

2. **Check your Render logs** or local server console:
   - Look for: `"Low reCAPTCHA score detected"` (if score < 0.7)
   - Should NOT see: `"Spam blocked: reCAPTCHA failed"` for legitimate submissions

3. **Submit a suspicious form** (fill it out very quickly, like a bot):
   - Should see: `"Spam blocked: reCAPTCHA failed"` in logs
   - Form should be rejected

## Detailed Testing Steps

### Test 1: Verify reCAPTCHA Script Loads

**In Browser Console:**
```javascript
// Check if script loaded
document.querySelector('script[src*="recaptcha"]')
// Should return the script element

// Check if grecaptcha object exists
console.log(typeof grecaptcha)
// Should log: "object"
```

**Expected Result:** ✅ Script loads, `grecaptcha` object exists

---

### Test 2: Verify Token Generation

**In Browser Console (on contact form page):**
```javascript
// Get site key from script
const script = document.querySelector('script[src*="recaptcha"]');
const siteKey = script.src.match(/render=([^&]+)/)[1];
console.log('Site Key:', siteKey);

// Try to generate a token
grecaptcha.ready(() => {
    grecaptcha.execute(siteKey, { action: 'test' })
        .then(token => {
            console.log('✅ Token generated:', token.substring(0, 20) + '...');
            console.log('Token length:', token.length);
        })
        .catch(err => {
            console.error('❌ Token generation failed:', err);
        });
});
```

**Expected Result:** ✅ Token generated (long string, ~1000+ characters)

---

### Test 3: Test Form Submission (Legitimate User)

1. **Fill out the contact form normally:**
   - Take 10+ seconds to fill it out
   - Use a real name (not gibberish)
   - Use a valid email
   - Write a reasonable project description

2. **Submit the form**

3. **Check results:**
   - ✅ Form submits successfully
   - ✅ Success message appears
   - ✅ No errors in browser console
   - ✅ Backend logs show successful submission (no "Spam blocked" message)

**Expected Result:** ✅ Form submits successfully

---

### Test 4: Test Form Submission (Bot-like Behavior)

1. **Fill out the form very quickly:**
   - Fill all fields in < 3 seconds
   - Use gibberish name like "AbCdEfGhIjKlMn"
   - Submit immediately

2. **Check results:**
   - ❌ Form should be rejected
   - ❌ Error message: "reCAPTCHA verification failed" or "Form submission appears automated"
   - ✅ Backend logs show: `"Spam blocked: reCAPTCHA failed"` or `"Spam blocked: Submission too fast"`

**Expected Result:** ✅ Bot-like behavior is blocked

---

### Test 5: Verify Backend Verification

**Check your Render logs or local server console after submission:**

Look for these log messages:

**Success (legitimate user):**
```
Low reCAPTCHA score detected { email: 'user@example.com', score: 0.6 }
```
- Score 0.6-1.0 = Usually passes (above threshold 0.5)

**Blocked (bot/spam):**
```
Spam blocked: reCAPTCHA failed { email: 'spam@example.com', score: 0.2 }
```
- Score < 0.5 = Blocked

---

### Test 6: Test Without reCAPTCHA Token

**Simulate missing token (in browser console):**
```javascript
// Temporarily disable reCAPTCHA
const form = document.getElementById('contactForm');
const originalSubmit = form.onsubmit;
form.onsubmit = null;

// Try to submit without token
form.dispatchEvent(new Event('submit'));
```

**Expected Result:** 
- Form should still work (graceful degradation)
- Other spam filters still active (name detection, duplicate blocking, etc.)

---

## Common Issues & Solutions

### Issue: "reCAPTCHA error" in console

**Possible Causes:**
1. Site key not in script tag
2. Domain not registered in reCAPTCHA admin
3. Network issue loading reCAPTCHA script

**Solutions:**
- Check script tag has correct site key
- Verify domain in reCAPTCHA admin: https://www.google.com/recaptcha/admin
- Check browser network tab for failed requests

---

### Issue: "RECAPTCHA_SECRET_KEY not configured" in backend logs

**Cause:** Secret key not set in Render environment variables

**Solution:**
1. Go to Render dashboard
2. Add `RECAPTCHA_SECRET_KEY` environment variable
3. Restart service

---

### Issue: All submissions blocked (even legitimate ones)

**Possible Causes:**
1. Threshold too high (currently 0.5)
2. Domain not registered in reCAPTCHA
3. reCAPTCHA not working correctly

**Solutions:**
- Lower threshold: Set `RECAPTCHA_SCORE_THRESHOLD=0.3` in Render
- Verify domain in reCAPTCHA admin
- Check reCAPTCHA admin dashboard for issues

---

### Issue: reCAPTCHA not blocking anything

**Possible Causes:**
1. Secret key not configured (skips verification)
2. Token not being sent from frontend
3. Threshold too low

**Solutions:**
- Check Render environment variables
- Check browser network tab - should see `recaptchaToken` in form data
- Check backend logs for reCAPTCHA verification messages

---

## Automated Test Script

You can also create a simple test script:

```javascript
// test-recaptcha.js - Run in browser console on contact form page
async function testRecaptcha() {
    console.log('Testing reCAPTCHA setup...');
    
    // 1. Check script loaded
    const script = document.querySelector('script[src*="recaptcha"]');
    if (!script) {
        console.error('❌ reCAPTCHA script not found');
        return;
    }
    console.log('✅ reCAPTCHA script found');
    
    // 2. Check grecaptcha object
    if (typeof grecaptcha === 'undefined') {
        console.error('❌ grecaptcha object not loaded');
        return;
    }
    console.log('✅ grecaptcha object loaded');
    
    // 3. Get site key
    const match = script.src.match(/render=([^&]+)/);
    if (!match) {
        console.error('❌ Site key not found in script');
        return;
    }
    const siteKey = match[1];
    console.log('✅ Site key:', siteKey);
    
    // 4. Test token generation
    try {
        await grecaptcha.ready();
        const token = await grecaptcha.execute(siteKey, { action: 'test' });
        console.log('✅ Token generated successfully');
        console.log('Token preview:', token.substring(0, 50) + '...');
        return true;
    } catch (error) {
        console.error('❌ Token generation failed:', error);
        return false;
    }
}

// Run test
testRecaptcha();
```

---

## Production Monitoring

After deployment, monitor:

1. **Backend Logs:**
   - Frequency of "Spam blocked: reCAPTCHA failed"
   - Average reCAPTCHA scores
   - Low score warnings

2. **reCAPTCHA Admin Dashboard:**
   - Go to: https://www.google.com/recaptcha/admin
   - Check analytics for your site
   - Monitor request volume and scores

3. **Form Submission Success Rate:**
   - Track legitimate submissions vs blocked
   - Adjust threshold if too many false positives/negatives

---

## Quick Verification Checklist

- [ ] reCAPTCHA script loads (check browser console)
- [ ] `grecaptcha` object exists
- [ ] Token generated on form submit (check network tab)
- [ ] Backend receives token (check logs)
- [ ] Backend verifies token with Google (check logs)
- [ ] Legitimate submissions pass (score > 0.5)
- [ ] Bot-like submissions blocked (score < 0.5)
- [ ] Secret key configured in Render
- [ ] Domain registered in reCAPTCHA admin




