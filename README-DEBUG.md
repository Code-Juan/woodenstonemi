# Debug Setup Guide for The Wooden Stone Website

This guide explains how to set up and use the comprehensive debug system for The Wooden Stone website during development.

## 🚀 Quick Start

### 1. Install Dependencies

First, install the debug dependencies:

```bash
npm install
```

### 2. Run with Debug Information

Choose one of the following debug modes:

#### Basic Debug Mode
```bash
npm run debug
```

#### Full Debug Mode (All Logging)
```bash
DEBUG=* npm run debug-dev
```

#### Image Processing Debug Only
```bash
npm run debug-images
```

#### Development Server with Debug
```bash
npm run dev-debug
```

## 📋 Available Debug Scripts

| Script | Description | Debug Level |
|--------|-------------|-------------|
| `npm run debug` | Basic debug with image processing | Standard |
| `npm run debug-dev` | Full debug with server and image processing | Verbose |
| `npm run debug-images` | Image optimization debug only | Image-specific |
| `npm run dev-debug` | Development server with debug logging | Server-focused |
| `npm run dev-server` | Simple development server | Basic |

## 🔧 Debug Configuration

### Environment Variables

You can control debug behavior using environment variables:

```bash
# Enable all debug logging
DEBUG=*

# Enable specific debug namespaces
DEBUG=image-processor,performance,errors

# Enable performance monitoring
DEBUG_PERFORMANCE=true

# Set development mode
NODE_ENV=development

# Custom port and host
PORT=8000
HOST=127.0.0.1
```

### Debug Namespaces

The debug system uses namespaces to organize logging:

- `image-processor` - Image optimization and processing
- `image-optimization` - Image compression and resizing
- `image-watcher` - File watching and monitoring
- `server` - HTTP server operations
- `dev-server` - Development server specific
- `file-operations` - File system operations
- `file-watcher` - File watching events
- `performance` - Performance monitoring
- `loading-times` - Page and resource loading times
- `errors` - Error tracking and logging
- `warnings` - Warning messages
- `app` - General application events
- `routing` - Navigation and routing

## 🖥️ Frontend Debug Features

### Browser Console Access

When running with debug enabled, you can access debug utilities in the browser console:

```javascript
// Get debug statistics
window.debugUtils.getStats()

// Access debug logger
window.debugUtils.logger.info('Custom debug message')

// Check performance metrics
window.debugUtils.performance.measures

// View error tracking
window.debugUtils.errors.getStats()
```

### Debug Information Available

- **Performance Monitoring**: Track page load times, image loading, and user interactions
- **Error Tracking**: Automatic capture of JavaScript errors and warnings
- **Image Optimization**: Monitor large images and optimization opportunities
- **Navigation Performance**: Track page transitions and preloading
- **Form Validation**: Debug form submissions and validation errors

## 🖼️ Image Processing Debug

### Monitor Image Optimization

The debug system tracks:

- Image processing times
- Compression ratios
- File size reductions
- Processing errors
- Memory usage during processing

### Debug Commands

```bash
# Process existing images with debug
npm run debug-images

# Watch for new images with debug
npm run debug

# Full debug with image processing
DEBUG=image-processor,performance npm run debug
```

## 🌐 Server Debug Features

### Request Logging

The debug server logs:

- All HTTP requests with timing
- Request details (headers, user agent, IP)
- File serving operations
- Error responses
- Slow request detection

### Server Statistics

Every 30 seconds, the server logs:

- Total requests and errors
- Average response times
- Memory usage
- Slow request tracking
- Server uptime

### Debug Server Commands

```bash
# Start debug server
npm run dev-debug

# Full debug server
DEBUG=* npm run dev-debug

# Server with specific debug areas
DEBUG=server,performance npm run dev-debug
```

## 📊 Performance Monitoring

### What's Monitored

- **Page Load Times**: Complete page load, DOM content loaded, load event
- **Image Loading**: Individual image load times and optimization
- **Navigation**: Page transitions and preloading performance
- **Memory Usage**: Heap and RSS memory consumption
- **Slow Operations**: Operations taking longer than 1 second

### Performance Thresholds

- **Slow Operations**: > 1000ms (1 second)
- **Large Images**: > 2000px width or height
- **Slow Requests**: > 1000ms response time
- **Memory Warning**: > 1MB heap usage increase

## 🐛 Error Tracking

### Automatic Error Capture

The debug system automatically captures:

- JavaScript errors and exceptions
- Unhandled promise rejections
- Image loading failures
- Form validation errors
- Network request failures

### Error Information

Each error includes:

- Error message and stack trace
- Timestamp and URL
- User agent and browser information
- Context and additional data

## 🔍 Debug Output Examples

### Image Processing Debug
```
🔍 [image-processor] DEBUG: Processing image: kitchen-renovation.jpg
🔍 [image-processor] DEBUG: Output path: ./images/optimized/kitchen-renovation.jpg
🔍 [image-processor] DEBUG: Options: { width: 800, height: 600, quality: 85 }
🔍 [performance] DEBUG: optimizeImage(kitchen-renovation.jpg) completed in 245.67ms
🔍 [image-processor] DEBUG: ✅ Optimized: kitchen-renovation.jpg
🔍 [image-processor] DEBUG: File sizes: 2048.5KB → 512.3KB (75.0% reduction)
```

### Server Debug
```
🔍 [server] DEBUG: [abc123def] GET /index.html
🔍 [server] DEBUG: Serving file: index.html (45.2KB)
🔍 [performance] DEBUG: serveFile(index.html) completed in 12.34ms
🔍 [server] DEBUG: [abc123def] Request completed in 15ms
```

### Performance Debug
```
🔍 [performance] DEBUG: Memory Usage: { rss: '45MB', heapTotal: '20MB', heapUsed: '15MB' }
🔍 [performance] DEBUG: Page load completed in 1250.45ms
⚠️ [performance] WARN: Slow operation detected: image-load-hero.jpg took 1250.45ms
```

## 🛠️ Troubleshooting

### Common Issues

1. **Debug not showing**: Ensure `DEBUG=*` environment variable is set
2. **Performance monitoring off**: Check `DEBUG_PERFORMANCE=true` is set
3. **Server not starting**: Verify port 8000 is available
4. **Image processing errors**: Check Sharp installation and permissions

### Debug Commands for Troubleshooting

```bash
# Check Node.js and package versions
node --version
npm list

# Test debug configuration
node -e "console.log(require('./debug-config'))"

# Check file permissions
ls -la debug-*.js

# Monitor system resources
top
htop
```

## 📁 File Structure

```
woodenstonemi/
├── debug-config.js          # Central debug configuration
├── debug-upload-handler.js  # Enhanced image processing with debug
├── debug-script.js          # Frontend debug utilities
├── debug-server.js          # Debug development server
├── package.json             # Updated with debug scripts
└── README-DEBUG.md         # This file
```

## 🎯 Best Practices

1. **Use Specific Debug Namespaces**: Instead of `DEBUG=*`, use specific namespaces for focused debugging
2. **Monitor Performance**: Watch for slow operations and memory usage
3. **Check Error Logs**: Regularly review error tracking for issues
4. **Optimize Images**: Use the debug output to identify large images for optimization
5. **Test Different Scenarios**: Use debug mode to test various user interactions

## 🔄 Development Workflow

1. **Start Debug Mode**: `npm run debug-dev`
2. **Monitor Console**: Watch for performance issues and errors
3. **Optimize Issues**: Address slow operations and errors
4. **Test Changes**: Verify fixes work correctly
5. **Disable Debug**: Use production mode for final testing

## 📞 Support

If you encounter issues with the debug system:

1. Check the console output for error messages
2. Verify all dependencies are installed
3. Ensure proper file permissions
4. Review the debug configuration
5. Check system resources (memory, disk space)

The debug system is designed to help you identify and resolve issues quickly during development. Use it to optimize performance and ensure a smooth user experience.
