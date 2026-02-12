# 🚀 Final Steps to Deploy to Internet Computer

## ✅ Build Complete!

Your static site is built successfully with **283 files** ready in the `out/` directory!

## 🔐 Step 1: Set Up Secure Identity

DFX requires a secure identity for mainnet deployment. Choose one:

### Option A: Create New Secure Identity (Recommended)
```bash
dfx identity new icp-deploy --storage-mode password-protected
dfx identity use icp-deploy
```

### Option B: Use Default Identity (Quick but Less Secure)
```bash
export DFX_WARNING=-mainnet_plaintext_identity
```

## 🚀 Step 2: Deploy

```bash
cd "/Users/rlagurege/Tattoo studios/apt-studio-site"

# Make sure ICP config is active
cp next.config.icp.ts next.config.ts

# Deploy to Internet Computer
dfx deploy --network ic
```

## 📍 Step 3: Get Your URL

After deployment, you'll see output like:
```
Deployed canisters.
URLs:
  Frontend canister via browser
    frontend: https://<canister-id>.icp0.io/
```

**That's your live website URL!**

## 💰 Step 4: Ensure You Have Cycles

You need cycles (converted from ICP tokens) to deploy. If you don't have cycles:

1. Get ICP tokens
2. Convert to cycles: `dfx ledger top-up <canister-id> --amount <icp-amount>`
3. Or use cycles faucet for testing

## 🎉 Success!

Once deployed, your website will be live at:
```
https://<canister-id>.icp0.io/
```

## 🔄 Restore Backend Code

Your backend code is backed up in `.backup-for-icp/`. To restore:
```bash
mv .backup-for-icp/admin src/app/
mv .backup-for-icp/artist src/app/
mv .backup-for-icp/appointments src/app/
mv .backup-for-icp/api src/app/
```

## 📝 Quick Deploy Command

```bash
export DFX_WARNING=-mainnet_plaintext_identity
cd "/Users/rlagurege/Tattoo studios/apt-studio-site"
cp next.config.icp.ts next.config.ts
dfx deploy --network ic
```

Your site is ready! Just run the deploy command above! 🎊
