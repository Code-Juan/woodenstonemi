#!/usr/bin/env node

/**
 * Enhanced Debug Image Upload Handler
 * 
 * This script monitors the images folder and automatically:
 * - Compresses new images with detailed logging
 * - Creates responsive versions with performance tracking
 * - Updates HTML files with proper srcset attributes
 * - Provides comprehensive debug information
 * 
 * Usage: 
 * - node debug-upload-handler.js (basic debug)
 * - DEBUG=* node debug-upload-handler.js (full debug)
 * - DEBUG=image-processor,performance node debug-upload-handler.js (specific debug)
 */

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const sharp = require('sharp');
const { DEBUG_CONFIG, PERFORMANCE_CONFIG, ERROR_CONFIG } = require('./debug-config');

// Initialize debug loggers
const debuggers = DEBUG_CONFIG.getDebuggers();
const debug = debuggers.IMAGE_PROCESSOR;
const perfDebug = debuggers.PERFORMANCE;
const errorDebug = debuggers.ERRORS;

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

// Performance tracking
const performanceMetrics = {
    totalImagesProcessed: 0,
    totalProcessingTime: 0,
    averageProcessingTime: 0,
    errors: 0,
    warnings: 0
};

// Memory usage tracking
function logMemoryUsage() {
    if (PERFORMANCE_CONFIG.logMemoryUsage) {
        const memUsage = process.memoryUsage();
        perfDebug('Memory Usage:', {
            rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
            external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
        });
    }
}

// Performance timer wrapper
function withPerformanceTracking(operation, callback) {
    return async (...args) => {
        const startTime = process.hrtime.bigint();
        const startMemory = process.memoryUsage();

        try {
            debug(`Starting operation: ${operation}`);
            const result = await callback(...args);

            const endTime = process.hrtime.bigint();
            const endMemory = process.memoryUsage();
            const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds

            perfDebug(`${operation} completed in ${duration.toFixed(2)}ms`);

            if (duration > PERFORMANCE_CONFIG.slowOperationThreshold) {
                perfDebug(`⚠️  Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`);
            }

            // Log memory delta
            const memoryDelta = {
                rss: endMemory.rss - startMemory.rss,
                heapUsed: endMemory.heapUsed - startMemory.heapUsed
            };

            if (Math.abs(memoryDelta.heapUsed) > 1024 * 1024) { // 1MB threshold
                perfDebug(`Memory delta for ${operation}:`, {
                    rss: `${Math.round(memoryDelta.rss / 1024)}KB`,
                    heapUsed: `${Math.round(memoryDelta.heapUsed / 1024)}KB`
                });
            }

            return result;
        } catch (error) {
            const endTime = process.hrtime.bigint();
            const duration = Number(endTime - startTime) / 1000000;

            errorDebug(`❌ ${operation} failed after ${duration.toFixed(2)}ms:`, error.message);
            performanceMetrics.errors++;
            throw error;
        }
    };
}

async function optimizeImage(inputPath, outputPath, options = {}) {
    const { width, height, quality, format } = options;
    const operation = `optimizeImage(${path.basename(inputPath)})`;

    return withPerformanceTracking(operation, async () => {
        try {
            debug(`Processing image: ${path.basename(inputPath)}`);
            debug(`Output path: ${outputPath}`);
            debug(`Options:`, { width, height, quality, format });

            let sharpInstance = sharp(inputPath);

            if (width && height) {
                debug(`Resizing to ${width}x${height}`);
                sharpInstance = sharpInstance.resize(width, height, {
                    fit: 'cover',
                    position: 'center'
                });
            }

            if (format === 'webp') {
                debug(`Converting to WebP with quality ${quality || CONFIG.quality.webp}`);
                sharpInstance = sharpInstance.webp({ quality: quality || CONFIG.quality.webp });
            } else if (format === 'jpg' || format === 'jpeg') {
                debug(`Converting to JPEG with quality ${quality || CONFIG.quality.jpg}`);
                sharpInstance = sharpInstance.jpeg({ quality: quality || CONFIG.quality.jpg });
            } else if (format === 'png') {
                debug(`Converting to PNG with quality ${quality || CONFIG.quality.png}`);
                sharpInstance = sharpInstance.png({ quality: quality || CONFIG.quality.png });
            }

            await sharpInstance.toFile(outputPath);

            // Get file size information
            const inputStats = fs.statSync(inputPath);
            const outputStats = fs.statSync(outputPath);
            const compressionRatio = ((inputStats.size - outputStats.size) / inputStats.size * 100).toFixed(1);

            debug(`✅ Optimized: ${path.basename(inputPath)}`);
            debug(`File sizes: ${(inputStats.size / 1024).toFixed(1)}KB → ${(outputStats.size / 1024).toFixed(1)}KB (${compressionRatio}% reduction)`);

            performanceMetrics.totalImagesProcessed++;

            return {
                inputSize: inputStats.size,
                outputSize: outputStats.size,
                compressionRatio: parseFloat(compressionRatio)
            };

        } catch (error) {
            errorDebug(`❌ Failed to optimize: ${path.basename(inputPath)}`);
            errorDebug(`Error details:`, error);
            performanceMetrics.errors++;
            throw error;
        }
    })();
}

async function createResponsiveImages(inputPath) {
    const operation = `createResponsiveImages(${path.basename(inputPath)})`;

    return withPerformanceTracking(operation, async () => {
        const ext = path.parse(inputPath).ext.toLowerCase();
        const baseName = path.parse(inputPath).name;
        const outputDir = path.dirname(inputPath).replace(CONFIG.watchDir, CONFIG.outputDir);

        debug(`Creating responsive images for: ${path.basename(inputPath)}`);
        debug(`Output directory: ${outputDir}`);

        // Ensure output directory exists
        if (!fs.existsSync(outputDir)) {
            debug(`Creating output directory: ${outputDir}`);
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const createdFiles = [];
        const optimizationResults = [];

        // Create different sizes
        for (const [size, config] of Object.entries(CONFIG.sizes)) {
            debug(`Processing size: ${size} (${config.width}x${config.height})`);

            const outputFilename = `${baseName}${config.suffix}${ext}`;
            const outputPath = path.join(outputDir, outputFilename);

            try {
                const result = await optimizeImage(inputPath, outputPath, {
                    width: config.width,
                    height: config.height,
                    quality: CONFIG.quality[ext.slice(1)] || 85
                });

                createdFiles.push({
                    size,
                    path: outputPath,
                    width: config.width,
                    suffix: config.suffix,
                    ...result
                });

                optimizationResults.push(result);

            } catch (error) {
                errorDebug(`Failed to create ${size} version:`, error.message);
                performanceMetrics.errors++;
            }
        }

        // Log summary
        const avgCompression = optimizationResults.length > 0
            ? optimizationResults.reduce((sum, r) => sum + r.compressionRatio, 0) / optimizationResults.length
            : 0;

        debug(`Created ${createdFiles.length} responsive images`);
        debug(`Average compression: ${avgCompression.toFixed(1)}%`);

        return createdFiles;
    })();
}

// Enhanced file watcher with detailed logging
function startFileWatcher() {
    debug('Starting file watcher...');
    debug(`Watching directory: ${CONFIG.watchDir}`);

    const watcher = chokidar.watch(CONFIG.watchDir, {
        ignored: [
            /(^|[\/\\])\../, // Ignore hidden files
            /.*-thumb\.(jpg|jpeg|png|webp)$/i, // Ignore thumbnail files
            /.*-gallery\.(jpg|jpeg|png|webp)$/i, // Ignore gallery files  
            /.*-hero\.(jpg|jpeg|png|webp)$/i, // Ignore hero files
            /.*optimized.*/i, // Ignore optimized folders
            /.*\.(avif|webp)$/i, // Ignore already processed formats
            /.*\/.*/, // Ignore subdirectories
            /Previous Jobs\/.*/, // Ignore Previous Jobs directory
            /Scopes & Materials\/.*/ // Ignore Scopes & Materials directory
        ],
        persistent: true,
        ignoreInitial: false,
        awaitWriteFinish: {
            stabilityThreshold: 2000,
            pollInterval: 100
        }
    });

    watcher
        .on('add', async (filePath) => {
            debug(`📁 New file detected: ${path.basename(filePath)}`);

            if (processingFiles.has(filePath)) {
                debug(`⏳ File already being processed: ${path.basename(filePath)}`);
                return;
            }

            if (processedFiles.has(filePath)) {
                debug(`✅ File already processed: ${path.basename(filePath)}`);
                return;
            }

            const ext = path.parse(filePath).ext.toLowerCase();
            if (!['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
                debug(`⏭️  Skipping non-image file: ${path.basename(filePath)}`);
                return;
            }

            // Skip already processed files (thumbnails, gallery, hero versions)
            const fileName = path.basename(filePath, ext);
            if (fileName.includes('-thumb') || fileName.includes('-gallery') || fileName.includes('-hero')) {
                debug(`⏭️  Skipping already processed file: ${path.basename(filePath)}`);
                return;
            }

            // Skip files in subdirectories
            const relativePath = path.relative(CONFIG.watchDir, filePath);
            if (relativePath.includes(path.sep)) {
                debug(`⏭️  Skipping file in subdirectory: ${relativePath}`);
                return;
            }

            processingFiles.add(filePath);

            try {
                await createResponsiveImages(filePath);
                processedFiles.add(filePath);
                debug(`✅ Successfully processed: ${path.basename(filePath)}`);
            } catch (error) {
                errorDebug(`❌ Error processing file: ${path.basename(filePath)}`, error);
            } finally {
                processingFiles.delete(filePath);
            }
        })
        .on('change', (filePath) => {
            debug(`🔄 File changed: ${path.basename(filePath)}`);
            // Remove from processed files to allow reprocessing
            processedFiles.delete(filePath);
        })
        .on('unlink', (filePath) => {
            debug(`🗑️  File deleted: ${path.basename(filePath)}`);
            processedFiles.delete(filePath);
            processedFiles.delete(filePath);
        })
        .on('error', (error) => {
            errorDebug('File watcher error:', error);
        })
        .on('ready', () => {
            debug('✅ File watcher ready');
            logMemoryUsage();
        });

    return watcher;
}

// Statistics and monitoring
function logStatistics() {
    setInterval(() => {
        debug('📊 Performance Statistics:');
        debug(`- Total images processed: ${performanceMetrics.totalImagesProcessed}`);
        debug(`- Total errors: ${performanceMetrics.errors}`);
        debug(`- Total warnings: ${performanceMetrics.warnings}`);

        if (performanceMetrics.totalImagesProcessed > 0) {
            debug(`- Average processing time: ${(performanceMetrics.totalProcessingTime / performanceMetrics.totalImagesProcessed).toFixed(2)}ms`);
        }

        logMemoryUsage();
    }, 30000); // Log every 30 seconds
}

// Main execution
async function main() {
    debug('🚀 Starting Enhanced Debug Image Upload Handler');
    debug(`Node.js version: ${process.version}`);
    debug(`Sharp version: ${sharp.versions.sharp}`);
    debug(`Chokidar version: ${require('chokidar/package.json').version}`);

    // Log initial memory usage
    logMemoryUsage();

    // Start file watcher
    const watcher = startFileWatcher();

    // Start statistics logging
    logStatistics();

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        debug('🛑 Received SIGINT, shutting down gracefully...');
        watcher.close();
        logMemoryUsage();
        debug('✅ Shutdown complete');
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        debug('🛑 Received SIGTERM, shutting down gracefully...');
        watcher.close();
        logMemoryUsage();
        debug('✅ Shutdown complete');
        process.exit(0);
    });
}

// Run if this file is executed directly
if (require.main === module) {
    main().catch(error => {
        errorDebug('Fatal error in main:', error);
        process.exit(1);
    });
}

module.exports = {
    optimizeImage,
    createResponsiveImages,
    startFileWatcher,
    performanceMetrics
};
