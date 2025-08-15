#!/usr/bin/env node

/**
 * Automated Image Upload Handler
 * 
 * This script monitors the images folder and automatically:
 * - Compresses new images
 * - Creates responsive versions
 * - Updates HTML files with proper srcset attributes
 * 
 * Usage: node upload-handler.js
 */

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const sharp = require('sharp');

// Configuration
const CONFIG = {
    watchDir: './images',
    outputDir: './images/optimized',
    sizes: {
        thumbnail: { width: 400, height: 300, suffix: '-thumb' },
        gallery: { width: 800, height: 600, suffix: '-gallery' },
        hero: { width: 1200, height: 800, suffix: '-hero' },
        full: { width: 1600, height: 1200, suffix: '' }
    },
    quality: {
        jpg: 85,
        webp: 80,
        png: 9
    }
};

// Track processed files to avoid duplicates and infinite loops
const processedFiles = new Set();
const processingFiles = new Set();

async function optimizeImage(inputPath, outputPath, options = {}) {
    const { width, height, quality, format } = options;

    try {
        let sharpInstance = sharp(inputPath);

        if (width && height) {
            sharpInstance = sharpInstance.resize(width, height, {
                fit: 'cover',
                position: 'center'
            });
        }

        if (format === 'webp') {
            sharpInstance = sharpInstance.webp({ quality: quality || CONFIG.quality.webp });
        } else if (format === 'jpg' || format === 'jpeg') {
            sharpInstance = sharpInstance.jpeg({ quality: quality || CONFIG.quality.jpg });
        } else if (format === 'png') {
            sharpInstance = sharpInstance.png({ quality: quality || CONFIG.quality.png });
        }

        await sharpInstance.toFile(outputPath);
        console.log(`✅ Optimized: ${path.basename(inputPath)}`);

    } catch (error) {
        console.error(`❌ Failed to optimize: ${path.basename(inputPath)}`);
        console.error(error.message);
    }
}

async function createResponsiveImages(inputPath) {
    const ext = path.parse(inputPath).ext.toLowerCase();
    const baseName = path.parse(inputPath).name;
    const outputDir = path.dirname(inputPath).replace(CONFIG.watchDir, CONFIG.outputDir);

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const createdFiles = [];

    // Create different sizes
    for (const [size, config] of Object.entries(CONFIG.sizes)) {
        const outputFilename = `${baseName}${config.suffix}${ext}`;
        const outputPath = path.join(outputDir, outputFilename);

        await optimizeImage(inputPath, outputPath, {
            width: config.width,
            height: config.height,
            quality: CONFIG.quality[ext.slice(1)] || 85
        });

        createdFiles.push({
            size,
            path: outputPath,
            width: config.width,
            suffix: config.suffix
        });
    }

    return createdFiles;
}

function updateHTMLWithSrcset(imagePath, responsiveFiles) {
    // Find HTML files that might reference this image
    const htmlFiles = ['index.html', 'project-portfolio.html', 'scopes-materials.html', 'what-we-do.html', 'contact-us.html'];

    htmlFiles.forEach(htmlFile => {
        if (!fs.existsSync(htmlFile)) return;

        let htmlContent = fs.readFileSync(htmlFile, 'utf8');
        const imageName = path.basename(imagePath);

        // Create srcset string
        const srcsetParts = responsiveFiles.map(file => {
            const relativePath = path.relative('.', file.path).replace(/\\/g, '/');
            return `${relativePath} ${file.width}w`;
        });

        const srcset = srcsetParts.join(', ');
        const sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';

        // Update img tags that reference this image
        const imgRegex = new RegExp(`(<img[^>]*src="[^"]*${imageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>)`, 'g');

        htmlContent = htmlContent.replace(imgRegex, (match, imgTag) => {
            // Add srcset and sizes attributes
            return imgTag.replace('>', ` srcset="${srcset}" sizes="${sizes}">`);
        });

        fs.writeFileSync(htmlFile, htmlContent);
        console.log(`📝 Updated ${htmlFile} with responsive images for ${imageName}`);
    });
}

async function processNewImage(filePath) {
    // Skip if already processed or currently processing
    if (processedFiles.has(filePath) || processingFiles.has(filePath)) {
        return;
    }

    // Skip if it's an optimized file (to prevent infinite loops)
    if (filePath.includes('optimized') || filePath.includes('-thumb') || filePath.includes('-gallery') || filePath.includes('-hero')) {
        return;
    }

    const ext = path.parse(filePath).ext.toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) return;

    console.log(`🖼️  Processing new image: ${path.basename(filePath)}`);

    // Mark as processing to prevent duplicate processing
    processingFiles.add(filePath);

    try {
        const responsiveFiles = await createResponsiveImages(filePath);
        updateHTMLWithSrcset(filePath, responsiveFiles);
        processedFiles.add(filePath);

        console.log(`✅ Completed processing: ${path.basename(filePath)}`);

    } catch (error) {
        console.error(`❌ Error processing ${path.basename(filePath)}:`, error.message);
    } finally {
        // Remove from processing set
        processingFiles.delete(filePath);
    }
}

function startWatching() {
    console.log('👀 Starting image watcher...');
    console.log(`📁 Watching directory: ${CONFIG.watchDir}`);
    console.log(`📤 Output directory: ${CONFIG.outputDir}`);
    console.log('');

    const watcher = chokidar.watch(CONFIG.watchDir, {
        ignored: [
            /(^|[\/\\])\../, // ignore dotfiles
            /optimized/, // ignore optimized directory
            /.*-thumb\./, // ignore thumbnail files
            /.*-gallery\./, // ignore gallery files
            /.*-hero\./ // ignore hero files
        ],
        persistent: true,
        ignoreInitial: false
    });

    watcher
        .on('add', filePath => {
            console.log(`📥 New file detected: ${path.basename(filePath)}`);
            processNewImage(filePath);
        })
        .on('change', filePath => {
            console.log(`🔄 File changed: ${path.basename(filePath)}`);
            processNewImage(filePath);
        })
        .on('error', error => {
            console.error('❌ Watcher error:', error);
        });

    console.log('✅ Image watcher is running. Add images to the images/ folder to process them automatically.');
}

// Install required dependencies if not present
function checkDependencies() {
    try {
        require('chokidar');
        require('sharp');
    } catch (error) {
        console.log('📦 Installing required dependencies...');
        require('child_process').execSync('npm install chokidar sharp', { stdio: 'inherit' });
        console.log('✅ Dependencies installed successfully!');
    }
}

// Main execution
if (require.main === module) {
    checkDependencies();
    startWatching();
}

module.exports = { processNewImage, createResponsiveImages, CONFIG };
