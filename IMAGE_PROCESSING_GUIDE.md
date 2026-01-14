# Image Processing Guide

This guide explains how to process images for the portfolio using ImageMagick.

## Overview

Each project image needs **4 versions** created:
1. **Original**: Full-size image (e.g., `kitchen-view1.jpg`)
2. **Thumb**: 400x300px (e.g., `kitchen-view1-thumb.jpg`) - for mobile
3. **Gallery**: 800x600px (e.g., `kitchen-view1-gallery.jpg`) - for tablets
4. **Hero**: 1200x800px (e.g., `kitchen-view1-hero.jpg`) - for desktop

## Prerequisites

- **ImageMagick** must be installed (already installed on your system)
- Verify installation: `magick --version`

## How to Process Images

### Option 1: Process a Single Image

```bash
node process-images.js "images/Previous Jobs/24. New Project/kitchen-view1.jpg"
```

This will create:
- `kitchen-view1-thumb.jpg`
- `kitchen-view1-gallery.jpg`
- `kitchen-view1-hero.jpg`

### Option 2: Process All Images in a Folder

```bash
node process-images.js "images/Previous Jobs/24. New Project"
```

This will process all unprocessed images in the folder (skips images that already have `-thumb`, `-gallery`, or `-hero` suffixes).

### Option 3: Using npm script

```bash
npm run process:images "images/Previous Jobs/24. New Project"
```

## Workflow for Adding a New Project

### Step 1: Add Images to Project Folder

1. Create a folder in `images/Previous Jobs/` (e.g., `24. New Project Name`)
2. Add your original images to this folder
   - Use descriptive names: `kitchen-view1.jpg`, `bathroom-view1.jpg`, etc.
   - Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`

### Step 2: Process the Images

Run the processing script on the folder:

```bash
node process-images.js "images/Previous Jobs/24. New Project Name"
```

The script will:
- ✅ Create thumb, gallery, and hero versions for each image
- ✅ Optimize images (strip metadata, compress)
- ✅ Skip images that are already processed

### Step 3: Add Project to Portfolio

1. Open `src/assets/projects-data.js`
2. Add a new project object to the `projectsData` array
3. Reference images using the `-hero.jpg` version in the `images` array:

```javascript
{
    id: 23,
    name: "NEW PROJECT NAME",
    location: "City, MI",
    type: "Multifamily Units & Amenities",
    details: "XX Units, New Construction",
    scopes: "Quartz Countertops",
    materials: "Quartz Countertops, Sink Fixtures",
    client: "Client Name",
    dates: "Jan 2025 - Dec 2025",
    images: [
        "images/Previous Jobs/24. New Project Name/kitchen-view1-hero.jpg",
        "images/Previous Jobs/24. New Project Name/bathroom-view1-hero.jpg",
        // ... more images
    ]
}
```

**Note**: Use `-hero.jpg` versions in the project data. The website will automatically use the appropriate size based on screen size.

### Step 4: Build and Deploy

```bash
npm run build
```

## Image Size Specifications

| Version | Dimensions | Use Case | File Size Target |
|---------|-----------|----------|------------------|
| **Thumb** | 400x300px | Mobile devices | ~50-100 KB |
| **Gallery** | 800x600px | Tablets | ~200-300 KB |
| **Hero** | 1200x800px | Desktop | ~500-800 KB |
| **Original** | Full size | Source file | Varies |

## Tips

1. **Start with high-quality originals**: Use the best quality images you have as the source
2. **Descriptive naming**: Use clear, descriptive names like `kitchen-view1.jpg` instead of `IMG_1234.jpg`
3. **Consistent naming**: Follow the pattern: `[description]-view[number].jpg`
4. **Process before adding to portfolio**: Always process images before adding them to `projects-data.js`

## Troubleshooting

### ImageMagick not found
- Install ImageMagick from: https://imagemagick.org/script/download.php
- Make sure it's added to your system PATH

### Images not processing
- Check that the file path is correct
- Verify the image format is supported (`.jpg`, `.jpeg`, `.png`, `.webp`)
- Make sure the original image exists

### Images already processed
- The script automatically skips images that already have `-thumb`, `-gallery`, or `-hero` suffixes
- To reprocess, temporarily rename or delete the processed versions

## Example

```bash
# 1. Add images to folder
# images/Previous Jobs/24. New Project/
#   - kitchen-view1.jpg
#   - bathroom-view1.jpg

# 2. Process images
node process-images.js "images/Previous Jobs/24. New Project"

# Result:
# images/Previous Jobs/24. New Project/
#   - kitchen-view1.jpg (original)
#   - kitchen-view1-thumb.jpg
#   - kitchen-view1-gallery.jpg
#   - kitchen-view1-hero.jpg
#   - bathroom-view1.jpg (original)
#   - bathroom-view1-thumb.jpg
#   - bathroom-view1-gallery.jpg
#   - bathroom-view1-hero.jpg

# 3. Add to projects-data.js using -hero.jpg versions
```
