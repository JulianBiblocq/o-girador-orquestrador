const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processLogo() {
  const inputPath = 'public/logo_source.jpg';
  
  // We assume the circle is in the center.
  // The image is 2816x1536. Let's try a size of 1024x1024 for the circle.
  // cx = 1408, cy = 768
  const sizes = [1100, 1200, 1300]; // We will test a few crop sizes to see which one fits the circle best.
  
  for (const size of sizes) {
    const left = Math.floor(1408 - size / 2);
    const top = Math.floor(768 - size / 2);
    
    const circleSvg = `<svg width="${size}" height="${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" />
    </svg>`;
    const circleMask = Buffer.from(circleSvg);
    
    await sharp(inputPath)
      .extract({ left, top, width: size, height: size })
      .composite([{ input: circleMask, blend: 'dest-in' }])
      .png()
      .toFile(`public/test_circle_${size}.png`);
  }
  console.log('Test crops generated!');
}

processLogo().catch(console.error);
