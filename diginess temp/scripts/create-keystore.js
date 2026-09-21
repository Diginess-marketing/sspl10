#!/usr/bin/env node

/**
 * SSPL Android Keystore Generation Script (Node.js)
 * 
 * This script creates a signing keystore for Android app publishing.
 * Cross-platform: Works on Windows, macOS, and Linux
 * 
 * Usage: node scripts/create-keystore.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Colors for output
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
  section: (msg) => console.log(`\n${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}\n${colors.blue}${msg}${colors.reset}\n${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}\n`),
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Promisified question function
 */
function question(query, isPassword = false) {
  return new Promise((resolve) => {
    if (isPassword) {
      // Hide password input
      process.stdout.write(query);
      process.stdin.setRawMode(true);
      let password = '';
      process.stdin.on('data', (char) => {
        if (char === '\n' || char === '\r' || char === '\u0004') {
          process.stdin.setRawMode(false);
          process.stdout.write('\n');
          resolve(password);
        } else if (char === '\u0003') {
          process.exit();
        } else if (char === '\u007f' || char === '\b') {
          password = password.slice(0, -1);
        } else {
          password += char;
        }
      });
    } else {
      rl.question(query, (answer) => {
        resolve(answer);
      });
    }
  });
}

/**
 * Check if keytool is available
 */
function checkKeytool() {
  try {
    execSync('keytool -version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Generate keystore
 */
async function generateKeystore() {
  log.section('SSPL Android Keystore Generation Script');

  // Check Java
  if (!checkKeytool()) {
    log.error('keytool not found!');
    console.log('\nJava Development Kit (JDK) 11+ must be installed.');
    console.log('\nInstall from:');
    console.log('  Windows: https://adoptium.net/');
    console.log('  macOS:   brew install temurin11');
    console.log('  Linux:   sudo apt-get install openjdk-11-jdk\n');
    process.exit(1);
  }

  // Create android directory
  const androidDir = path.join(process.cwd(), 'android');
  if (!fs.existsSync(androidDir)) {
    fs.mkdirSync(androidDir, { recursive: true });
    log.info(`Created directory: ${androidDir}`);
  }

  const keystorePath = path.join(androidDir, 'sspl-release.jks');

  // Check if keystore exists
  if (fs.existsSync(keystorePath)) {
    log.warn(`Keystore already exists at: ${keystorePath}`);
    const overwrite = await question('\nOverwrite existing keystore? (yes/no): ');
    if (!overwrite.toLowerCase().startsWith('y')) {
      log.info('Keystore creation cancelled.');
      rl.close();
      process.exit(0);
    }
  }

  console.log('\n');

  // Get keystore password
  let keystorePassword = '';
  let passwordConfirm = '';
  
  while (!keystorePassword || keystorePassword.length < 6) {
    keystorePassword = await question('Enter keystore password (min 6 chars, strong password recommended): ', true);
    if (keystorePassword.length < 6) {
      log.warn('Password must be at least 6 characters long.');
    }
  }

  while (passwordConfirm !== keystorePassword) {
    passwordConfirm = await question('Confirm keystore password: ', true);
    if (passwordConfirm !== keystorePassword) {
      log.error('Passwords do not match!');
    }
  }

  console.log('\n');

  const keyPassword = keystorePassword;

  // Get personal information
  console.log(`${colors.blue}Personal Information (required for certificate):${colors.reset}\n`);

  const firstName = await question('First name: ');
  const lastName = await question('Last name: ');
  const orgUnit = await question('Organization unit (default: Dev): ') || 'Dev';
  const orgName = await question('Organization name (default: SSPL): ') || 'SSPL';
  const city = await question('City (default: Unknown): ') || 'Unknown';
  const state = await question('State (default: Unknown): ') || 'Unknown';
  const country = await question('Country code (e.g., IN): ');

  // Validate inputs
  if (!firstName.trim()) {
    log.error('First name is required!');
    rl.close();
    process.exit(1);
  }

  if (!lastName.trim()) {
    log.error('Last name is required!');
    rl.close();
    process.exit(1);
  }

  if (!country.trim()) {
    log.error('Country code is required!');
    rl.close();
    process.exit(1);
  }

  console.log('\n');
  log.info(`Creating keystore at: ${keystorePath}`);
  console.log(`  Name: ${firstName} ${lastName}`);
  console.log(`  Organization: ${orgName}`);
  console.log(`  Country: ${country}\n`);

  // Build distinguished name for Windows/Unix compatibility
  const dname = `CN=${firstName} ${lastName},OU=${orgUnit},O=${orgName},L=${city},ST=${state},C=${country}`;

  try {
    // Generate keystore
    execSync(
      `keytool -genkey -v -keystore "${keystorePath}" -keyalg RSA -keysize 2048 -validity 10000 -alias sspl_release -storepass "${keystorePassword}" -keypass "${keyPassword}" -dname "${dname}"`,
      { stdio: 'inherit' }
    );

    console.log('\n');
    log.success('Keystore created successfully!');

    console.log(`\n${colors.blue}Keystore Information:${colors.reset}`);
    console.log(`  Path: ${keystorePath}`);
    console.log(`  Alias: sspl_release\n`);

    // Verify keystore
    log.info('Verifying keystore...\n');
    execSync(
      `keytool -list -v -keystore "${keystorePath}" -storepass "${keystorePassword}" -alias sspl_release`,
      { stdio: 'inherit' }
    );

    console.log('\n');
    log.success('Keystore verification successful!');

    // Security notes
    console.log(`\n${colors.yellow}════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.yellow}⚠ IMPORTANT SECURITY NOTES:${colors.reset}`);
    console.log(`${colors.yellow}════════════════════════════════════════════════════════════${colors.reset}\n`);

    console.log('1. BACKUP YOUR KEYSTORE');
    console.log(`   Keep a copy of: ${keystorePath}`);
    console.log('   Store in a safe location (encrypted drive, cloud safe, etc.)\n');

    console.log('2. SAVE YOUR PASSWORDS');
    console.log('   You will need these for every build:');
    console.log(`   - Keystore password: ${keystorePassword}`);
    console.log('   - Key alias: sspl_release\n');

    console.log('3. NEVER COMMIT TO GIT');
    console.log('   Add to .gitignore:');
    console.log('   - android/*.jks\n');

    console.log('4. LOSING THE KEYSTORE = UNABLE TO UPDATE APP');
    console.log('   This keystore is required for all future updates');
    console.log('   If lost, you cannot update your app on Play Store\n');

    // Update .gitignore
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
      if (!gitignoreContent.includes('*.jks')) {
        fs.appendFileSync(gitignorePath, '\n# Android keystore (NEVER commit!)\nandroid/*.jks\nandroid/sspl-release.jks\n');
        log.success('Added keystore pattern to .gitignore');
      }
    }

    console.log(`\n${colors.green}════════════════════════════════════════════════════════════${colors.reset}`);
    log.success('Keystore creation complete!');
    console.log(`${colors.green}════════════════════════════════════════════════════════════${colors.reset}\n`);

    console.log('Next steps:');
    console.log('1. Back up the keystore file');
    console.log('2. Save your passwords securely');
    console.log('3. Use this keystore to sign all future builds\n');

    rl.close();
    process.exit(0);
  } catch (error) {
    log.error(`Failed to create keystore: ${error.message}`);
    rl.close();
    process.exit(1);
  }
}

// Run the script
generateKeystore().catch((error) => {
  log.error(`Unexpected error: ${error.message}`);
  rl.close();
  process.exit(1);
});
