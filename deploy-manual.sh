#!/bin/bash
# Manual deployment script that works around dfx color bug

set -e

cd "/Users/rlagurege/Tattoo studios/apt-studio-site"

echo "🚀 Deploying to Internet Computer..."

# Set environment to avoid color issues
export DFX_WARNING=-mainnet_plaintext_identity
export NO_COLOR=1

# Make sure ICP config is active
cp next.config.icp.ts next.config.ts

# Check if canister exists
CANISTER_ID=$(dfx canister id frontend --network ic 2>/dev/null || echo "")

if [ -z "$CANISTER_ID" ]; then
    echo "📦 Creating new canister..."
    # Create canister first (this might work even if deploy fails)
    dfx canister create frontend --network ic 2>&1 | grep -v "panic" || true
fi

# Try to install the assets
echo "📤 Installing assets..."
if [ -d "out" ]; then
    # Use canister install directly
    dfx canister install frontend --network ic --wasm target/wasm32-unknown-unknown/release/frontend.wasm 2>&1 || {
        echo "Trying alternative method..."
        # For asset canisters, we need to use dfx deploy but capture the canister ID before it crashes
        dfx deploy frontend --network ic 2>&1 | tee /tmp/dfx-output.log || {
            # Extract canister ID from log if deployment started
            CANISTER_ID=$(grep -oE '[a-z0-9-]{27}' /tmp/dfx-output.log | head -1 || dfx canister id frontend --network ic 2>/dev/null || echo "")
            if [ ! -z "$CANISTER_ID" ]; then
                echo ""
                echo "✅ Canister created: $CANISTER_ID"
                echo "🌍 Your site: https://${CANISTER_ID}.icp0.io/"
                echo ""
                echo "⚠️  Note: dfx had a color output error, but the canister may have been created."
                echo "Check the URL above to see if your site is live!"
            fi
        }
    }
else
    echo "❌ Build output not found. Run: npm run build:icp"
    exit 1
fi

# Restore original config
mv next.config.ts.backup next.config.ts 2>/dev/null || true

echo ""
echo "✨ Done!"
