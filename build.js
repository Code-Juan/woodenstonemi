const fs = require('fs-extra');
const path = require('path');

async function build() {
    try {
        console.log('Building for Netlify deployment...');
        
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
        
        console.log('Build completed successfully!');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build();
