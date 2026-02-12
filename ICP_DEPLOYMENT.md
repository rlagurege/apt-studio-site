# Deploying to Internet Computer (ICP)

## ⚠️ Important Limitations

Your app currently uses **server-side features** that won't work on ICP frontend canisters:
- ❌ API Routes (`/api/*`) - Need separate backend canisters
- ❌ NextAuth server-side sessions - Need backend canister
- ❌ Prisma database connections - Need backend canister
- ❌ Server-side rendering (SSR) - Only static export supported
- ❌ `getServerSideProps` - Not supported

**What WILL work:**
- ✅ Static pages (Home, About, Gallery, Artists)
- ✅ Client-side React components
- ✅ Static assets (images, fonts, CSS)

## Option 1: Static Frontend Only (Quick Start)

This deploys only the public-facing pages without backend functionality.

### Step 1: Install DFX (Internet Computer SDK)

```bash
# macOS
sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"

# Or use Homebrew
brew install dfinity/dfx/dfx

# Verify installation
dfx --version
```

### Step 2: Configure Next.js for Static Export

Update `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Enable static export
  images: {
    unoptimized: true, // Required for static export
  },
  // Remove server-side features
  // Remove API routes references
  // Remove middleware (or make it client-only)
};

export default nextConfig;
```

### Step 3: Create dfx.json Configuration

Create `dfx.json` in your project root:

```json
{
  "version": 1,
  "canisters": {
    "frontend": {
      "type": "assets",
      "source": ["out"],
      "entrypoint": "out/index.html"
    }
  },
  "output_env_file": ".env"
}
```

### Step 4: Build Static Export

```bash
npm run build
# This creates an 'out' folder with static files
```

### Step 5: Deploy Locally (Test)

```bash
# Start local ICP network
dfx start --background

# Deploy to local network
dfx deploy

# Access at: http://127.0.0.1:4943/?canisterId=<canister-id>
```

### Step 6: Deploy to Mainnet

```bash
# Make sure you have cycles (ICP tokens converted to cycles)
# Get your principal ID
dfx identity get-principal

# Deploy to mainnet (costs cycles)
dfx deploy --network ic

# Your site will be live at: https://<canister-id>.icp0.io/
```

## Option 2: Full Stack Deployment (Recommended)

For a complete deployment with backend functionality, you need:

### Architecture:
1. **Frontend Canister** - Static Next.js export
2. **Backend Canister(s)** - Rust/Motoko for:
   - API endpoints
   - Authentication
   - Database operations

### Steps:

1. **Create Backend Canister** (Rust or Motoko)
   ```bash
   dfx new backend --type rust
   # or
   dfx new backend --type motoko
   ```

2. **Migrate API Routes** to backend canister
   - Convert `/api/*` routes to canister methods
   - Use Candid for type definitions
   - Handle authentication in backend

3. **Update Frontend** to call backend canister
   - Replace `fetch('/api/...')` with canister calls
   - Use `@dfinity/agent` for canister communication

4. **Deploy Both Canisters**
   ```bash
   dfx deploy --network ic
   ```

## Option 3: Hybrid Approach (Easier Migration)

Keep your current Vercel deployment for backend, deploy static frontend to ICP:

1. Deploy static frontend to ICP
2. Keep API routes on Vercel
3. Update frontend to call Vercel API URLs
4. Handle CORS properly

## Quick Setup Script

Create `scripts/setup-icp.sh`:

```bash
#!/bin/bash

echo "🚀 Setting up Internet Computer deployment..."

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    echo "❌ DFX not found. Installing..."
    sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
fi

# Create dfx.json if it doesn't exist
if [ ! -f "dfx.json" ]; then
    echo "📝 Creating dfx.json..."
    cat > dfx.json << EOF
{
  "version": 1,
  "canisters": {
    "frontend": {
      "type": "assets",
      "source": ["out"],
      "entrypoint": "out/index.html"
    }
  },
  "output_env_file": ".env"
}
EOF
fi

# Update next.config.ts for static export
echo "⚙️  Updating next.config.ts..."
# (You'll need to manually add output: 'export')

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update next.config.ts to add: output: 'export'"
echo "2. Run: npm run build"
echo "3. Run: dfx deploy (local) or dfx deploy --network ic (mainnet)"
```

## Troubleshooting

### Issue: Build fails with API routes
**Solution:** Remove or comment out API route imports in pages

### Issue: Images not loading
**Solution:** Use `unoptimized: true` in next.config.ts images config

### Issue: Authentication not working
**Solution:** Implement client-side auth or use backend canister

### Issue: Database queries fail
**Solution:** Move database logic to backend canister or use external service

## Resources

- [ICP Documentation](https://internetcomputer.org/docs/current/developer-docs/)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [DFX CLI Reference](https://internetcomputer.org/docs/current/references/cli-reference/)
- [Example: Next.js on ICP](https://github.com/jennifertrin/nextjsicp)

## Recommendation

For your tattoo studio app, I recommend:
1. **Keep Vercel deployment** for full functionality
2. **Use ICP for** static marketing pages only
3. **Or** invest time in full ICP migration with backend canisters

Would you like me to:
- Create a static export version of your site?
- Set up the dfx.json configuration?
- Help migrate specific features to ICP?
