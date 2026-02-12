# Deploy to Internet Computer - Simple Steps

## ✅ DFX is Already Installed!

You have DFX installed at: `/Users/rlagurege/Library/Application Support/org.dfinity.dfx/bin/dfx`

## Quick Deploy (3 Steps)

### Step 1: Build Static Site
```bash
cd "/Users/rlagurege/Tattoo studios/apt-studio-site"
npm run build:icp
```

### Step 2: Deploy Locally (Test)
```bash
dfx start --background
dfx deploy
```

### Step 3: Deploy to Mainnet (Live)
```bash
dfx deploy --network ic
```

## What Gets Deployed

✅ **Will Work:**
- Homepage (`/`)
- About page (`/about`)
- Artists pages (`/artists`)
- Gallery (`/gallery`)
- All static content

❌ **Won't Work (Need Backend):**
- Login pages
- Dashboard pages  
- API calls
- Forms that submit data

## Your Site URL

After deployment, you'll get:
- **Local:** `http://127.0.0.1:4943/?canisterId=<id>`
- **Mainnet:** `https://<canister-id>.icp0.io/`

## Need Help?

Run the automated script:
```bash
./scripts/deploy-icp.sh ic
```

This handles everything automatically!
