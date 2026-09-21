#!/usr/bin/env node

/**
 * SSPL Bubblewrap Initialization Helper
 * 
 * This script helps initialize Bubblewrap with proper configuration
 * Run: node scripts/init-bubblewrap.js
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

async function initBubblewrap() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║     SSPL Bubblewrap Initialization Helper                  ║
║     PWA → Android App                                      ║
╚════════════════════════════════════════════════════════════╝
  `);

  // Gather information
  console.log(`\n📋 Application Configuration\n`);

  const domain = await question(`Enter your SSPL production domain (e.g., cricket.sspl.com): `);
  const appName = await question(`Enter app name (default: SSPL T10): `) || 'SSPL T10';
  const packageId = await question(`Enter package ID (default: com.ssplt10.cricket): `) || 'com.ssplt10.cricket';

  // Validate domain
  if (!domain || !domain.includes('.')) {
    console.error('\n❌ Invalid domain');
    rl.close();
    process.exit(1);
  }

  // Construct manifest URL
  const manifestUrl = `https://${domain}/manifest.json`;

  console.log(`\n✓ Configuration:`);
  console.log(`  - Domain: ${domain}`);
  console.log(`  - App Name: ${appName}`);
  console.log(`  - Package ID: ${packageId}`);
  console.log(`  - Manifest: ${manifestUrl}\n`);

  // Update twa-manifest.json
  const twaPath = path.join(process.cwd(), 'twa-manifest.json');
  let twaConfig = JSON.parse(fs.readFileSync(twaPath, 'utf-8'));

  twaConfig.hostName = domain;
  twaConfig.name = appName;
  twaConfig.launcherName = appName;
  twaConfig.packageId = packageId;

  fs.writeFileSync(twaPath, JSON.stringify(twaConfig, null, 2));
  console.log(`✓ Updated twa-manifest.json\n`);

  // Run bubblewrap init
  try {
    console.log(`🔄 Initializing Bubblewrap with manifest...\n`);
    execSync(`bubblewrap init --manifest=${manifestUrl}`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    console.log(`\n✓ Bubblewrap initialized successfully!\n`);
    console.log(`📁 Generated: android-pwa/\n`);

    // Build instructions
    console.log(`\n🚀 Next Steps:\n`);
    console.log(`1. Debug build (for testing):`);
    console.log(`   cd android-pwa && ./gradlew assembleDebug\n`);

    console.log(`2. Release build (for Play Store):`);
    console.log(`   ./gradlew bundleRelease \\`);
    console.log(`     -Pandroid.injected.signing.store.file=./sspl-release.jks \\`);
    console.log(`     -Pandroid.injected.signing.store.password=SSPLAndroid@2025 \\`);
    console.log(`     -Pandroid.injected.signing.key.alias=sspl_release \\`);
    console.log(`     -Pandroid.injected.signing.key.password=SSPLAndroid@2025\n`);

    console.log(`3. Upload to Google Play Store:`);
    console.log(`   app/build/outputs/bundle/release/app-release.aab\n`);
  } catch (error) {
    console.error(`\n❌ Bubblewrap initialization failed`);
    console.error(`Error: ${error.message}\n`);
    
    console.error(`Troubleshooting:\n`);
    console.error(`1. Verify domain is accessible: curl https://${domain}/manifest.json`);
    console.error(`2. Verify HTTPS certificate is valid`);
    console.error(`3. Verify manifest.json exists on the domain`);
    console.error(`4. Try again when domain is ready\n`);
    
    rl.close();
    process.exit(1);
  }

  rl.close();
}

// Run
initBubblewrap().catch(error => {
  console.error(`Error: ${error.message}`);
  rl.close();
  process.exit(1);
});
