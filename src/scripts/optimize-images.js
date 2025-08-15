#!/usr/bin/env node

/**
 * Image Optimization Script for The Wooden Stone Website
 * 
 * This script helps optimize images for web use by:
 * - Compressing images to target file sizes
 * - Creating multiple sizes for responsive images
 * - Converting to WebP format when possible
 * 
 * Usage: node optimize-images.js [input-folder] [output-folder]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
    // Target file sizes in KB
    sizes: {
        thumbnail: 100,    // 100KB
        gallery: 300,      // 300KB
        hero: 800,         // 800KB
        max: 1200          // 1.2MB
    },

    // Image dimensions
    dimensions: {
        thumbnail: { width: 400, height: 300 },
        gallery: { width: 800, height: 600 },
        hero: { width: 1200, height: 800 },
        full: { width: 1600, height: 1200 }
    },

    // Supported formats
    formats: ['jpg', 'jpeg', 'png', 'webp'],

    // Quality settings
    quality: {
        jpg: 85,
        webp: 80,
        png: 9
    }
};

function optimizeImage(inputPath, outputPath, options = {}) {
    const { width, height, quality, format } = options;

    try {
        // Use ImageMagick for optimization (requires ImageMagick to be installed)
        let command = `magick "${inputPath}"`;

        if (width && height) {
            command += ` -resize ${width}x${height}`;
        }

        if (quality) {
            command += ` -quality ${quality}`;
        }

        command += ` "${outputPath}"`;

        execSync(command, { stdio: 'inherit' });
        console.log(`✅ Optimized: ${path.basename(inputPath)}`);

    } catch (error) {
        console.error(`❌ Failed to optimize: ${path.basename(inputPath)}`);
        console.error(error.message);
    }
}

function createResponsiveImages(inputPath, outputDir, filename) {
    const baseName = path.parse(filename).name;
    const ext = path.parse(filename).ext;

    // Create different sizes
    Object.entries(CONFIG.dimensions).forEach(([size, dimensions]) => {
        const outputFilename = `${baseName}-${size}${ext}`;
        const outputPath = path.join(outputDir, outputFilename);

        optimizeImage(inputPath, outputPath, {
            width: dimensions.width,
            height: dimensions.height,
            quality: CONFIG.quality[ext.slice(1)] || 85
        });
    });
}

function processDirectory(inputDir, outputDir) {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const files = fs.readdirSync(inputDir);

    files.forEach(file => {
        const inputPath = path.join(inputDir, file);
        const stat = fs.statSync(inputPath);

        if (stat.isDirectory()) {
            // Recursively process subdirectories
            const subOutputDir = path.join(outputDir, file);
            processDirectory(inputPath, subOutputDir);
        } else {
            // Process image files
            const ext = path.parse(file).ext.toLowerCase().slice(1);

            if (CONFIG.formats.includes(ext)) {
                console.log(`Processing: ${file}`);
                createResponsiveImages(inputPath, outputDir, file);
            }
        }
    });
}

// Main execution
function main() {
    const args = process.argv.slice(2);
    const inputDir = args[0] || './images';
    const outputDir = args[1] || './images/optimized';

    console.log('🖼️  Image Optimization Tool');
    console.log('==========================');
    console.log(`Input: ${inputDir}`);
    console.log(`Output: ${outputDir}`);
    console.log('');

    if (!fs.existsSync(inputDir)) {
        console.error(`❌ Input directory not found: ${inputDir}`);
        process.exit(1);
    }

    try {
        processDirectory(inputDir, outputDir);
        console.log('\n🎉 Image optimization complete!');
        console.log('\nNext steps:');
        console.log('1. Review optimized images in the output directory');
        console.log('2. Replace original images with optimized versions');
        console.log('3. Update HTML to use responsive srcset attributes');

    } catch (error) {
        console.error('❌ Optimization failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { optimizeImage, createResponsiveImages, CONFIG };
