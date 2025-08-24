# DNS Configuration Guide for GoDaddy

## **Current Setup:**
- **Domain**: `woodenstonemi.com`
- **Production Hosting**: GitHub Pages
- **Development Hosting**: Netlify (planned)
- **Backend**: Render (`wooden-stone-backend.onrender.com`)
- **Email Service**: Postmark

## **Required DNS Records**

### **1. Apex Domain (woodenstonemi.com) - GitHub Pages**
```
Type: A
Name: @ (or leave blank)
Value: 185.199.108.153
TTL: 600 (or default)
```

```
Type: A
Name: @ (or leave blank)
Value: 185.199.109.153
TTL: 600 (or default)
```

```
Type: A
Name: @ (or leave blank)
Value: 185.199.110.153
TTL: 600 (or default)
```

```
Type: A
Name: @ (or leave blank)
Value: 185.199.111.153
TTL: 600 (or default)
```

### **2. www Subdomain - GitHub Pages**
```
Type: CNAME
Name: www
Value: woodenstonemi.github.io
TTL: 600 (or default)
```

### **3. Development Subdomain - Netlify**
```
Type: CNAME
Name: dev
Value: your-netlify-site-name.netlify.app
TTL: 600 (or default)
```

### **4. Postmark Email Records**

#### **SPF Record (Sender Policy Framework)**
```
Type: TXT
Name: @ (or leave blank)
Value: v=spf1 include:spf.mtasv.net ~all
TTL: 600 (or default)
```

#### **DKIM Record (DomainKeys Identified Mail)**
```
Type: TXT
Name: pm._domainkey
Value: [Get this from Postmark dashboard]
TTL: 600 (or default)
```

#### **DMARC Record (Domain-based Message Authentication)**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@woodenstonemi.com; ruf=mailto:dmarc@woodenstonemi.com; sp=quarantine; adkim=r; aspf=r;
TTL: 600 (or default)
```

## **Step-by-Step Configuration**

### **Step 1: Access GoDaddy DNS Management**
1. Log into your GoDaddy account
2. Go to "My Products" → "Domains"
3. Find `woodenstonemi.com` and click "DNS"
4. Click "Manage DNS"

### **Step 2: Add A Records for Apex Domain**
1. Click "Add" → "A"
2. Add each of the 4 GitHub Pages IP addresses listed above
3. Set TTL to 600 seconds (or default)

### **Step 3: Add CNAME for www**
1. Click "Add" → "CNAME"
2. Name: `www`
3. Value: `woodenstonemi.github.io`
4. TTL: 600 seconds

### **Step 4: Add CNAME for dev (when ready)**
1. Click "Add" → "CNAME"
2. Name: `dev`
3. Value: `[your-netlify-site-name].netlify.app`
4. TTL: 600 seconds

### **Step 5: Add Postmark Email Records**
1. **SPF Record**: Add TXT record with SPF value
2. **DKIM Record**: Get from Postmark dashboard and add
3. **DMARC Record**: Add TXT record with DMARC value

## **Verification Commands**

### **Check A Records:**
```bash
nslookup woodenstonemi.com
```

### **Check CNAME Records:**
```bash
nslookup www.woodenstonemi.com
```

### **Check Email Records:**
```bash
nslookup -type=txt woodenstonemi.com
nslookup -type=txt pm._domainkey.woodenstonemi.com
nslookup -type=txt _dmarc.woodenstonemi.com
```

## **Important Notes:**

1. **DNS Propagation**: Changes can take 24-48 hours to propagate globally
2. **TTL Values**: Lower TTL (600 seconds) allows faster changes, higher TTL (3600+ seconds) improves performance
3. **Postmark Setup**: You'll need to get the exact DKIM value from your Postmark dashboard
4. **Netlify Setup**: The dev CNAME will be added after setting up Netlify

## **Troubleshooting:**

### **Common Issues:**
- **Apex domain not working**: Ensure all 4 GitHub Pages A records are added
- **www not working**: Check CNAME points to `woodenstonemi.github.io`
- **Email delivery issues**: Verify SPF, DKIM, and DMARC records are correct

### **Testing Tools:**
- **DNS Checker**: https://dnschecker.org
- **MXToolbox**: https://mxtoolbox.com
- **Postmark Email Testing**: Use Postmark's built-in testing tools

## **Next Steps:**
1. Configure these DNS records in GoDaddy
2. Wait for propagation (24-48 hours)
3. Test domain resolution
4. Test email delivery
5. Set up Netlify for development environment
