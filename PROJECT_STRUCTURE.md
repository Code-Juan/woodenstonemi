# Project Structure - The Wooden Stone LLC Website

## 📁 **Directory Organization**

```
woodenstonemi/
├── 📄 Configuration Files
│   ├── package.json              # Dependencies and scripts
│   ├── netlify.toml             # Netlify deployment config
│   ├── .gitignore               # Git ignore rules
│   └── CNAME                    # Custom domain config
│
├── 📁 Source Code (src/)
│   ├── 📁 pages/                # HTML pages
│   │   ├── index.html
│   │   ├── what-we-do.html
│   │   ├── scopes-materials.html
│   │   ├── project-portfolio.html
│   │   └── contact-us.html
│   │
│   ├── 📁 assets/               # Frontend assets
│   │   ├── style.css            # Main stylesheet
│   │   ├── script.js            # Main JavaScript
│   │   └── projects-data.js     # Project data
│   │
│   ├── 📁 config/               # Frontend configuration
│   └── 📁 scripts/              # Build/deployment scripts
│
├── 📁 Backend (backend/)
│   ├── server.js                # Main server file
│   ├── 📁 routes/               # API routes
│   │   └── contact.js           # Contact form API
│   ├── 📁 middleware/           # Express middleware
│   └── 📁 config/               # Backend configuration
│       └── env.example          # Environment variables template
│
├── 📁 Assets
│   ├── 📁 images/               # Image assets
│   │   ├── 📁 Scopes & Materials/
│   │   └── 📁 Previous Jobs/
│   ├── The Wooden Stone Logo (Transparent).svg
│   ├── The Wooden Stone Logo (Resized).svg
│   └── Wooden Stone Logo.svg
│
├── 📁 Build Output (dist/)      # Production build (auto-generated)
├── 📁 Uploads (uploads/)        # File uploads
│   └── 📁 temp/                 # Temporary upload files
│
└── 📄 Documentation
    ├── README.md                # Main project documentation
    ├── SETUP.md                 # Setup instructions
    ├── SECURITY.md              # Security documentation
    ├── EMAIL_SETUP.md           # Email configuration
    ├── POSTMARK_SETUP_GUIDE.md  # Postmark setup guide
    ├── EMAIL_IMPLEMENTATION_SUMMARY.md
    ├── DEPLOYMENT_CHECKLIST.md  # Deployment checklist
    └── FINAL_DEPLOYMENT_SUMMARY.md
```

## 🎯 **Best Practices Implemented**

### **1. Separation of Concerns**
- ✅ **Frontend/Backend separation**: Clear distinction between client and server code
- ✅ **Source/Build separation**: Development files separate from production build
- ✅ **Configuration isolation**: Environment and deployment configs properly organized

### **2. Asset Organization**
- ✅ **Logical grouping**: Images, styles, scripts in appropriate directories
- ✅ **Scalable structure**: Easy to add new assets without restructuring
- ✅ **Clear naming**: Descriptive file and directory names

### **3. Security & Configuration**
- ✅ **Environment variables**: Properly templated and documented
- ✅ **Security headers**: Implemented in server configuration
- ✅ **File upload security**: Restricted uploads with proper validation

### **4. Build Process**
- ✅ **Automated build**: Clean build script with proper asset copying
- ✅ **Path optimization**: Production-ready file paths
- ✅ **Deployment ready**: Netlify configuration properly set up

## 📋 **File Naming Conventions**

### **HTML Files**
- ✅ **kebab-case**: `contact-us.html`, `scopes-materials.html`
- ✅ **Descriptive names**: Clear indication of page purpose
- ✅ **Consistent structure**: All pages follow same naming pattern

### **Asset Files**
- ✅ **Responsive naming**: `-thumb`, `-gallery`, `-hero` suffixes
- ✅ **Consistent extensions**: Proper file type extensions
- ✅ **Organized directories**: Logical grouping by content type

### **Configuration Files**
- ✅ **Standard naming**: `package.json`, `netlify.toml`, `.gitignore`
- ✅ **Clear purpose**: Each config file has specific responsibility
- ✅ **Environment separation**: Development vs production configs

## 🔧 **Development Workflow**

### **Making Changes**
1. **Edit source files** in `src/` directory
2. **Test locally** using development server
3. **Run build** with `npm run build`
4. **Deploy** the `dist/` directory to Netlify

### **File Management**
- **Source files**: Always edit files in `src/`
- **Build files**: Never edit files in `dist/` (auto-generated)
- **Assets**: Add new images to `images/` directory
- **Configuration**: Update config files at root level

## 🚀 **Deployment Structure**

### **Production Build (`dist/`)**
```
dist/
├── index.html                   # Home page
├── what-we-do.html             # Services page
├── scopes-materials.html       # Materials page
├── project-portfolio.html      # Portfolio page
├── contact-us.html             # Contact page
├── 📁 assets/                  # Optimized assets
│   ├── style.css
│   ├── script.js
│   └── projects-data.js
├── 📁 images/                  # All image assets
└── *.svg                       # Logo files
```

### **Netlify Configuration**
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Redirects**: Properly configured for all pages
- **Custom domain**: CNAME file included

## 📊 **Performance Optimizations**

### **Asset Loading**
- ✅ **Preload critical resources**: CSS and JS preloaded
- ✅ **Lazy loading**: Images load as needed
- ✅ **Responsive images**: srcset for optimal loading
- ✅ **Optimized paths**: Production-ready file paths

### **Build Optimization**
- ✅ **Minimal dependencies**: Only necessary packages
- ✅ **Clean build process**: Efficient asset copying
- ✅ **Proper exclusions**: .gitignore covers all unnecessary files

## 🔒 **Security Considerations**

### **File Organization Security**
- ✅ **Environment variables**: Properly isolated
- ✅ **Upload restrictions**: Secure file handling
- ✅ **Path validation**: Prevents directory traversal
- ✅ **Clean temporary files**: Automatic cleanup

### **Deployment Security**
- ✅ **HTTPS enforcement**: SSL certificates
- ✅ **Security headers**: Helmet.js implementation
- ✅ **Rate limiting**: API protection
- ✅ **Input validation**: Form security

## 📝 **Maintenance Guidelines**

### **Adding New Pages**
1. Create HTML file in `src/pages/`
2. Update navigation in all pages
3. Add route in `netlify.toml` if needed
4. Test build process
5. Deploy and verify

### **Adding New Assets**
1. Place images in `images/` directory
2. Update HTML to reference new assets
3. Run build to copy to `dist/`
4. Test on deployed site

### **Updating Configuration**
1. Edit appropriate config file
2. Update documentation if needed
3. Test changes locally
4. Deploy and verify

---

**Status**: ✅ **Well-Organized & Production-Ready**
**Last Updated**: December 2024
**Best Practices**: ✅ **Fully Implemented**
