#!/usr/bin/env node

/**
 * Performance Check Script
 * Analyzes build output and provides performance recommendations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '../dist');
const MAX_JS_SIZE = 400 * 1024; // 400KB
const MAX_CSS_SIZE = 100 * 1024; // 100KB
const MAX_VENDOR_SIZE = 250 * 1024; // 250KB

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function analyzeDirectory(dir, results = { js: [], css: [], images: [] }) {
  if (!fs.existsSync(dir)) {
    console.error('❌ Build directory not found. Run "npm run build" first.');
    process.exit(1);
  }

  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      analyzeDirectory(filePath, results);
    } else {
      const ext = path.extname(file).toLowerCase();
      const size = stat.size;
      
      if (ext === '.js') {
        results.js.push({ name: file, size, path: filePath });
      } else if (ext === '.css') {
        results.css.push({ name: file, size, path: filePath });
      } else if (['.jpg', '.jpeg', '.png', '.webp', '.avif', '.svg', '.gif'].includes(ext)) {
        results.images.push({ name: file, size, path: filePath });
      }
    }
  }
  
  return results;
}

function checkPerformance() {
  console.log('\n🔍 Performance Check Started\n');
  console.log('='.repeat(60));
  
  const results = analyzeDirectory(DIST_DIR);
  
  // Sort by size
  results.js.sort((a, b) => b.size - a.size);
  results.css.sort((a, b) => b.size - a.size);
  results.images.sort((a, b) => b.size - a.size);
  
  // JavaScript Analysis
  console.log('\n📦 JavaScript Bundles:\n');
  let totalJsSize = 0;
  let jsWarnings = 0;
  
  results.js.forEach((file, index) => {
    totalJsSize += file.size;
    const status = file.size > MAX_JS_SIZE ? '⚠️' : '✅';
    if (file.size > MAX_JS_SIZE) jsWarnings++;
    
    if (index < 10) { // Show top 10
      console.log(`  ${status} ${file.name}: ${formatBytes(file.size)}`);
    }
  });
  
  console.log(`\n  Total JS: ${formatBytes(totalJsSize)} (${results.js.length} files)`);
  
  // CSS Analysis
  console.log('\n🎨 CSS Files:\n');
  let totalCssSize = 0;
  let cssWarnings = 0;
  
  results.css.forEach((file) => {
    totalCssSize += file.size;
    const status = file.size > MAX_CSS_SIZE ? '⚠️' : '✅';
    if (file.size > MAX_CSS_SIZE) cssWarnings++;
    
    console.log(`  ${status} ${file.name}: ${formatBytes(file.size)}`);
  });
  
  console.log(`\n  Total CSS: ${formatBytes(totalCssSize)} (${results.css.length} files)`);
  
  // Images Analysis
  console.log('\n🖼️ Images:\n');
  let totalImageSize = 0;
  const largeImages = results.images.filter(img => img.size > 200 * 1024);
  
  results.images.forEach((file) => {
    totalImageSize += file.size;
  });
  
  if (largeImages.length > 0) {
    console.log(`  ⚠️ ${largeImages.length} images over 200KB:`);
    largeImages.slice(0, 5).forEach(img => {
      console.log(`     - ${img.name}: ${formatBytes(img.size)}`);
    });
  } else {
    console.log('  ✅ All images under 200KB');
  }
  
  console.log(`\n  Total Images: ${formatBytes(totalImageSize)} (${results.images.length} files)`);
  
  // Overall Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Overall Summary:\n');
  
  const totalSize = totalJsSize + totalCssSize + totalImageSize;
  console.log(`  Total Bundle Size: ${formatBytes(totalSize)}`);
  console.log(`  JS:     ${formatBytes(totalJsSize)} (${((totalJsSize/totalSize)*100).toFixed(1)}%)`);
  console.log(`  CSS:    ${formatBytes(totalCssSize)} (${((totalCssSize/totalSize)*100).toFixed(1)}%)`);
  console.log(`  Images: ${formatBytes(totalImageSize)} (${((totalImageSize/totalSize)*100).toFixed(1)}%)`);
  
  // Recommendations
  console.log('\n💡 Recommendations:\n');
  
  if (jsWarnings > 0) {
    console.log(`  ⚠️ ${jsWarnings} JS bundle(s) exceed 400KB - Consider code splitting`);
  } else {
    console.log('  ✅ All JS bundles are optimally sized');
  }
  
  if (cssWarnings > 0) {
    console.log(`  ⚠️ ${cssWarnings} CSS file(s) exceed 100KB - Consider splitting CSS`);
  } else {
    console.log('  ✅ CSS files are optimally sized');
  }
  
  if (largeImages.length > 0) {
    console.log(`  ⚠️ ${largeImages.length} large images found - Consider optimization`);
  } else {
    console.log('  ✅ All images are optimally sized');
  }
  
  if (totalSize < 2 * 1024 * 1024) {
    console.log('  ✅ Total bundle size is excellent (< 2MB)');
  } else if (totalSize < 3 * 1024 * 1024) {
    console.log('  ⚠️ Total bundle size is acceptable (< 3MB)');
  } else {
    console.log('  ❌ Total bundle size needs optimization (> 3MB)');
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Exit with appropriate code
  if (jsWarnings > 2 || cssWarnings > 1 || totalSize > 3 * 1024 * 1024) {
    console.log('❌ Performance check failed - optimization needed\n');
    process.exit(1);
  } else {
    console.log('✅ Performance check passed\n');
    process.exit(0);
  }
}

try {
  checkPerformance();
} catch (error) {
  console.error('❌ Error during performance check:', error.message);
  process.exit(1);
}
