// Run this with Node.js to generate PNG icons from SVGs
// Requires: npm install sharp
// Usage: node generate-pngs.js

const fs = require('fs');

async function generatePNGs() {
  try {
    const sharp = require('sharp');
    
    const sizes = [16, 48, 128];
    
    for (const size of sizes) {
      await sharp(`icon${size}.svg`)
        .resize(size, size)
        .png()
        .toFile(`icon${size}.png`);
      
      console.log(`Generated icon${size}.png`);
    }
    
    console.log('All icons generated!');
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('Sharp not installed. Run: npm install sharp');
      console.log('Or convert SVGs manually using an online tool.');
    } else {
      console.error('Error:', error);
    }
  }
}

generatePNGs();
