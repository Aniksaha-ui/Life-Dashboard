#!/bin/bash
# ----------------------------------------------------------------------
# SSLCommerz KAM Portal Double-Click Launcher for macOS
# ----------------------------------------------------------------------

# Ensure the script runs in the directory where it's located
cd "$(dirname "$0")"

# Visual layout header
clear
echo "======================================================================"
echo "      🚀 SSLCOMMERZ KEY ACCOUNT MANAGEMENT (KAM) PORTAL DEV SERVER     "
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

# 3. Run Pre-Compile Environment Config Handler
echo "----------------------------------------------------------------------"
echo "🛠️ 1. Preparing Environment Configurations (UAT)..."
node scripts/prepare-env.mjs uat

# 4. Spin up the Vite Dev Server
echo "----------------------------------------------------------------------"
echo "🚀 2. Booting local Vite development server..."
echo "----------------------------------------------------------------------"
npx vite --port 5173 --host 127.0.0.1
