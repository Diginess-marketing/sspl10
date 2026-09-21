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

async function resizeImageProperly(inputPath, targetMaxWidth, format) {
  try {
    const pipeline = sharp(inputPath);
    const metadata = await pipeline.metadata();
    
    if (metadata.width <= targetMaxWidth) {
      // No need to resize, just copy
      return { success: true, action: 'no_resize_needed', dimensions: `${metadata.width}x${metadata.height}` };
    }
    
    // Calculate new dimensions maintaining aspect ratio
    const newHeight = Math.round(metadata.height * (targetMaxWidth / metadata.width));
    
    // Resize and save to temporary file first
    const tempPath = inputPath + '.temp';
    const outputPath = inputPath; // We'll overwrite the original
    
    await pipeline
      .resize({ 
        width: targetMaxWidth, 
        height: newHeight,
        fit: 'inside',
        withoutEnlargement: true 
      })
      .toFormat(format === 'avif' ? 'avif' : format === 'webp' ? 'webp' : 'jpeg', {
        quality: 85,
        progressive: true
      })
      .toFile(tempPath);
    
    // Replace original with resized version
    await fs.rename(tempPath, outputPath);
    
    return { success: true, action: 'resized', dimensions: `${targetMaxWidth}x${newHeight}` };
  } catch (error) {
    // Clean up temp file if it exists
    try {
      await fs.unlink(inputPath + '.temp');
    } catch (e) {
      // Ignore cleanup errors
    }
    console.error(`Error processing ${inputPath}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function resizeOversizedImagesProperly() {
  const resizedImages = [];
  const errors = [];
  
  console.log('🔄 Starting improved image resizing process...\n');
  
  // Group oversized images by category
  const oversizedByCategory = results.oversized.reduce((acc, img) => {
    if (!acc[img.category]) acc[img.category] = [];
    acc[img.category].push(img);
    return acc;
  }, {});
  
  for (const [category, images] of Object.entries(oversizedByCategory)) {
    const maxWidth = MAX_DIMENSIONS[category];
    console.log(`📂 Processing ${category} images (max width: ${maxWidth}px)`);
    console.log(`   Found ${images.length} oversized images\n`);
    
    // Process only original images (not responsive variants)
    const originalImages = images.filter(img => 
      !img.file.match(/-\d+w(\.(avif|webp|jpeg|png|jpg))$/i)
    );
    
    for (const imgInfo of originalImages) {
      const { file, width, height, format } = imgInfo;
      
      console.log(`🔄 Processing: ${file}`);
      console.log(`   Original: ${width}x${height}, Target max: ${maxWidth}px`);
      
      // Get available formats for this image
      const formats = [];
      const baseName = path.parse(file).name;
      const dir = path.dirname(file);
      
      // Check what formats exist for this image
      const possibleFormats = ['.avif', '.webp', '.jpg', '.png'];
      for (const ext of possibleFormats) {
        const testFile = path.join(dir, baseName + ext);
        try {
          await fs.access(testFile);
          formats.push(ext.substring(1)); // Remove the dot
        } catch {
          // File doesn't exist, skip
        }
      }
      
      // Process each available format
      for (const fmt of formats) {
        const inputFile = path.join(dir, baseName + '.' + (fmt === 'jpg' ? 'jpg' : fmt));
        
        // Skip if it's a responsive variant
        if (path.basename(inputFile).match(/-\d+w(\.(avif|webp|jpeg|png|jpg))$/i)) {
          continue;
        }
        
        const result = await resizeImageProperly(inputFile, maxWidth, fmt);
        
        if (result.success) {
          console.log(`   ✅ ${fmt.toUpperCase()}: ${result.action} (${result.dimensions})`);
          resizedImages.push({
            original: inputFile,
            category,
            format: fmt,
            action: result.action,
            dimensions: result.dimensions
          });
        } else {
          console.log(`   ❌ ${fmt.toUpperCase()}: ${result.error}`);
          errors.push({
            file: inputFile,
            error: result.error
          });
        }
      }
      console.log('');
    }
  }
  
  // Generate final report
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
  
  await fs.writeFile('image-resize-final-report.json', JSON.stringify(report, null, 2));
  
  // Summary
  console.log('📊 FINAL RESIZING REPORT');
  console.log('========================');
  console.log(`Total oversized images found: ${results.oversized.length}`);
  console.log(`Successfully processed: ${resizedImages.length}`);
  console.log(`Errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n❌ REMAINING ERRORS:');
    errors.forEach(error => {
      console.log(`• ${error.file}: ${error.error}`);
    });
  }
  
  console.log('\n💾 Final report saved to image-resize-final-report.json');
  console.log('✅ Image resizing completed!');
  
  return report;
}

// Run the improved resizing process
resizeOversizedImagesProperly().catch(console.error);