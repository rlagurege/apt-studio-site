#!/bin/bash

# Deploy to Internet Computer
# Usage: ./scripts/deploy-icp.sh [local|ic]

set -e

NETWORK=${1:-local}

echo "🚀 Deploying to Internet Computer ($NETWORK network)..."

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    echo "❌ DFX not found. Please install it first:"
    echo "   sh -ci \"\$(curl -fsSL https://sdk.dfinity.org/install.sh)\""
    exit 1
fi

# Backup original next.config.ts
if [ ! -f "next.config.ts.backup" ]; then
    echo "📦 Backing up next.config.ts..."
    cp next.config.ts next.config.ts.backup
fi

# Use ICP config
echo "⚙️  Using ICP configuration..."
cp next.config.icp.ts next.config.ts

# Build static export
echo "🔨 Building static export..."
npm run build

if [ ! -d "out" ]; then
    echo "❌ Build failed - 'out' directory not found"
    exit 1
fi

# Deploy
if [ "$NETWORK" = "ic" ]; then
    echo "🌐 Deploying to mainnet..."
    dfx deploy --network ic
    echo ""
    echo "✅ Deployment complete!"
    echo "🌍 Your site is live on Internet Computer!"
else
    echo "🏠 Starting local network..."
    dfx start --background
    
    echo "🚀 Deploying to local network..."
    dfx deploy
    
    echo ""
    echo "✅ Deployment complete!"
    echo "📍 Access your site at: http://127.0.0.1:4943/?canisterId=$(dfx canister id frontend)"
fi

# Restore original config
echo "🔄 Restoring original next.config.ts..."
mv next.config.ts.backup next.config.ts

echo ""
echo "✨ Done!"
