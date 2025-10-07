




#!/bin/bash

# Build APK for Curio Critters

cd src/frontend || exit
npm run build
npx cap sync
npx cap open android  # Open in Android Studio for final build
echo "Build complete. Generate APK in Android Studio."





