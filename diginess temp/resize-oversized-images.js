import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const MAX_DIMENSIONS = {
  general: 1920,
  gallery: 800,
  thumbnail: 300
};

// Load the analysis results
const results = JSON.parse(await fs.readFile('image-dimension-report.json', 'utf8'));

async function resizeImage(inputPath, outputPath, maxWidth, format) {
  try {
    const pipeline = sharp(inputPath);
    const metadata = await pipeline.metadata();
    
    if (metadata.width <= maxWidth) {
      // No need to resize, just copy
      await fs.copyFile(inputPath, outputPath);
      return { success: true, action: 'copied' };
    }
    
    // Resize maintaining aspect ratio
    await pipeline
      .resize({ 
        width: maxWidth, 
        height: metadata.height * (maxWidth / metadata.width),
        fit: 'inside',
        withoutEnlargement: true 
      })
      .toFormat(format === 'avif' ? 'avif' : format === 'webp' ? 'webp' : 'jpeg', {
        quality: 85,
        progressive: true
      })
      .toFile(outputPath);
    
    return { success: true, action: 'resized' };
  } catch (error) {
    console.error(`Error processing ${inputPath}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function resizeOversizedImages() {
  const resizedImages = [];
  const errors = [];
  
  console.log('🔄 Starting image resizing process...\n');
  
  // Group oversized images by category for batch processing
  const oversizedByCategory = results.oversized.reduce((acc, img) => {
    if (!acc[img.category]) acc[img.category] = [];
    acc[img.category].push(img);
    return acc;
  }, {});
  
  for (const [category, images] of Object.entries(oversizedByCategory)) {
    const maxWidth = MAX_DIMENSIONS[category];
    console.log(`📂 Processing ${category} images (max width: ${maxWidth}px)`);
    console.log(`   Found ${images.length} oversized images\n`);
    
    for (const imgInfo of images) {
      const { file, width, height, format } = imgInfo;
      const ext = path.extname(file);
      const baseName = path.parse(file).name;
      const dir = path.dirname(file);
      
      console.log(`🔄 Processing: ${file}`);
      console.log(`   Original: ${width}x${height}, Target max: ${maxWidth}px`);
      
      // Process each format
      const formats = ['avif', 'webp', 'jpeg', 'png'];
      
      for (const fmt of formats) {
        const inputFile = file;
        const outputFile = path.join(dir, `${baseName}.${fmt === 'jpeg' ? 'jpg' : fmt}`);
        
        // Skip if file doesn't exist
        try {
          await fs.access(inputFile);
        } catch {
          continue;
        }
        
        const result = await resizeImage(inputFile, outputFile, maxWidth, fmt);
        
        if (result.success) {
          console.log(`   ✅ ${fmt.toUpperCase()}: ${result.action}`);
          resizedImages.push({
            original: inputFile,
            resized: outputFile,
            category,
            format: fmt,
            action: result.action
          });
        } else {
          console.log(`   ❌ ${fmt.toUpperCase()}: ${result.error}`);
          errors.push({
            file: outputFile,
            error: result.error
          });
        }
      }
      console.log('');
    }
  }
  
  // Generate resizing report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalOversized: results.oversized.length,
      successfullyResized: resizedImages.length,
      errors: errors.length
    },
    resizedImages,
    errors
  };
  
  await fs.writeFile('image-resize-report.json', JSON.stringify(report, null, 2));
  
  // Summary
  console.log('📊 RESIZING COMPLETE');
  console.log('====================');
  console.log(`Total oversized images: ${results.oversized.length}`);
  console.log(`Successfully processed: ${resizedImages.length}`);
  console.log(`Errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n❌ ERRORS:');
    errors.forEach(error => {
      console.log(`• ${error.file}: ${error.error}`);
    });
  }
  
  console.log('\n💾 Detailed report saved to image-resize-report.json');
  console.log('🎉 Image resizing completed!');
  
  return report;
}

// Run the resizing process
resizeOversizedImages().catch(console.error);