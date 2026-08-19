const sharp = require('sharp');

async function generateFavicons() {
  const input = 'public/logo_rond.png';
  
  await sharp(input).resize(16, 16).png().toFile('public/favicon-16x16.png');
  await sharp(input).resize(32, 32).png().toFile('public/favicon-32x32.png');
  await sharp(input).resize(180, 180).png().toFile('public/apple-touch-icon.png');
  await sharp(input).resize(192, 192).png().toFile('public/android-chrome-192x192.png');
  await sharp(input).resize(512, 512).png().toFile('public/android-chrome-512x512.png');
  
  // Create favicon.ico by copying 32x32
  await sharp(input).resize(32, 32).toFile('public/favicon.ico');
  
  console.log('Favicons generated successfully.');
}

generateFavicons().catch(console.error);
