# Backend Deployment Guide - The Wooden Stone LLC

## 🚀 **Deploy to Render (Recommended)**

### **Step 1: Prepare Your Repository**

1. **Commit all changes** to your GitHub repository:
   ```bash
   git add .
   git commit -m "Add backend deployment configuration"
   git push origin main
   ```

### **Step 2: Deploy to Render**

1. **Go to [Render.com](https://render.com)** and sign up/login
2. **Click "New +"** → **"Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name**: `wooden-stone-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

### **Step 3: Set Environment Variables**

In Render dashboard, go to **Environment** tab and add:

**Required Variables:**
```
POSTMARK_API_KEY=your_actual_postmark_api_key
FROM_EMAIL=noreply@woodenstonemi.com
TO_EMAIL=info@woodenstonemi.com
```

**Optional Variables (already set in render.yaml):**
```
NODE_ENV=production
PORT=10000
SALES_EMAIL=sales@woodenstonemi.com
SUPPORT_EMAIL=support@woodenstonemi.com
SESSION_SECRET=auto_generated
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=10485760
MAX_FILES_PER_REQUEST=5
HONEYPOT_FIELD_NAME=website
```

### **Step 4: Deploy**

1. **Click "Create Web Service"**
2. **Wait for deployment** (usually 2-3 minutes)
3. **Copy your service URL** (e.g., `https://wooden-stone-backend.onrender.com`)

## 🔧 **Update Frontend to Use Production Backend**

Once deployed, update your frontend to call the production backend:

### **Option A: Environment-based API URL**

Create a config file in your frontend:
```javascript
// src/assets/config.js
const config = {
  apiUrl: window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://your-render-service-url.onrender.com'
};

export default config;
```

### **Option B: Update CORS for Production**

In your backend's CORS configuration, make sure your production domain is allowed:
```javascript
const allowedOrigins = [
  'http://localhost:8000',
  'http://localhost:3000',
  'https://woodenstonemi.com',
  'https://www.woodenstonemi.com',
  'https://dev.woodenstonemi.com'
];
```

## 🧪 **Test Production Deployment**

1. **Health Check**: Visit `https://your-service-url.onrender.com/api/contact/health`
2. **Test Form**: Submit a test form from your production website
3. **Check Logs**: Monitor Render logs for any errors

## 🔒 **Security Checklist**

- ✅ **HTTPS**: Automatic with Render
- ✅ **CORS**: Configured for your domains
- ✅ **Rate Limiting**: 100 requests/15 min per IP
- ✅ **Input Validation**: All fields validated
- ✅ **File Upload Limits**: 10MB max, 5 files max
- ✅ **Honeypot Protection**: Active
- ✅ **Security Headers**: Helmet configured

## 📊 **Monitoring**

- **Render Dashboard**: Monitor uptime and logs
- **Postmark Dashboard**: Check email delivery
- **Health Endpoint**: `/api/contact/health`

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **Build Fails**
   - Check `package.json` dependencies
   - Verify Node.js version compatibility

2. **Environment Variables Not Set**
   - Double-check variable names in Render dashboard
   - Ensure no extra spaces or quotes

3. **CORS Errors**
   - Verify your domain is in allowed origins
   - Check if using correct protocol (http vs https)

4. **Email Not Sending**
   - Verify Postmark API key
   - Check domain verification in Postmark
   - Review Render logs for errors

## 📞 **Support**

If you encounter issues:
1. Check Render deployment logs
2. Verify environment variables
3. Test health endpoint
4. Review this guide

---

**Next Steps:**
1. Deploy to Render
2. Update frontend API URL
3. Test in production
4. Configure DNS for your domains
