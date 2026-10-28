#!/bin/bash
# ----------------------------------------------------------------------
# SSLCommerz KAM Portal Production Builder for macOS
# ----------------------------------------------------------------------

# Ensure the script runs in the directory where it's located
cd "$(dirname "$0")"

# Visual layout header
clear
echo "======================================================================"
echo "    📦 SSLCOMMERZ KEY ACCOUNT MANAGEMENT (KAM) PORTAL PRODUCTION BUILD"
echo "======================================================================"
echo ""

# 1. Load NVM if present to restore local node versions
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    echo "⚡ Sourcing NVM environment..."
    . "$NVM_DIR/nvm.sh"
    echo "⚙️ Setting up Node v22..."
    nvm use 22 2>/dev/null || nvm use default 2>/dev/null
else
    echo "⚠️ NVM not found, attempting system Node..."
fi

# 2. Assert Node executable is present
node -v 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ Error: Node.js is not installed on this terminal path."
    echo "Please download Node.js from https://nodejs.org or install NVM."
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

# 3. Clean any cached build artifacts
echo "----------------------------------------------------------------------"
echo "🧹 1. Cleaning old build artifacts..."
rm -rf build
rm -rf node_modules/.vite-temp

# 4. Run Pre-Compile Environment Config Handler for Build (UAT)
echo "----------------------------------------------------------------------"
echo "🛠️ 2. Preparing Environment Configurations (UAT Build)..."
node scripts/prepare-env.mjs uat-build

# 5. Compile Vite Production Build
echo "----------------------------------------------------------------------"
echo "🚀 3. Compiling all pages and features (Vite Build)..."
npx vite build --configLoader native

if [ $? -ne 0 ]; then
    echo "❌ Vite Build compilation failed."
    read -p "Press Enter to exit..."
    exit 1
fi

# 6. Export build to sibling output directory
echo "----------------------------------------------------------------------"
echo "📦 4. Exporting build artifacts to ssl_commerz_kam_admin-build..."
node scripts/export-build.mjs uat

if [ $? -ne 0 ]; then
    echo "❌ Export build script failed."
    read -p "Press Enter to exit..."
    exit 1
fi

echo "======================================================================"
echo "🎉 Build generated successfully!"
echo "📍 Location: ../ssl_commerz_kam_admin-build"
echo "======================================================================"
echo ""
read -p "Press Enter to close..."
