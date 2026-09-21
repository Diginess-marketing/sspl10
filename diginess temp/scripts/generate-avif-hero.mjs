import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public');

const heroBase = 'ravi mohan home with bg';
const widths = [480, 768, 1024, 1280, 1920];

async function generateAVIF() {
  console.log('🎨 Generating AVIF versions of hero images...\n');
  
  for (const width of widths) {
    const inputFile = join(publicDir, `${heroBase}-${width}w.webp`);
    const outputFile = join(publicDir, `${heroBase}-${width}w.avif`);
    
    if (!existsSync(inputFile)) {
      console.log(`⚠️  Skipping ${width}w - input file not found`);
      continue;
    }
    
    try {
      const startTime = Date.now();
      const inputStats = await sharp(inputFile).metadata();
      
      await sharp(inputFile)
        .avif({
          quality: 65, // AVIF can maintain quality at lower settings
          effort: 6,   // Higher effort = better compression (0-9)
          chromaSubsampling: '4:2:0',
        })
        .toFile(outputFile);
      
      const outputStats = await sharp(outputFile).metadata();
      const inputSize = (inputStats.size || 0) / 1024;
      const outputSize = (outputStats.size || 0) / 1024;
      const savings = ((1 - outputSize / inputSize) * 100).toFixed(1);
      const duration = Date.now() - startTime;
      
      console.log(`✅ ${width}w: ${inputSize.toFixed(1)}KB → ${outputSize.toFixed(1)}KB (${savings}% smaller) [${duration}ms]`);
    } catch (error) {
      console.error(`❌ Failed to convert ${width}w:`, error.message);
    }
  }
  
  // Generate full-size AVIF
  const fullInput = join(publicDir, `${heroBase}.webp`);
  const fullOutput = join(publicDir, `${heroBase}.avif`);
  
  if (existsSync(fullInput)) {
    try {
      const startTime = Date.now();
      const inputStats = await sharp(fullInput).metadata();
      
      await sharp(fullInput)
        .avif({
          quality: 65,
          effort: 6,
          chromaSubsampling: '4:2:0',
        })
        .toFile(fullOutput);
      
      const outputStats = await sharp(fullOutput).metadata();
      const inputSize = (inputStats.size || 0) / 1024;
      const outputSize = (outputStats.size || 0) / 1024;
      const savings = ((1 - outputSize / inputSize) * 100).toFixed(1);
      const duration = Date.now() - startTime;
      
      console.log(`✅ Full: ${inputSize.toFixed(1)}KB → ${outputSize.toFixed(1)}KB (${savings}% smaller) [${duration}ms]`);
    } catch (error) {
      console.error(`❌ Failed to convert full image:`, error.message);
    }
  }
  
  console.log('\n✨ AVIF generation complete!');
  console.log('📊 AVIF images are typically 30-50% smaller than WebP');
  console.log('🚀 This will significantly improve LCP (Largest Contentful Paint)');
}

generateAVIF().catch(console.error);
