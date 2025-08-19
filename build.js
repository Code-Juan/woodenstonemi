const fs = require('fs-extra');
const path = require('path');

async function build() {
    try {
        // Create dist directory
        await fs.ensureDir('dist');

        // Copy src/pages to dist
        await fs.copy('src/pages', 'dist');

        // Copy src/assets to dist/assets
        await fs.copy('src/assets', 'dist/assets');

        // Copy images to dist/images
        await fs.copy('images', 'dist/images');

        // Copy logo files to dist
        await fs.copy('The Wooden Stone Logo (Transparent).svg', 'dist/The Wooden Stone Logo (Transparent).svg');
        await fs.copy('Wooden Stone Logo.svg', 'dist/Wooden Stone Logo.svg');

                // Generate favicon files from the icon
        const { execSync } = require('child_process');
        
        // Check if ImageMagick is available
        try {
            // Test if ImageMagick is available
            execSync('magick --version', { stdio: 'ignore' });
            
            // Create favicon files using ImageMagick
            console.log('ImageMagick found - generating favicon files...');
            execSync('magick "The Wooden Stone Icon.jpg" -strip -quality 90 -resize 32x32^ -gravity center -extent 32x32 "dist/favicon-32x32.png"');
            execSync('magick "The Wooden Stone Icon.jpg" -strip -quality 90 -resize 16x16^ -gravity center -extent 16x16 "dist/favicon-16x16.png"');
            execSync('magick "The Wooden Stone Icon.jpg" -strip -quality 90 -resize 180x180^ -gravity center -extent 180x180 "dist/apple-touch-icon.png"');
            execSync('magick "The Wooden Stone Icon.jpg" -strip -quality 90 -resize 192x192^ -gravity center -extent 192x192 "dist/android-chrome-192x192.png"');
            execSync('magick "The Wooden Stone Icon.jpg" -strip -quality 90 -resize 512x512^ -gravity center -extent 512x512 "dist/android-chrome-512x512.png"');
            console.log('Favicon files generated successfully!');
        } catch (error) {
            console.log('ImageMagick not available - copying existing favicon files or creating placeholder...');
            
            // Try to copy existing favicon files if they exist
            const faviconFiles = [
                'favicon-32x32.png',
                'favicon-16x16.png', 
                'apple-touch-icon.png',
                'android-chrome-192x192.png',
                'android-chrome-512x512.png'
            ];
            
            for (const file of faviconFiles) {
                if (await fs.pathExists(file)) {
                    await fs.copy(file, `dist/${file}`);
                    console.log(`Copied ${file} to dist/`);
                } else {
                    // Create a simple placeholder favicon using the original icon
                    await fs.copy('The Wooden Stone Icon.jpg', `dist/${file}`);
                    console.log(`Copied original icon as ${file} (will be resized by browser)`);
                }
            }
        }

        // Copy CNAME if it exists
        if (await fs.pathExists('CNAME')) {
            await fs.copy('CNAME', 'dist/CNAME');
        }

        // Copy robots.txt if it exists
        if (await fs.pathExists('robots.txt')) {
            await fs.copy('robots.txt', 'dist/robots.txt');
        }

        // Copy site.webmanifest if it exists
        if (await fs.pathExists('site.webmanifest')) {
            await fs.copy('site.webmanifest', 'dist/site.webmanifest');
        }

        // Copy sitemap.xml if it exists
        if (await fs.pathExists('sitemap.xml')) {
            await fs.copy('sitemap.xml', 'dist/sitemap.xml');
        }

        // Copy Google verification file if it exists
        if (await fs.pathExists('google-verification.html')) {
            await fs.copy('google-verification.html', 'dist/google-verification.html');
        }

        // Remove duplicate .html files to avoid SEO conflicts
        const duplicateFiles = [
            'dist/what-we-do.html',
            'dist/scopes-materials.html',
            'dist/project-portfolio.html',
            'dist/contact-us.html'
        ];

        for (const file of duplicateFiles) {
            if (await fs.pathExists(file)) {
                await fs.remove(file);
                console.log(`Removed duplicate file: ${file}`);
            }
        }

    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build();
