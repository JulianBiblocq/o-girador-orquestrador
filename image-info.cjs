const sharp = require('sharp');

async function info() {
  const metadata = await sharp('public/logo_source.jpg').metadata();
  console.log(`Image size: ${metadata.width}x${metadata.height}`);
}

info().catch(console.error);
