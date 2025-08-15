# Backend Setup for The Wooden Stone Website

This directory contains the backend server for The Wooden Stone LLC website, including email functionality via Postmark.

## Structure

```
backend/
├── config/
│   ├── .env.example          # Environment variables template
│   └── .env                  # Your actual environment variables (create this)
├── routes/
│   └── contact.js            # Contact form API endpoints
├── middleware/               # Custom middleware (future use)
├── server.js                 # Main Express server
└── README.md                 # This file
```

## Setup Instructions

### 1. Install Dependencies

From the project root, run:
```bash
npm install
```

### 2. Environment Configuration

1. Copy the environment template:
   ```bash
   cp backend/config/env.example backend/config/.env
   ```

2. Edit `backend/config/.env` and fill in your actual values:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:8000

   # Postmark Email Configuration
   POSTMARK_API_KEY=your_actual_postmark_api_key
   FROM_EMAIL=noreply@woodenstonemi.com
   TO_EMAIL=info@woodenstonemi.com

   # Security
   SESSION_SECRET=your_random_session_secret

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

### 3. Postmark Setup

1. Sign up for a Postmark account at [postmarkapp.com](https://postmarkapp.com)
2. Create a new server in Postmark
3. Get your API key from the server settings
4. Add your domain to Postmark and verify it
5. Update the `FROM_EMAIL` and `TO_EMAIL` in your `.env` file

### 4. Running the Server

#### Development Mode
```bash
npm run dev
```
This will start both the frontend (port 8000) and backend (port 3000) servers.

#### Production Mode
```bash
npm start
```

## API Endpoints

### Contact Form
- **POST** `/api/contact/submit` - Submit contact form
- **GET** `/api/contact/health` - Health check

### Contact Form Data Structure
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Example Corp",
  "projectType": "multi-family",
  "message": "Project description...",
  "preferredContact": "email"
}
```

## Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Prevents abuse
- **Input Validation** - Express-validator
- **Environment Variables** - Secure configuration

## Development

### Adding New Routes
1. Create a new file in `backend/routes/`
2. Export a router with your endpoints
3. Import and use it in `server.js`

### Adding Middleware
1. Create middleware functions in `backend/middleware/`
2. Import and use them in `server.js` or route files

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the PORT in your `.env` file
2. **Postmark errors**: Verify your API key and domain verification
3. **CORS errors**: Check the FRONTEND_URL in your `.env` file

### Logs
The server logs all requests and errors to the console. Check the terminal output for debugging information.
