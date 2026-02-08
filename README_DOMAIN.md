# 🌐 Domain Setup: addictivepaintattoo.studio

## What You Need to Do

I've created guides to help you connect your Squarespace domain to your website. Here's what you need:

### 📋 Quick Summary

1. **Deploy your website** to a hosting platform (Vercel recommended)
2. **Add your domain** in the hosting platform
3. **Get DNS records** from the hosting platform  
4. **Add DNS records** in Squarespace
5. **Wait for DNS** to propagate (1-48 hours)
6. **Test** your site!

### 📚 Detailed Guides Created

I've created these files to help you:

1. **`GO_LIVE_CHECKLIST.md`** ⭐ **START HERE**
   - Step-by-step checklist
   - What to do in order
   - Troubleshooting tips

2. **`DEPLOYMENT_QUICK_START.md`**
   - How to deploy to Vercel/Netlify
   - Environment variable setup
   - Database setup options

3. **`DOMAIN_SETUP.md`**
   - Detailed DNS configuration
   - Platform-specific instructions
   - SSL certificate info

### 🚀 Fastest Path (5-10 minutes)

**If you want to go live ASAP:**

1. **Deploy to Vercel:**
   - Go to https://vercel.com
   - Sign up/login
   - Click "Add New Project"
   - Import your GitHub repo OR drag & drop the `apt-studio-site` folder
   - Click "Deploy"

2. **Add Environment Variables:**
   - In Vercel → Settings → Environment Variables
   - Copy all variables from your `.env` file
   - **Important:** Change `NEXTAUTH_URL` to `https://addictivepaintattoo.studio`

3. **Add Domain:**
   - Vercel → Settings → Domains
   - Add: `addictivepaintattoo.studio`
   - Vercel shows you DNS records

4. **Configure DNS in Squarespace:**
   - Squarespace → Domains → addictivepaintattoo.studio
   - DNS Settings → Add the records Vercel gave you
   - Save

5. **Wait & Test:**
   - Wait 1-2 hours
   - Visit: https://addictivepaintattoo.studio

### 🆘 Need Help Right Now?

**Tell me:**
1. Which hosting platform you want to use (Vercel, Netlify, etc.)
2. If you've already deployed anywhere
3. Any errors you're seeing

**Or share:**
- Screenshot of your Squarespace DNS settings page
- DNS records from your hosting platform

I can give you exact step-by-step instructions!

### ✅ What's Already Done

- ✅ Website code is ready
- ✅ Security measures implemented
- ✅ Domain configuration prepared
- ✅ Next.js config updated for your domain

### 📝 Next Steps

1. **Read:** `GO_LIVE_CHECKLIST.md` for the full process
2. **Deploy:** Choose Vercel (easiest) or another platform
3. **Configure:** Add DNS records in Squarespace
4. **Test:** Visit your domain after DNS propagates

You're almost there! 🎉
