# Quick Guide: Deploy to Internet Computer

## Step 1: Install DFX (One-time setup)

```bash
# macOS/Linux
sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"

# Or with Homebrew (macOS)
brew install dfinity/dfx/dfx

# Verify installation
dfx --version
```

## Step 2: Build Static Export

```bash
cd "/Users/rlagurege/Tattoo studios/apt-studio-site"
npm run build:icp
```

This will:
- Use the ICP-specific config
- Build a static export in the `out` folder
- Skip server-side features

## Step 3: Deploy Locally (Test First)

```bash
# Start local ICP network
dfx start --background

# Deploy to local network
dfx deploy

# Your site will be at:
# http://127.0.0.1:4943/?canisterId=<canister-id>
```

## Step 4: Deploy to Mainnet (Live)

```bash
# Make sure you have cycles (ICP tokens)
# Get your identity
dfx identity whoami

# Deploy to Internet Computer mainnet
dfx deploy --network ic

# Your site will be live at:
# https://<canister-id>.icp0.io/
```

## Quick Deploy Script

Or use the automated script:

```bash
# Local test
./scripts/deploy-icp.sh local

# Mainnet
./scripts/deploy-icp.sh ic
```

## What Works vs What Doesn't

### ✅ Will Work:
- Homepage
- About page
- Artists pages (static)
- Gallery (static images)
- All client-side React components
- CSS and styling

### ❌ Won't Work:
- Login/Authentication (needs backend)
- Dashboard pages (needs API)
- Appointment requests (needs API)
- Database features (needs backend)

## Troubleshooting

**Build fails?**
- Check for server-side code in pages
- Remove API route imports
- Make sure all pages are client-side only

**Can't connect to network?**
```bash
dfx start --clean
```

**Need cycles for mainnet?**
- Convert ICP tokens to cycles
- Or use the cycles faucet for testing

## Your Site URL

After deployment, you'll get a URL like:
```
https://<random-id>.icp0.io/
```

This is your permanent Internet Computer address!
