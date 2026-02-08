# Mobile Access Instructions

## Option 1: Local Network (Quick Testing)

Your development server is running and accessible on your local network:

**📱 Mobile URL:** `http://192.168.1.9:3000`

### Steps to Access:
1. Make sure your phone is connected to the **same Wi-Fi network** as your computer
2. Open your phone's browser (Safari, Chrome, etc.)
3. Type in the address bar: `http://192.168.1.9:3000`
4. The site should load!

**Note:** Some features (like passkeys/WebAuthn) require HTTPS, so they may not work fully on local network.

---

## Option 2: Deploy to Vercel (Recommended for Full Testing)

For HTTPS and a public URL that works anywhere:

### Quick Deploy:
1. Go to [vercel.com](https://vercel.com) and sign up/login (free)
2. Click "Add New Project"
3. Import your Git repository OR drag & drop the `apt-studio-site` folder
4. Vercel will auto-detect Next.js and deploy
5. You'll get a URL like: `https://apt-studio-site.vercel.app`

### Or use CLI:
```bash
cd "/Users/rlagurege/Tattoo studios/apt-studio-site"
npx vercel
```

Follow the prompts, and you'll get a public URL!

---

## Current Server Status

✅ Development server is running  
✅ Accessible on local network at: `http://192.168.1.9:3000`  
✅ To restart: `npm run dev:network`

---

## Testing Features on Mobile

- ✅ View website layout
- ✅ Navigate pages
- ✅ Test forms
- ⚠️ Passkeys/WebAuthn (requires HTTPS - use Vercel)
- ⚠️ Twilio SMS/Calls (requires environment variables on Vercel)
