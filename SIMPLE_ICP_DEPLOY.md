# Simple Internet Computer Deployment

## 🎯 Quick Deploy (2 Commands)

### Option 1: Use the Script (Easiest)

```bash
# Deploy to mainnet (live)
./deploy-icp.sh ic

# Or deploy locally first to test
./deploy-icp.sh local
```

### Option 2: Manual Steps

```bash
# 1. Build static export
cp next.config.icp.ts next.config.ts
npm run build

# 2. Deploy
dfx deploy --network ic
```

## 📍 Your Website URL

After deployment, you'll get a URL like:
```
https://<canister-id>.icp0.io/
```

This is your permanent Internet Computer address!

## ✅ What Works

- Homepage
- About page  
- Artists pages
- Gallery
- All static content

## ⚠️ What Needs Backend

- Login/Authentication
- Dashboard pages
- Forms that submit data
- API calls

## 🔧 Troubleshooting

**Build fails?**
- Some pages use API routes - that's okay, they just won't work
- Static pages will still deploy

**Need cycles?**
- Convert ICP tokens to cycles
- Or use cycles faucet for testing

**dfx not found?**
```bash
sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
```

## 🎉 That's It!

Your website will be live on Internet Computer's decentralized network!
