#!/usr/bin/env node

/**
 * Build Performance Tracker for SSPL
 *
 * This script tracks build performance metrics and integrates with the deployment monitoring system.
 * Run this script as part of your build process to collect build metrics.
 *
 * Usage:
 *   node build-tracker.js [build-command]
 *
 * Example:
 *   node build-tracker.js "npm run build"
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find the correct base directory by looking for package.json
function findBaseDirectory(startDir) {
  let currentDir = path.resolve(startDir);

  // Handle server environment with nested httpdocs directories
  // Server path: /var/www/vhosts/ssplt10.cloud/httpdocs_live/httpdocs/httpdocs
  // Should be:   /var/www/vhosts/ssplt10.cloud/httpdocs_live/httpdocs

  // First, check if we're in a nested httpdocs structure
  const dirNames = currentDir.split(path.sep);
  const httpdocsCount = dirNames.filter(name => name === 'httpdocs').length;

  if (httpdocsCount > 1) {
    // We're in a nested structure, go up to find the correct level
    const httpdocsIndices = dirNames.map((name, index) => name === 'httpdocs' ? index : -1).filter(index => index !== -1);

    if (httpdocsIndices.length >= 2) {
      // Use the second-to-last httpdocs directory as the base
      const targetIndex = httpdocsIndices[httpdocsIndices.length - 2];
      currentDir = dirNames.slice(0, targetIndex + 1).join(path.sep);
    }
  }

  // Try up to 5 levels up to find package.json from the corrected directory
  let searchDir = currentDir;
  for (let i = 0; i < 5; i++) {
    if (fs.existsSync(path.join(searchDir, 'package.json'))) {
      return searchDir;
    }
    const parentDir = path.dirname(searchDir);
    if (parentDir === searchDir) break; // reached root
    searchDir = parentDir;
  }

  // If still not found, look specifically for httpdocs directory with package.json
  searchDir = currentDir;
  for (let i = 0; i < 5; i++) {
    if (path.basename(searchDir) === 'httpdocs' && fs.existsSync(path.join(searchDir, 'package.json'))) {
      return searchDir;
    }
    const parentDir = path.dirname(searchDir);
    if (parentDir === searchDir) break; // reached root
    searchDir = parentDir;
  }

  // Final fallback - use current working directory
  return process.cwd();
}

const baseDir = findBaseDirectory(__dirname);

// Debug logging for troubleshooting
console.log(`🔍 Build Tracker Debug:`);
console.log(`  __dirname: ${__dirname}`);
console.log(`  process.cwd(): ${process.cwd()}`);
console.log(`  baseDir: ${baseDir}`);
console.log(`  package.json exists in baseDir: ${fs.existsSync(path.join(baseDir, 'package.json'))}`);

class BuildTracker {
  constructor() {
    this.startTime = Date.now();
    this.buildId = `build-${Date.now()}`;
    this.metrics = {
      buildId: this.buildId,
      timestamp: new Date().toISOString(),
      duration: 0,
      status: 'running',
      bundleSize: 0,
      chunkCount: 0,
      assetCount: 0,
      warnings: [],
      errors: [],
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    };
  }

  // Execute build command and track metrics
  async runBuild(buildCommand) {
    console.log(`🚀 Starting build: ${this.buildId}`);
    console.log(`📊 Tracking build performance...`);

    try {
      // Execute the build command
      const output = execSync(buildCommand, {
        cwd: baseDir,
        encoding: 'utf8',
        stdio: 'inherit', // Show build output in real-time
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      });

      this.metrics.duration = Date.now() - this.startTime;
      this.metrics.status = 'success';

      // Parse build output for warnings and errors
      this.parseBuildOutput(output);

      // Analyze build artifacts
      await this.analyzeBuildArtifacts();

      console.log(`✅ Build completed successfully in ${this.metrics.duration}ms`);

    } catch (error) {
      this.metrics.duration = Date.now() - this.startTime;
      this.metrics.status = 'failed';

      // Parse error output
      if (error.stdout) {
        this.parseBuildOutput(error.stdout);
      }
      if (error.stderr) {
        this.parseBuildOutput(error.stderr);
      }

      // Add the main error
      this.metrics.errors.push(error.message);

      console.error(`❌ Build failed after ${this.metrics.duration}ms`);
      console.error(`Error: ${error.message}`);

      // Still save metrics even on failure
      this.saveMetrics();

      // Exit with error code
      process.exit(1);
    }

    // Save metrics
    this.saveMetrics();

    // Report metrics
    this.reportMetrics();
  }

  // Parse build output for warnings and errors
  parseBuildOutput(output) {
    const lines = output.split('\n');

    for (const line of lines) {
      // Check for warnings
      if (line.includes('warning') || line.includes('Warning')) {
        this.metrics.warnings.push(line.trim());
      }

      // Check for errors
      if (line.includes('error') || line.includes('Error') || line.includes('ERROR')) {
        this.metrics.errors.push(line.trim());
      }

      // Parse bundle size information (Vite specific)
      if (line.includes('dist/index.html') && line.includes('kb')) {
        const sizeMatch = line.match(/(\d+(?:\.\d+)?)\s*kb/);
        if (sizeMatch) {
          this.metrics.bundleSize = parseFloat(sizeMatch[1]) * 1024; // Convert to bytes
        }
      }

      // Parse chunk information
      if (line.includes('chunk') && line.includes('.js')) {
        this.metrics.chunkCount++;
      }
    }
  }

  // Analyze build artifacts
  async analyzeBuildArtifacts() {
    const distDir = path.join(baseDir, 'dist');

    try {
      if (fs.existsSync(distDir)) {
        const files = this.getAllFiles(distDir);
        this.metrics.assetCount = files.length;

        // Calculate total bundle size
        let totalSize = 0;
        for (const file of files) {
          const stats = fs.statSync(file);
          totalSize += stats.size;
        }
        this.metrics.bundleSize = totalSize;

        console.log(`📦 Build artifacts: ${this.metrics.assetCount} files, ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
      }
    } catch (error) {
      console.warn(`⚠️  Could not analyze build artifacts: ${error.message}`);
    }
  }

  // Get all files in directory recursively
  getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      if (fs.statSync(fullPath).isDirectory()) {
        arrayOfFiles = this.getAllFiles(fullPath, arrayOfFiles);
      } else {
        arrayOfFiles.push(fullPath);
      }
    }

    return arrayOfFiles;
  }

  // Save metrics to file and send to monitoring system
  saveMetrics() {
    try {
      // Save to local file
      const metricsDir = path.join(__dirname, 'logs');
      if (!fs.existsSync(metricsDir)) {
        fs.mkdirSync(metricsDir, { recursive: true });
      }

      const metricsFile = path.join(metricsDir, `build-${this.buildId}.json`);
      fs.writeFileSync(metricsFile, JSON.stringify(this.metrics, null, 2));

      // Also save to localStorage-like file for the frontend
      const storageFile = path.join(baseDir, 'src', 'utils', 'build-metrics-storage.json');
      let existingMetrics = [];
      if (fs.existsSync(storageFile)) {
        try {
          existingMetrics = JSON.parse(fs.readFileSync(storageFile, 'utf8'));
        } catch (e) {
          existingMetrics = [];
        }
      }

      existingMetrics.push(this.metrics);

      // Keep only last 100 builds
      if (existingMetrics.length > 100) {
        existingMetrics = existingMetrics.slice(-100);
      }

      fs.writeFileSync(storageFile, JSON.stringify(existingMetrics, null, 2));

      console.log(`💾 Build metrics saved to ${metricsFile}`);

    } catch (error) {
      console.error(`❌ Failed to save build metrics: ${error.message}`);
    }
  }

  // Report metrics to console
  reportMetrics() {
    console.log('\n📊 Build Performance Report');
    console.log('=' .repeat(40));
    console.log(`Build ID: ${this.metrics.buildId}`);
    console.log(`Duration: ${this.metrics.duration}ms`);
    console.log(`Status: ${this.metrics.status}`);
    console.log(`Bundle Size: ${(this.metrics.bundleSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Assets: ${this.metrics.assetCount}`);
    console.log(`Chunks: ${this.metrics.chunkCount}`);
    console.log(`Warnings: ${this.metrics.warnings.length}`);
    console.log(`Errors: ${this.metrics.errors.length}`);
    console.log(`Node Version: ${this.metrics.nodeVersion}`);
    console.log(`Platform: ${this.metrics.platform}-${this.metrics.arch}`);

    if (this.metrics.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.metrics.warnings.slice(0, 5).forEach(warning => {
        console.log(`  - ${warning}`);
      });
      if (this.metrics.warnings.length > 5) {
        console.log(`  ... and ${this.metrics.warnings.length - 5} more`);
      }
    }

    if (this.metrics.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.metrics.errors.slice(0, 5).forEach(error => {
        console.log(`  - ${error}`);
      });
      if (this.metrics.errors.length > 5) {
        console.log(`  ... and ${this.metrics.errors.length - 5} more`);
      }
    }

    console.log('=' .repeat(40));
  }

  // Compare with previous builds
  compareWithPrevious() {
    try {
      const storageFile = path.join(baseDir, 'src', 'utils', 'build-metrics-storage.json');
      if (fs.existsSync(storageFile)) {
        const existingMetrics = JSON.parse(fs.readFileSync(storageFile, 'utf8'));
        const previousBuilds = existingMetrics.filter(m => m.buildId !== this.metrics.buildId);

        if (previousBuilds.length > 0) {
          const lastBuild = previousBuilds[previousBuilds.length - 1];

          console.log('\n📈 Comparison with last build:');
          console.log(`Duration: ${this.metrics.duration}ms vs ${lastBuild.duration}ms (${this.metrics.duration > lastBuild.duration ? 'slower' : 'faster'})`);
          console.log(`Bundle Size: ${(this.metrics.bundleSize / 1024 / 1024).toFixed(2)} MB vs ${(lastBuild.bundleSize / 1024 / 1024).toFixed(2)} MB`);
          console.log(`Warnings: ${this.metrics.warnings.length} vs ${lastBuild.warnings.length}`);
          console.log(`Errors: ${this.metrics.errors.length} vs ${lastBuild.errors.length}`);
        }
      }
    } catch (error) {
      // Ignore comparison errors
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('❌ Usage: node build-tracker.js "build-command"');
    console.error('Example: node build-tracker.js "npm run build"');
    process.exit(1);
  }

  const buildCommand = args.join(' ');
  const tracker = new BuildTracker();

  try {
    await tracker.runBuild(buildCommand);
    tracker.compareWithPrevious();
  } catch (error) {
    console.error(`❌ Build tracking failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default BuildTracker;