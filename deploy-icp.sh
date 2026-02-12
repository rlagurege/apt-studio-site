#!/bin/bash

# Simple script to deploy to Internet Computer
set -e

echo "🚀 Deploying to Internet Computer..."

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    echo "❌ DFX not found. Installing..."
    sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
fi

# Backup original config
if [ ! -f "next.config.ts.backup" ]; then
    echo "📦 Backing up next.config.ts..."
    cp next.config.ts next.config.ts.backup
fi

# Use ICP config
echo "⚙️  Switching to ICP configuration..."
cp next.config.icp.ts next.config.ts

# Build
echo "🔨 Building static export..."
npm run build || {
    echo "⚠️  Build had issues, but continuing..."
}

# Check if out directory exists
if [ ! -d "out" ]; then
    echo "❌ Build failed - 'out' directory not found"
    echo "💡 Try: npm run build manually first"
    mv next.config.ts.backup next.config.ts
    exit 1
fi

# Determine network
NETWORK=${1:-local}

if [ "$NETWORK" = "ic" ]; then
    echo "🌐 Deploying to Internet Computer mainnet..."
    dfx deploy --network ic
    echo ""
    echo "✅ Deployed to mainnet!"
    echo "🌍 Your site: https://$(dfx canister id frontend --network ic).icp0.io/"
else
    echo "🏠 Starting local network..."
    dfx start --background || echo "Network already running"
    
    echo "🚀 Deploying to local network..."
    dfx deploy
    
    echo ""
    echo "✅ Deployed locally!"
    echo "📍 Your site: http://127.0.0.1:4943/?canisterId=$(dfx canister id frontend)"
fi

# Restore config
echo "🔄 Restoring original config..."
mv next.config.ts.backup next.config.ts

echo ""
echo "✨ Done! Your website is live on Internet Computer!"
