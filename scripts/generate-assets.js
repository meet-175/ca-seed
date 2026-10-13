import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateAssets() {
  const publicDir = path.resolve('public');
  const faviconSvg = path.join(publicDir, 'favicon.svg');
  const logoSvg = path.join(publicDir, 'logo.svg');
  const logoWhiteSvg = path.join(publicDir, 'logo-white.svg');

  console.log('Generating favicon PNGs...');
  
  // 32x32
  await sharp(faviconSvg)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));

  // 64x64 favicon.png
  await sharp(faviconSvg)
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  // 180x180 apple-touch-icon.png
  await sharp(faviconSvg)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 192x192 pwa / android
  await sharp(faviconSvg)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'favicon-192.png'));

  // 512x512 high-res
  await sharp(faviconSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'favicon-512.png'));

  // Logo PNGs
  console.log('Generating logo PNGs...');
  await sharp(logoSvg)
    .resize(720, 168)
    .png()
    .toFile(path.join(publicDir, 'logo.png'));

  await sharp(logoWhiteSvg)
    .resize(720, 168)
    .png()
    .toFile(path.join(publicDir, 'logo-white.png'));

  // favicon.ico can be copied from 32x32 png (modern browsers and web servers accept 32x32 png as favicon.ico or favicon.png)
  fs.copyFileSync(path.join(publicDir, 'favicon-32x32.png'), path.join(publicDir, 'favicon.ico'));

  console.log('All brand assets generated successfully!');
}

generateAssets().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
