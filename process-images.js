const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

/**
 * Image Processing Script using ImageMagick
 *
 * This script processes images to create multiple versions. Each version
 * KEEPS the original aspect ratio (no cropping); the number is the cap on
 * the longest side, and images smaller than the cap are left at their size:
 * - thumb: up to 400px (for mobile)
 * - gallery: up to 800px (for tablets)
 * - hero: up to 1200px (for desktop)
 *
 * Usage:
 *   node process-images.js [folder-path]
 *
 * Examples:
 *   node process-images.js "images/Previous Jobs/24. New Project"
 *   node process-images.js "images/Previous Jobs/24. New Project/kitchen-view1.jpg"
 */

// Configuration
const CONFIG = {
    sizes: {
        thumb: { max: 400, suffix: '-thumb' },
        gallery: { max: 800, suffix: '-gallery' },
        hero: { max: 1200, suffix: '-hero' }
    },
    quality: 85, // JPEG quality (0-100)
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp']
};

/**
 * Check if ImageMagick is available
 */
function checkImageMagick() {
    try {
        execSync('magick --version', { stdio: 'ignore' });
        return true;
    } catch (error) {
        console.error('❌ ImageMagick is not installed or not in PATH');
        console.error('Please install ImageMagick from: https://imagemagick.org/script/download.php');
        return false;
    }
}

/**
 * Process a single image file
 */
function processImage(imagePath) {
    const ext = path.extname(imagePath).toLowerCase();
    const baseName = path.basename(imagePath, ext);
    const dir = path.dirname(imagePath);

    // Skip if already processed (has a suffix)
    if (baseName.includes('-thumb') || baseName.includes('-gallery') || baseName.includes('-hero')) {
        console.log(`⏭️  Skipping ${path.basename(imagePath)} (already processed)`);
        return;
    }

    console.log(`\n📸 Processing: ${path.basename(imagePath)}`);

    // Process each size
    for (const [sizeName, sizeConfig] of Object.entries(CONFIG.sizes)) {
        const outputPath = path.join(dir, `${baseName}${sizeConfig.suffix}${ext}`);

        try {
            // ImageMagick command to resize and optimize
            // -auto-orient: automatically rotate based on EXIF orientation data
            // -strip: remove metadata (after orientation is applied)
            // -quality: set JPEG quality
            // -resize "NxN>": shrink so the longest side fits N, preserving the
            //   aspect ratio; never upscale. No cropping, no letterboxing.
            const command = `magick "${imagePath}" -auto-orient -strip -quality ${CONFIG.quality} -resize "${sizeConfig.max}x${sizeConfig.max}>" "${outputPath}"`;

            execSync(command, { stdio: 'ignore' });

            const stats = fs.statSync(outputPath);
            const sizeKB = (stats.size / 1024).toFixed(1);
            console.log(`  ✅ Created ${sizeName}: ${path.basename(outputPath)} (${sizeKB} KB)`);
        } catch (error) {
            console.error(`  ❌ Failed to create ${sizeName} version: ${error.message}`);
        }
    }
}

/**
 * Process all images in a directory
 */
function processDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
        console.error(`❌ Directory not found: ${dirPath}`);
        return;
    }

    const files = fs.readdirSync(dirPath);
    const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return CONFIG.supportedFormats.includes(ext) &&
            !file.includes('-thumb') &&
            !file.includes('-gallery') &&
            !file.includes('-hero');
    });

    if (imageFiles.length === 0) {
        console.log(`ℹ️  No unprocessed images found in: ${dirPath}`);
        return;
    }

    console.log(`\n📁 Processing ${imageFiles.length} image(s) in: ${dirPath}\n`);

    imageFiles.forEach(file => {
        const filePath = path.join(dirPath, file);
        processImage(filePath);
    });
}

/**
 * Main function
 */
function main() {
    if (!checkImageMagick()) {
        process.exit(1);
    }

    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('📸 Image Processing Script');
        console.log('\nUsage:');
        console.log('  node process-images.js <folder-or-file-path>');
        console.log('\nExamples:');
        console.log('  node process-images.js "images/Previous Jobs/24. New Project"');
        console.log('  node process-images.js "images/Previous Jobs/24. New Project/kitchen-view1.jpg"');
        console.log('\nThis will create:');
        console.log('  - thumb version (up to 400px, aspect kept)');
        console.log('  - gallery version (up to 800px, aspect kept)');
        console.log('  - hero version (up to 1200px, aspect kept)');
        process.exit(0);
    }

    const inputPath = args[0];
    const fullPath = path.resolve(inputPath);

    if (!fs.existsSync(fullPath)) {
        console.error(`❌ Path not found: ${fullPath}`);
        process.exit(1);
    }

    const stats = fs.statSync(fullPath);

    if (stats.isFile()) {
        // Process single file
        const ext = path.extname(fullPath).toLowerCase();
        if (!CONFIG.supportedFormats.includes(ext)) {
            console.error(`❌ Unsupported file format: ${ext}`);
            console.error(`Supported formats: ${CONFIG.supportedFormats.join(', ')}`);
            process.exit(1);
        }
        processImage(fullPath);
    } else if (stats.isDirectory()) {
        // Process directory
        processDirectory(fullPath);
    } else {
        console.error(`❌ Invalid path: ${fullPath}`);
        process.exit(1);
    }

    console.log('\n✨ Processing complete!');
}

// Run the script
main();
