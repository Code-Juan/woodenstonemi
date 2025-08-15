# Automated Image Processing Setup

## Quick Start (Fully Automated)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Automated Watcher
```bash
npm start
```

### 3. Add Images
Simply drag and drop images into the `images/` folder. The system will automatically:
- ✅ Compress images to optimal sizes
- ✅ Create responsive versions (thumbnail, gallery, hero, full)
- ✅ Update HTML files with proper srcset attributes
- ✅ Add lazy loading attributes

## How It Works

### **Fully Automated Process:**
1. **Drop Image** → Add any image to `images/` folder
2. **Auto-Process** → System detects new image and processes it
3. **Create Versions** → Generates 4 optimized sizes automatically
4. **Update HTML** → Adds responsive srcset attributes to all HTML files
5. **Ready to Use** → Image is immediately optimized and ready

### **What Gets Created:**
For each image `project-photo.jpg`, you get:
- `project-photo-thumb.jpg` (400x300px, 100KB)
- `project-photo-gallery.jpg` (800x600px, 300KB)
- `project-photo-hero.jpg` (1200x800px, 800KB)
- `project-photo.jpg` (1600x1200px, 1.2MB)

### **HTML Gets Updated:**
```html
<!-- Before -->
<img src="images/project-photo.jpg" alt="Project">

<!-- After (Automatically) -->
<img src="images/project-photo.jpg" 
     srcset="images/optimized/project-photo-thumb.jpg 400w,
             images/optimized/project-photo-gallery.jpg 800w,
             images/optimized/project-photo-hero.jpg 1200w,
             images/optimized/project-photo.jpg 1600w"
     sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
     loading="lazy"
     alt="Project">
```

## Development Workflow

### **For Daily Development:**
```bash
npm run dev
```
This starts both the local server AND the image watcher simultaneously.

### **For One-Time Processing:**
```bash
npm run optimize-all
```
Processes all existing images in the `images/` folder.

### **For New Images Only:**
```bash
npm run process-new
```
Processes only new images that haven't been optimized yet.

## File Organization

### **Recommended Structure:**
```
images/
├── projects/
│   ├── woodview-commons/
│   │   ├── kitchen-1.jpg          ← Drop original here
│   │   ├── kitchen-2.jpg
│   │   └── bathroom-1.jpg
│   └── new-project/
│       └── hero-shot.jpg
└── optimized/                     ← Auto-generated
    ├── projects/
    │   ├── woodview-commons/
    │   │   ├── kitchen-1-thumb.jpg
    │   │   ├── kitchen-1-gallery.jpg
    │   │   ├── kitchen-1-hero.jpg
    │   │   └── kitchen-1.jpg
    │   └── new-project/
    │       └── hero-shot-thumb.jpg
```

## Troubleshooting

### **If Images Aren't Processing:**
1. Check that the watcher is running: `npm start`
2. Verify image format: Supports .jpg, .jpeg, .png, .webp
3. Check console for error messages

### **If HTML Isn't Updating:**
1. Ensure image filename matches what's referenced in HTML
2. Check that HTML files are in the root directory
3. Verify file permissions

### **Performance Issues:**
1. Close other applications using the images folder
2. Restart the watcher: `Ctrl+C` then `npm start`
3. Check available disk space

## Advanced Configuration

### **Customize Image Sizes:**
Edit `upload-handler.js` CONFIG object:
```javascript
sizes: {
    thumbnail: { width: 400, height: 300, suffix: '-thumb' },
    gallery: { width: 800, height: 600, suffix: '-gallery' },
    hero: { width: 1200, height: 800, suffix: '-hero' },
    full: { width: 1600, height: 1200, suffix: '' }
}
```

### **Customize Quality:**
```javascript
quality: {
    jpg: 85,    // JPEG quality (0-100)
    webp: 80,   // WebP quality (0-100)
    png: 9      // PNG compression (0-9)
}
```

## Benefits

### **Time Savings:**
- ⚡ No manual compression needed
- ⚡ No manual HTML updates
- ⚡ No manual responsive image creation
- ⚡ Instant optimization for all new images

### **Performance Gains:**
- 🚀 Faster page loads
- 🚀 Better mobile performance
- 🚀 Reduced bandwidth usage
- 🚀 Improved SEO scores

### **User Experience:**
- 👥 Faster navigation between pages
- 👥 Smooth image loading
- 👥 Better experience on slow connections
- 👥 Responsive images for all devices
