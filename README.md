# The Wooden Stone LLC Official Website

A modern, responsive website for The Wooden Stone LLC, featuring a backend API with Postmark email integration.

## Project Structure

```
woodenstonemi/
├── src/
│   ├── pages/              # HTML pages
│   ├── assets/             # CSS, JS, and other assets
│   └── scripts/            # Build and optimization scripts
├── backend/
│   ├── config/             # Environment configuration
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   └── server.js           # Express server
├── images/                 # Image assets
└── docs/                   # Documentation
```

## Quick Start

### Prerequisites
- Node.js 14+ 
- Python 3+ (for development server)
- Postmark account for email functionality

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp backend/config/env.example backend/config/.env
   # Edit backend/config/.env with your actual values
   ```

3. **Start development servers:**
   ```bash
   npm run dev
   ```
   This starts both frontend (port 8000) and backend (port 3000) servers.

### Production

```bash
npm start
```

## Features

### Frontend
- Responsive design with modern CSS
- Dynamic project portfolio with image galleries
- Contact form with backend integration
- Image optimization and lazy loading
- SEO optimized

### Backend
- Express.js server with security middleware
- Postmark email integration
- Input validation and rate limiting
- CORS configuration
- Health check endpoints

## Email Setup

The contact form uses Postmark for reliable email delivery:

1. Sign up at [postmarkapp.com](https://postmarkapp.com)
2. Create a server and get your API key
3. Add your domain and verify it
4. Update `POSTMARK_API_KEY` in your `.env` file

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

## Development

### Available Scripts
- `npm run dev` - Start development servers
- `npm start` - Start production server
- `npm run optimize-images` - Optimize images
- `npm run build` - Build for production

### Adding New Pages
1. Create HTML file in `src/pages/`
2. Update navigation in existing pages
3. Add route in `backend/server.js` if needed

### API Development
- Routes go in `backend/routes/`
- Middleware in `backend/middleware/`
- Configuration in `backend/config/`

## Security

- Helmet.js for security headers
- Rate limiting on API endpoints
- Input validation with express-validator
- CORS configuration
- Environment variable protection

## Documentation

- [Backend Setup](./backend/README.md) - Detailed backend configuration
- [Email Setup](./POSTMARK_SETUP_GUIDE.md) - Current email configuration guide
- [Security](./SECURITY.md) - Security considerations
- [Setup Guide](./SETUP.md) - Complete setup instructions
- [Deployment Strategy](./DEPLOYMENT_STRATEGY.md) - Deployment workflow and configuration
