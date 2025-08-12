# The Wooden Stone Website LLC Official Website

## Image Optimization Guidelines

### For New Images:
1. **Compress before uploading**: Use tools like TinyPNG, ImageOptim, or Squoosh
2. **Target file sizes**: 
   - Thumbnails: 50-100KB
   - Gallery images: 200-500KB
   - Hero images: 500KB-1MB max
3. **Dimensions**: Resize to actual display size (don't upload 4000px images for 800px display)
4. **Format**: Use WebP when possible, JPEG for photos, PNG for graphics with transparency

### Recommended Tools:
- **Online**: TinyPNG, Squoosh.app
- **Desktop**: ImageOptim (Mac), FileOptimizer (Windows)
- **Command Line**: ImageMagick, Sharp

### File Naming Convention:
- Use descriptive names: `project-name-location-type.jpg`
- Avoid spaces, use hyphens
- Include dimensions if multiple sizes: `hero-1200x800.jpg`

## Performance Best Practices

### Image Loading:
- Always use `loading="lazy"` for images below the fold
- Use `loading="eager"` only for above-the-fold hero images
- Consider using `srcset` for responsive images

### Organization:
- Keep images organized in project-specific folders
- Use consistent naming conventions
- Archive old project images when no longer needed
