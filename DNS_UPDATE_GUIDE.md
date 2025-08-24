# DNS Update Guide - Current Status Analysis

## **✅ Already Working Perfectly:**

### **1. Apex Domain (woodenstonemi.com)**
- ✅ All 4 GitHub Pages A records configured
- ✅ IPs: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153

### **2. www Subdomain**
- ✅ CNAME correctly points to code-juan.github.io
- ✅ Both apex and www work

### **3. SPF Record**
- ✅ Already configured: `v=spf1 include:_spf-usg1.ppe-hosted.com include:secureserver.net ~all`

## **🔧 Updates Needed for Postmark:**

### **Current SPF Record:**
```
v=spf1 include:_spf-usg1.ppe-hosted.com include:secureserver.net ~all
```

### **Updated SPF Record (Add Postmark):**
```
v=spf1 include:_spf-usg1.ppe-hosted.com include:secureserver.net include:spf.mtasv.net ~all
```

**Action**: Update the existing SPF TXT record to include Postmark's servers.

### **Add DKIM Record:**
```
Type: TXT
Name: pm._domainkey
Value: [Get from Postmark dashboard]
TTL: 600
```

**Action**: Add new TXT record for Postmark DKIM.

### **Add DMARC Record:**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@woodenstonemi.com; ruf=mailto:dmarc@woodenstonemi.com; sp=quarantine; adkim=r; aspf=r;
TTL: 600
```

**Action**: Add new TXT record for DMARC.

## **📋 Step-by-Step GoDaddy Updates:**

### **Step 1: Update SPF Record**
1. Go to GoDaddy DNS Management
2. Find the existing TXT record with SPF
3. Update value to include Postmark: `v=spf1 include:_spf-usg1.ppe-hosted.com include:secureserver.net include:spf.mtasv.net ~all`

### **Step 2: Add DKIM Record**
1. Get DKIM value from Postmark dashboard
2. Add new TXT record:
   - Name: `pm._domainkey`
   - Value: [From Postmark]
   - TTL: 600

### **Step 3: Add DMARC Record**
1. Add new TXT record:
   - Name: `_dmarc`
   - Value: `v=DMARC1; p=quarantine; rua=mailto:dmarc@woodenstonemi.com; ruf=mailto:dmarc@woodenstonemi.com; sp=quarantine; adkim=r; aspf=r;`
   - TTL: 600

## **🔍 Verification Commands:**

After making changes, verify with:
```bash
nslookup -type=txt woodenstonemi.com
nslookup -type=txt pm._domainkey.woodenstonemi.com
nslookup -type=txt _dmarc.woodenstonemi.com
```

## **📅 Timeline:**
- **DNS Changes**: 24-48 hours to propagate
- **Postmark Verification**: Can be done immediately after DKIM is added

## **🎯 Summary:**
Your DNS is already 90% perfect! We just need to:
1. Update SPF to include Postmark
2. Add DKIM record from Postmark
3. Add DMARC record

This will ensure your emails from Postmark are properly authenticated and delivered.
