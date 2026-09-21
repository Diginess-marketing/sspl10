import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List of WebP files that need resizing
const filesToFix = [
  'Andra Pradesh.webp',
  'Karnataka.webp', 
  'Kerala.webp',
  'Pudhucherry.webp',
  'Tamil Nadu.webp',
  'Telangana.webp'
];

const teamsDir = path.join(__dirname, 'Explore the teams');

async function fixOversizedWebPFiles() {
  console.log('🔧 Starting WebP file resizing...');
  
  for (const fileName of filesToFix) {
    const inputPath = path.join(teamsDir, fileName);
    const outputPath = path.join(teamsDir, fileName);
    
    try {
      // Check if file exists
      if (!fs.existsSync(inputPath)) {
        console.log(`⚠️  ${fileName} not found, skipping...`);
        continue;
      }
      
      // Get original dimensions first
      const metadata = await sharp(inputPath).metadata();
      console.log(`📏 ${fileName}: Original dimensions ${metadata.width}x${metadata.height}`);
      
      // Check if width exceeds 300px
      if (metadata.width > 300) {
        // Calculate new height to maintain aspect ratio
        const newHeight = Math.round((300 / metadata.width) * metadata.height);
        
        // Create temporary file path
        const tempPath = path.join(teamsDir, `temp_${fileName}`);
        
        // Resize to max width of 300px
        await sharp(inputPath)
          .resize(300, newHeight, { 
            withoutEnlargement: true, // Don't upscale if already smaller
            fit: 'inside'
          })
          .webp({ quality: 85 })
          .toFile(tempPath);
          
        // Replace original with resized version
        fs.unlinkSync(outputPath);
        fs.renameSync(tempPath, outputPath);
          
        console.log(`✅ Resized ${fileName} to 300x${newHeight}px`);
      } else {
        console.log(`✅ ${fileName} already compliant (${metadata.width}x${metadata.height})`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${fileName}:`, error.message);
    }
  }
  
  console.log('🎉 WebP resizing complete!');
}

fixOversizedWebPFiles().catch(console.error);