#!/usr/bin/env node

/**
 * Robust Port Manager for Vite
 * Automatically finds available ports and manages Vite processes
 */

import { createServer } from 'net';
import { spawn, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Check if a port is available
 */
async function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Find available ports in a range
 */
async function findAvailablePorts(startPort, count = 5) {
  const availablePorts = [];
  const maxPort = startPort + 1000; // Prevent infinite loop
  
  for (let port = startPort; port < maxPort && availablePorts.length < count; port++) {
    if (await isPortAvailable(port)) {
      availablePorts.push(port);
    }
  }
  
  return availablePorts;
}

/**
 * Kill processes on specific ports
 */
async function killProcessesOnPorts(ports) {
  return new Promise((resolve) => {
    let completed = 0;
    const total = ports.length;
    
    if (total === 0) resolve();
    
    ports.forEach((port) => {
      const platform = process.platform;
      
      let command;
      if (platform === 'win32') {
        command = `netstat -ano | findstr :${port}`;
      } else {
        command = `lsof -ti:${port}`;
      }
      
      exec(command, (error, stdout) => {
        if (error) {
          console.log(`No process found on port ${port}`);
          completed++;
          if (completed === total) resolve();
          return;
        }
        
        const output = stdout.trim();
        if (!output) {
          completed++;
          if (completed === total) resolve();
          return;
        }
        
        if (platform === 'win32') {
          // Parse netstat output to get PID
          const lines = output.split('\n');
          lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 5 && parts[1].endsWith(`:${port}`)) {
              const pid = parts[4];
              if (pid && pid !== '0') {
                // Kill the process
                exec(`taskkill /PID ${pid} /F`, (killError) => {
                  if (killError) {
                    console.log(`Could not kill process ${pid} on port ${port}: ${killError.message}`);
                  } else {
                    console.log(`Killed process ${pid} on port ${port}`);
                  }
                  completed++;
                  if (completed === total) resolve();
                });
                return;
              }
            }
          });
        } else {
          // Unix-like systems
          const pids = output.split('\n').filter(line => line.trim());
          pids.forEach(pid => {
            exec(`kill -9 ${pid}`, (killError) => {
              if (killError) {
                console.log(`Could not kill process ${pid} on port ${port}: ${killError.message}`);
              } else {
                console.log(`Killed process ${pid} on port ${port}`);
              }
              completed++;
              if (completed === total) resolve();
            });
          });
        }
        
        // If no specific process found, increment completed
        if (platform === 'win32' && !output.includes(`:${port}`)) {
          completed++;
          if (completed === total) resolve();
        }
      });
    });
  });
}

/**
 * Main port management function
 */
async function managePorts() {
  console.log('🔍 Scanning for available ports...');
  
  // Check for Vite-related processes and clean them up
  const commonVitePorts = [4173, 4174, 5173, 5174, 3000, 3001];
  console.log('🧹 Cleaning up potential Vite processes...');
  await killProcessesOnPorts(commonVitePorts);
  
  // Find available ports starting from a high range (less likely to be used)
  const availablePorts = await findAvailablePorts(5000, 10);
  
  if (availablePorts.length === 0) {
    console.error('❌ No available ports found!');
    process.exit(1);
  }
  
  // Select the first available port
  const selectedPort = availablePorts[0];
  
  // Write port info to a file for other processes to read
  const portInfo = {
    port: selectedPort,
    availablePorts,
    timestamp: new Date().toISOString()
  };
  
  const portInfoPath = path.join(__dirname, '..', '.port-info.json');
  fs.writeFileSync(portInfoPath, JSON.stringify(portInfo, null, 2));
  
  console.log(`✅ Selected port: ${selectedPort}`);
  console.log(`📝 Port information saved to: ${portInfoPath}`);
  console.log(`🔧 Available ports: ${availablePorts.join(', ')}`);
  
  return selectedPort;
}

/**
 * Start Vite preview with automatic port management
 */
function startVitePreview() {
  const args = process.argv.slice(2);
  
  managePorts()
    .then(port => {
      console.log(`🚀 Starting Vite preview on port ${port}...`);
      
      const viteArgs = ['preview', '--port', port.toString(), ...args];
      const vite = spawn('npx', ['vite', ...viteArgs], {
        stdio: 'inherit',
        shell: true
      });
      
      vite.on('error', (error) => {
        console.error('❌ Failed to start Vite:', error);
        process.exit(1);
      });
      
      vite.on('exit', (code) => {
        console.log(`Vite preview exited with code ${code}`);
        // Clean up port info file
        const portInfoPath = path.join(__dirname, '..', '.port-info.json');
        if (fs.existsSync(portInfoPath)) {
          fs.unlinkSync(portInfoPath);
        }
        process.exit(code);
      });
      
      // Handle cleanup on exit
      process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down...');
        vite.kill('SIGINT');
      });
      
      process.on('SIGTERM', () => {
        vite.kill('SIGTERM');
      });
    })
    .catch(error => {
      console.error('❌ Port management failed:', error);
      process.exit(1);
    });
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  if (process.argv.includes('--start')) {
    startVitePreview();
  } else {
    managePorts().then(port => {
      console.log(`Port manager completed. Selected port: ${port}`);
    });
  }
}

export {
  isPortAvailable,
  findAvailablePorts,
  killProcessesOnPorts,
  managePorts
};