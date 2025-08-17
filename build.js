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

        // Remove duplicate .html files to avoid SEO conflicts
        const duplicateFiles = [
            'dist/what-we-do.html',
            'dist/scopes-materials.html',
            'dist/project-portfolio.html',
            'dist/contact-us.html',
            'dist/commercial-countertop-installation-michigan.html'
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
