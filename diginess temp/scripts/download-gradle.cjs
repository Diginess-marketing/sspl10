#!/usr/bin/env node

/**
 * Download Gradle wrapper JAR and setup proper build environment
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const androidPwaDir = 'd:\\ssplt10.cloud-prod-sync-20251006\\httpdocs\\android-pwa';
const wrapperDir = path.join(androidPwaDir, 'gradle', 'wrapper');

console.log('Setting up Gradle build environment...\n');

// Ensure directories exist
if (!fs.existsSync(wrapperDir)) {
    fs.mkdirSync(wrapperDir, { recursive: true });
    console.log('✓ Created gradle/wrapper directory');
}

// Function to download file
function downloadFile(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => reject(err));
        });
    });
}

// Download gradle-wrapper.jar directly
const jarUrl = 'https://repo.gradle.org/gradle/gradle-distributions/gradle-8.4-all/gradle-8.4/lib/gradle-wrapper.jar';
const jarPath = path.join(wrapperDir, 'gradle-wrapper.jar');

console.log('Downloading gradle-wrapper.jar...');
console.log(`URL: ${jarUrl}`);
console.log(`Destination: ${jarPath}\n`);

downloadFile(jarUrl, jarPath)
    .then(() => {
        console.log('✓ Downloaded gradle-wrapper.jar successfully');
        console.log(`\nFile size: ${(fs.statSync(jarPath).size / 1024 / 1024).toFixed(2)} MB`);
        console.log('\n✅ Gradle setup complete! Ready to build.\n');
        console.log('Next steps:');
        console.log(`  cd ${androidPwaDir}`);
        console.log('  .\\gradlew.bat assembleDebug\n');
    })
    .catch(err => {
        console.error('❌ Error downloading gradle-wrapper.jar:', err.message);
        process.exit(1);
    });
