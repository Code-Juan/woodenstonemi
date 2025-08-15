const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'config', '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            connectSrc: ["'self'"]
        }
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8000',
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from src/pages
app.use(express.static(path.join(__dirname, '..', 'src', 'pages')));
app.use('/assets', express.static(path.join(__dirname, '..', 'src', 'assets')));
app.use('/images', express.static(path.join(__dirname, '..', 'images')));

// Serve logo files from root directory
app.use(express.static(path.join(__dirname, '..')));

// Routes
app.use('/api/contact', require('./routes/contact'));

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'src', 'pages', 'index.html'));
});

app.get('/contact-us', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'src', 'pages', 'contact-us.html'));
});

app.get('/what-we-do', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'src', 'pages', 'what-we-do.html'));
});

app.get('/scopes-materials', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'src', 'pages', 'scopes-materials.html'));
});

app.get('/project-portfolio', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'src', 'pages', 'project-portfolio.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
