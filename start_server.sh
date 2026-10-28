#!/bin/bash
# SSLCommerz KAM Portal Dev Server Launcher

echo "========================================================="
echo "   🚀 Starting SSLCommerz KAM Portal Development Server   "
echo "========================================================="

# 1. Load NVM environment if it exists
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    echo "Sourcing NVM..."
    . "$NVM_DIR/nvm.sh"
    nvm use 22 2>/dev/null || nvm use default 2>/dev/null
else
    echo "NVM not found in standard home path, using system Node..."
fi

# 2. Print current Node version
node -v 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ Error: Node.js is not installed or not in the PATH."
    exit 1
fi

# 3. Run environment preparation
echo "---------------------------------------------------------"
echo "1. Preparing environment configs..."
node scripts/prepare-env.mjs uat

# 4. Boot server
echo "---------------------------------------------------------"
echo "2. Booting local Vite server..."
npm run dev || npx vite
