/**
 * Copy logo assets (AVIF, WebP, PNG) to dist folder
 * This ensures all logo variants are available in production builds
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../public');
const distDir = path.join(__dirname, '../dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy all logo files (logo-*.avif, logo-*.webp, logo-*.png, logo.*)
const logoPattern = /^logo(-\d+w)?\.(?:avif|webp|png)$/;

try {
  const files = fs.readdirSync(publicDir);
  let copiedCount = 0;

  files.forEach(file => {
    if (logoPattern.test(file)) {
      const srcPath = path.join(publicDir, file);
      const destPath = path.join(distDir, file);
      
      // Copy file
      fs.copyFileSync(srcPath, destPath);
      copiedCount++;
    }
  });

  console.log(`✅ Copied ${copiedCount} logo file(s) to dist`);
} catch (error) {
  console.error('❌ Error copying logo files:', error);
  process.exit(1);
}
