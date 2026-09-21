import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const filesToOptimize = [
  'public/assets/3d-icons/cricket-player.png',
  'public/assets/3d-icons/sharjah-icon.png',
  'public/assets/3d-icons/auction-gavel.png',
  'public/assets/banners/3-desktop.jpg',
  'public/assets/voucher_banner.jpg'
];

async function optimize() {
  for (const file of filesToOptimize) {
    const fullPath = path.join(process.cwd(), file);
    if (!fs.existsSync(fullPath)) {
      console.error(`File not found: ${fullPath}`);
      continue;
    }
    
    const ext = path.extname(file).toLowerCase();
    const tempPath = fullPath + '.tmp' + ext;
    
    try {
      if (ext === '.png') {
        await sharp(fullPath)
          .resize({ width: 800, withoutEnlargement: true }) // resize if larger than 800px width
          .png({ quality: 80, compressionLevel: 9 })
          .toFile(tempPath);
      } else if (ext === '.jpg' || ext === '.jpeg') {
        await sharp(fullPath)
          .resize({ width: 1200, withoutEnlargement: true }) // resize if larger than 1200px width
          .jpeg({ quality: 80, progressive: true })
          .toFile(tempPath);
      }
      
      // Replace original with optimized
      fs.renameSync(tempPath, fullPath);
      console.log(`Successfully optimized: ${file}`);
    } catch (e) {
      console.error(`Error optimizing ${file}:`, e);
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
  }
}

optimize();
