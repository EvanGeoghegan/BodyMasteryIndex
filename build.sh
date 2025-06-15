#!/bin/bash

echo "Starting build process..."

# Clean previous build
rm -rf dist

# Build frontend with Vite
echo "Building frontend..."
npx vite build

# Build backend with esbuild
echo "Building backend..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Move files from dist/public to dist for deployment compatibility
if [ -d "dist/public" ]; then
    echo "Moving files for deployment..."
    
    # Move all files from dist/public to dist root
    mv dist/public/* dist/ 2>/dev/null || true
    
    # Remove empty public directory
    rmdir dist/public 2>/dev/null || true
    
    echo "✅ Files moved successfully for static deployment"
    echo "📁 Build complete - files are in dist/"
else
    echo "ℹ️ No dist/public directory found - build output is already in correct location"
fi

echo "Build process completed!"