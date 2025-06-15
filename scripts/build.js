#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This script moves files from dist/public to dist root for deployment compatibility
const distPublicPath = path.resolve(__dirname, '..', 'dist', 'public');
const distPath = path.resolve(__dirname, '..', 'dist');

console.log('Post-build: Moving files for deployment...');

if (fs.existsSync(distPublicPath)) {
  // Read all files in dist/public
  const files = fs.readdirSync(distPublicPath);
  
  // Move each file to dist root
  files.forEach(file => {
    const srcPath = path.join(distPublicPath, file);
    const destPath = path.join(distPath, file);
    
    // Skip if file already exists in dest to avoid conflicts
    if (fs.existsSync(destPath)) {
      fs.rmSync(destPath, { recursive: true, force: true });
    }
    
    // If it's a directory, copy recursively
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
  
  // Remove the public directory
  fs.rmSync(distPublicPath, { recursive: true, force: true });
  
  console.log('✅ Files moved successfully for static deployment');
  console.log(`📁 Static files are now in: ${distPath}`);
} else {
  console.log('ℹ️  No dist/public directory found - assuming correct build output location');
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}