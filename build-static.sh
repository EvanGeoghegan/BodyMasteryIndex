#!/bin/bash

echo "Building standalone static app..."

# Clean previous build
rm -rf dist

# Build static app with the new config
echo "Building frontend for static deployment..."
npx vite build --config vite.static.config.ts

# Verify build output
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "✅ Static build completed successfully!"
    echo "📁 Files ready for deployment in dist/"
    ls -la dist/
else
    echo "❌ Build failed - no dist/index.html found"
    exit 1
fi

echo "🚀 Ready for static deployment!"