#!/usr/bin/env node

/**
 * SSPL Android Icon Generator
 * 
 * Generates all required Android icon sizes from the SSPL logo
 * Using ImageMagick or canvas library
 * 
 * Usage: node scripts/generate-icons.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  error: (msg) => console.error(`${colors.red}✗ ERROR: ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warn: (msg) => console.warn(`${colors.yellow}⚠ WARNING: ${msg}${colors.reset}`),
};

async function generateIcons() {
  console.log(`\n${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}        SSPL Android Icon Generator${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}\n`);

  try {
    // Try to use Sharp library if available
    try {
      const sharp = await import('sharp');
      log.info('Using Sharp library for icon generation');
      await generateIconsWithSharp(sharp.default);
    } catch (e) {
      log.warn('Sharp library not installed');
      log.info('Installing Sharp...');
      
      // Install sharp
      try {
        execSync('npm install sharp', { stdio: 'inherit' });
        const sharp = await import('sharp');
        await generateIconsWithSharp(sharp.default);
      } catch (installError) {
        log.error('Could not install Sharp. Trying ImageMagick...');
        tryImageMagick();
      }
    }
  } catch (error) {
    log.error(`Icon generation failed: ${error.message}`);
    log.info('Alternative: Use online tool at https://www.favicon-generator.org/');
    process.exit(1);
  }
}

async function generateIconsWithSharp(sharp) {
  const sourceIcon = path.join(process.cwd(), 'public', 'ssplt10-logo.png');
  
  if (!fs.existsSync(sourceIcon)) {
    log.error(`Source icon not found: ${sourceIcon}`);
    log.info('Please ensure ssplt10-logo.png exists in public/ directory');
    process.exit(1);
  }

  log.info(`Using source icon: ${sourceIcon}`);

  // Define icon sizes needed
  const icons = [
    { name: 'icon-192x192.png', size: 192, maskable: false },
    { name: 'icon-192x192-maskable.png', size: 192, maskable: true },
    { name: 'icon-384x384.png', size: 384, maskable: false },
    { name: 'icon-384x384-maskable.png', size: 384, maskable: true },
    { name: 'icon-512x512.png', size: 512, maskable: false },
    { name: 'icon-512x512-maskable.png', size: 512, maskable: true },
    { name: 'icon-96x96.png', size: 96, maskable: false },
  ];

  const outputDir = path.join(process.cwd(), 'public');

  console.log(`\n${colors.blue}Generating ${icons.length} icon sizes...${colors.reset}\n`);

  for (const icon of icons) {
    const outputPath = path.join(outputDir, icon.name);
    
    try {
      await sharp(sourceIcon)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(outputPath);
      
      const stats = fs.statSync(outputPath);
      const size = (stats.size / 1024).toFixed(2);
      log.success(`Generated: ${icon.name} (${size} KB)`);
    } catch (error) {
      log.error(`Failed to generate ${icon.name}: ${error.message}`);
      throw error;
    }
  }

  console.log(`\n${colors.green}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}All icons generated successfully!${colors.reset}`);
  console.log(`${colors.green}═══════════════════════════════════════════════════════════${colors.reset}\n`);

  log.info(`Output directory: ${outputDir}`);
  log.success('Icons ready for Android app and Play Store');
}

function tryImageMagick() {
  
  try {
    log.info('Checking for ImageMagick...');
    execSync('convert --version', { stdio: 'ignore' });
    
    log.info('Using ImageMagick for icon generation');
    
    const sourceIcon = path.join(process.cwd(), 'public', 'ssplt10-logo.png');
    const outputDir = path.join(process.cwd(), 'public');
    
    const sizes = [
      'icon-192x192.png',
      'icon-384x384.png',
      'icon-512x512.png',
      'icon-96x96.png'
    ];
    
    sizes.forEach(iconName => {
      const size = iconName.match(/\d+/)[0];
      const outputPath = path.join(outputDir, iconName);
      
      execSync(`convert "${sourceIcon}" -resize ${size}x${size} "${outputPath}"`, {
        stdio: 'inherit'
      });
      log.success(`Generated: ${iconName}`);
    });
    
    log.success('Icons generated with ImageMagick');
  } catch (error) {
    log.error('ImageMagick not available');
    log.info('Install options:');
    console.log('  Windows (Chocolatey): choco install imagemagick');
    console.log('  macOS (Homebrew): brew install imagemagick');
    console.log('  Linux (apt): sudo apt-get install imagemagick');
    console.log('\nAlternatively, generate icons online:');
    console.log('  https://www.favicon-generator.org/');
    process.exit(1);
  }
}

// Run the script
generateIcons().catch(error => {
  log.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});
