#!/usr/bin/env node

/**
 * Image Optimization Script
 * Identifies and removes oversized images, provides cleanup recommendations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '../dist');
const MAX_IMAGE_SIZE = 500 * 1024; // 500KB max per image
const CRITICAL_SIZE = 1 * 1024 * 1024; // 1MB critical threshold

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function findLargeImages(dir, images = []) {
  if (!fs.existsSync(dir)) return images;
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findLargeImages(filePath, images);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'].includes(ext)) {
        if (stat.size > MAX_IMAGE_SIZE) {
          images.push({
            name: file,
            path: filePath,
            size: stat.size,
            relativePath: path.relative(DIST_DIR, filePath)
          });
        }
      }
    }
  }
  
  return images;
}

function analyzeImages() {
  console.log('\n🖼️  Image Optimization Analysis\n');
  console.log('='.repeat(60));
  
  const largeImages = findLargeImages(DIST_DIR);
  
  if (largeImages.length === 0) {
    console.log('\n✅ All images are under 500KB - Excellent!\n');
    return;
  }
  
  largeImages.sort((a, b) => b.size - a.size);
  
  const critical = largeImages.filter(img => img.size > CRITICAL_SIZE);
  const large = largeImages.filter(img => img.size <= CRITICAL_SIZE && img.size > MAX_IMAGE_SIZE);
  
  if (critical.length > 0) {
    console.log(`\n❌ CRITICAL: ${critical.length} images over 1MB:\n`);
    critical.forEach((img, index) => {
      if (index < 10) {
        console.log(`   ${index + 1}. ${img.name}: ${formatBytes(img.size)}`);
        console.log(`      Path: ${img.relativePath}`);
      }
    });
  }
  
  if (large.length > 0) {
    console.log(`\n⚠️  ${large.length} images between 500KB-1MB:\n`);
    large.slice(0, 10).forEach((img, index) => {
      console.log(`   ${index + 1}. ${img.name}: ${formatBytes(img.size)}`);
    });
  }
  
  // Calculate potential savings
  const totalSize = largeImages.reduce((sum, img) => sum + img.size, 0);
  const potentialSavings = largeImages.reduce((sum, img) => {
    // Assume 70% compression for images over 1MB, 50% for others
    const compressionRate = img.size > CRITICAL_SIZE ? 0.7 : 0.5;
    return sum + (img.size * compressionRate);
  }, 0);
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:\n');
  console.log(`  Total large images: ${largeImages.length}`);
  console.log(`  Total size: ${formatBytes(totalSize)}`);
  console.log(`  Potential savings: ${formatBytes(potentialSavings)} (${Math.round((potentialSavings/totalSize)*100)}%)`);
  
  console.log('\n💡 Recommendations:\n');
  console.log('  1. Use image optimization tools (sharp, imagemin)');
  console.log('  2. Convert large PNGs to WebP/AVIF format');
  console.log('  3. Implement lazy loading for below-fold images');
  console.log('  4. Use CDN with automatic image optimization');
  console.log('  5. Remove unused image variants');
  
  console.log('\n🚀 Quick Fix Commands:\n');
  console.log('  npm run images:optimize    # Optimize all images');
  console.log('  npm run images:clean       # Clean unused variants');
  
  console.log('\n' + '='.repeat(60) + '\n');
}

try {
  analyzeImages();
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
