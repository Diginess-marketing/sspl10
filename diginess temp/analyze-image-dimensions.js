import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const IMAGE_DIRECTORIES = [
  '.', // Current directory (httpdocs)
  'Gallery',
  'public',
  'Explore the teams',
  'lovable-uploads'
];

const MAX_DIMENSIONS = {
  general: 1920,
  gallery: 800,
  thumbnail: 300
};

// Image category classification based on path and naming patterns
function classifyImageCategory(filePath) {
  if (filePath.includes('Gallery') || filePath.includes('IMG_')) {
    return 'gallery';
  }
  
  // Check for responsive variants with width in filename
  const widthMatch = filePath.match(/(\d+)w/);
  if (widthMatch) {
    const width = parseInt(widthMatch[1]);
    if (width <= 300) return 'thumbnail';
    if (width <= 800) return 'gallery';
    if (width <= 1920) return 'general';
  }
  
  // Check for team/state images (likely thumbnails)
  if (filePath.includes('Explore the teams')) {
    return 'thumbnail';
  }
  
  // Default to general category
  return 'general';
}

async function getImageDimensions(filePath) {
  try {
    const metadata = await sharp(filePath).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format
    };
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

async function analyzeImages() {
  const results = {
    oversized: [],
    compliant: [],
    errors: []
  };

  console.log('🔍 Analyzing image dimensions...\n');

  for (const dir of IMAGE_DIRECTORIES) {
    try {
      // Check if directory exists
      const stats = await fs.stat(dir);
      if (!stats.isDirectory()) {
        console.log(`⏭️  Skipping ${dir} - not a directory`);
        continue;
      }

      const files = await fs.readdir(dir);
      console.log(`📁 Scanning directory: ${dir}`);
      
      for (const file of files) {
        if (file.match(/\.(jpg|jpeg|png|webp|avif)$/i)) {
          const filePath = path.join(dir, file);
          const category = classifyImageCategory(filePath);
          const maxWidth = MAX_DIMENSIONS[category];
          
          console.log(`📸 Analyzing: ${filePath}`);
          
          const dimensions = await getImageDimensions(filePath);
          if (!dimensions) {
            results.errors.push({ file: filePath, error: 'Could not read dimensions' });
            continue;
          }
          
          const { width, height, format } = dimensions;
          const isOversized = width > maxWidth;
          
          const result = {
            file: filePath,
            category,
            width,
            height,
            format,
            maxWidth,
            oversized: isOversized
          };
          
          if (isOversized) {
            results.oversized.push(result);
            console.log(`  ⚠️  OVERSIZED: ${width}x${height} (max: ${maxWidth}px)`);
          } else {
            results.compliant.push(result);
            console.log(`  ✅ OK: ${width}x${height} (max: ${maxWidth}px)`);
          }
          console.log('');
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error.message);
    }
  }

  // Summary
  console.log('📊 SUMMARY REPORT');
  console.log('==================');
  console.log(`Total images analyzed: ${results.compliant.length + results.oversized.length + results.errors.length}`);
  console.log(`Compliant images: ${results.compliant.length}`);
  console.log(`Oversized images: ${results.oversized.length}`);
  console.log(`Errors: ${results.errors.length}`);
  
  if (results.oversized.length > 0) {
    console.log('\n🚨 OVERSIZED IMAGES REQUIRING RESIZE:');
    console.log('=====================================');
    results.oversized.forEach(img => {
      console.log(`• ${img.file}`);
      console.log(`  Category: ${img.category}, Current: ${img.width}x${img.height}, Max: ${img.maxWidth}px`);
    });
  }
  
  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    console.log('==========');
    results.errors.forEach(error => {
      console.log(`• ${error.file}: ${error.error}`);
    });
  }

  // Save detailed report
  await fs.writeFile('image-dimension-report.json', JSON.stringify(results, null, 2));
  console.log('\n💾 Detailed report saved to image-dimension-report.json');
  
  return results;
}

// Run the analysis
analyzeImages().catch(console.error);