import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicSvgDir = path.join(__dirname, '../public/assets/svg');
const distSvgDir = path.join(__dirname, '../dist/assets/svg');

// Create dist/assets/svg directory if it doesn't exist
if (!fs.existsSync(distSvgDir)) {
  fs.mkdirSync(distSvgDir, { recursive: true });
  console.log(`✅ Created directory: ${distSvgDir}`);
}

// Copy SVG files from public to dist
if (fs.existsSync(publicSvgDir)) {
  const svgFiles = fs.readdirSync(publicSvgDir).filter(file => file.endsWith('.svg'));
  
  svgFiles.forEach(file => {
    const srcPath = path.join(publicSvgDir, file);
    const destPath = path.join(distSvgDir, file);
    fs.copyFileSync(srcPath, destPath);
  });
  
  console.log(`✅ Copied ${svgFiles.length} SVG file(s) to dist/assets/svg`);
} else {
  console.log('⚠️ No SVG assets found in public/assets/svg');
}
