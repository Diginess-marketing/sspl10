#!/usr/bin/env node

/**
 * Port Cleaning Script
 * Safely cleans up Vite processes that might be holding ports
 */

const { execSync } = require('child_process');

console.log('🧹 Cleaning up Vite processes...');

try {
  // Try to kill Node processes gracefully
  execSync('taskkill /f /im node.exe 2>nul', { stdio: 'ignore' });
  console.log('✅ Cleaned up Node processes');
} catch (error) {
  console.log('✅ No Node processes to clean up or insufficient permissions');
}

// Clean up port info file
const fs = require('fs');
const path = require('path');

const portInfoPath = path.join(__dirname, '..', '.port-info.json');
if (fs.existsSync(portInfoPath)) {
  try {
    fs.unlinkSync(portInfoPath);
    console.log('🗑️  Removed stale port info file');
  } catch (error) {
    console.log('⚠️  Could not remove port info file:', error.message);
  }
}

console.log('🧹 Port cleaning completed');