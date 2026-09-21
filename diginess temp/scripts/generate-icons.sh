#!/bin/bash
# Icon Generation Guide for PWA - Manual Steps

# This file provides instructions for generating PWA icons using online tools
# since ImageMagick may not be available in all environments

echo "🎨 SSPL T10 PWA Icon Generation Guide"
echo "======================================"
echo ""
echo "You need to generate the following icon sizes from your logo (public/ssplt10-logo.png):"
echo ""

# Define required icons
icons=(
  "192x192 - Standard Android home screen"
  "192x192-maskable - Adaptive icon for Android 12+"
  "384x384 - High-res tablet"
  "384x384-maskable - Adaptive icon for tablets"
  "512x512 - High-res display"
  "512x512-maskable - Adaptive high-res"
  "96x96 - App shortcuts"
)

for icon in "${icons[@]}"; do
  echo "  ✓ $icon"
done

echo ""
echo "📝 Recommended Tools:"
echo "  1. Squoosh (online): https://squoosh.app"
echo "  2. Photoshop / GIMP (desktop)"
echo "  3. Figma (online): https://figma.com"
echo "  4. CloudConvert: https://cloudconvert.com"
echo ""

echo "📋 Steps to generate maskable icons:"
echo "  1. Create a new image with padding (transparent area around logo)"
echo "  2. Place your logo in the center"
echo "  3. Ensure safe zone: content within center 40% of image"
echo "  4. Export as PNG with transparency"
echo ""

echo "💾 Save icons to: httpdocs/public/"
echo "  - icon-192x192.png"
echo "  - icon-192x192-maskable.png"
echo "  - icon-384x384.png"
echo "  - icon-384x384-maskable.png"
echo "  - icon-512x512.png"
echo "  - icon-512x512-maskable.png"
echo "  - icon-96x96.png"
echo ""

echo "📸 Screenshots for Play Store/App Store:"
echo "  - screenshot-1-small.png (540x720)"
echo "  - screenshot-1-large.png (1280x720)"
echo "  - screenshot-2-small.png (540x720)"
echo "  - screenshot-2-large.png (1280x720)"
echo ""

echo "✅ After generating icons, run: npm run build"
