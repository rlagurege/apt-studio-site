# Domain Setup Guide: addictivepaintattoo.studio

## Overview
This guide will help you connect your Squarespace domain `addictivepaintattoo.studio` to your Next.js website.

## Step 1: Choose Your Hosting Platform

Your Next.js app can be deployed to several platforms. **Vercel** is recommended as it's made by the Next.js team and offers the easiest setup.

### Option A: Deploy to Vercel (Recommended)

1. **Sign up/Login to Vercel:**
   - Go to https://vercel.com
   - Sign up with GitHub (recommended) or email

2. **Deploy Your Project:**
   - Click "Add New Project"
   - Import your Git repository (GitHub/GitLab/Bitbucket)
   - Or drag & drop your project folder
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables:**
   - In Vercel dashboard → Settings → Environment Variables
   - Add all variables from your `.env` file:
     ```
     NEXTAUTH_SECRET=your-secret-here
     NEXTAUTH_URL=https://addictivepaintattoo.studio
     DATABASE_URL=your-database-url
     ARTIST_PASSWORDS=your-passwords-json
     STAFF_PASSWORDS=your-staff-passwords-json
     ... (all other env vars)
     ```

4. **Add Custom Domain:**
   - In Vercel dashboard → Your Project → Settings → Domains
   - Click "Add Domain"
   - Enter: `addictivepaintattoo.studio`
   - Also add: `www.addictivepaintattoo.studio` (optional but recommended)

5. **Get DNS Records from Vercel:**
   - Vercel will show you DNS records to add:
     - Type: `A` or `CNAME`
     - Name: `@` or `www`
     - Value: Vercel's IP or CNAME target

### Option B: Deploy to Netlify

1. Sign up at https://netlify.com
2. Deploy your project
3. Add custom domain in Netlify dashboard
4. Get DNS records from Netlify

### Option C: Deploy to Railway/Render/Other

Similar process - deploy first, then configure DNS.

## Step 2: Configure DNS in Squarespace

Once you have your hosting platform's DNS records, configure them in Squarespace:

1. **Log into Squarespace:**
   - Go to your Squarespace account
   - Navigate to Domains → addictivepaintattoo.studio

2. **Access DNS Settings:**
   - Look for "DNS Settings" or "Advanced DNS"
   - You may need to click "Use Squarespace Nameservers" or "Advanced Settings"

3. **Add DNS Records:**

   **For Vercel (most common):**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   TTL: 3600
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 3600
   ```
   
   **OR if Vercel gives you specific records, use those instead.**

   **For other platforms:**
   - Use the DNS records provided by your hosting platform
   - Typically you'll need:
     - An `A` record pointing `@` to an IP address
     - A `CNAME` record pointing `www` to a hostname

4. **Remove Conflicting Records:**
   - Remove any existing `A` or `CNAME` records that conflict
   - Keep only the records pointing to your hosting platform

5. **Save Changes:**
   - DNS changes can take 24-48 hours to propagate
   - Usually works within 1-2 hours

## Step 3: Update Next.js Configuration

Update your `next.config.ts` to include the domain:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  // Add your domain here
  images: {
    domains: ['addictivepaintattoo.studio'],
  },
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
};

export default nextConfig;
```

## Step 4: Update Environment Variables

Update `NEXTAUTH_URL` in your environment variables:

```env
NEXTAUTH_URL=https://addictivepaintattoo.studio
```

**Important:** Update this in:
- Your `.env` file (local development)
- Your hosting platform's environment variables (production)

## Step 5: SSL Certificate

Most hosting platforms (Vercel, Netlify) automatically provide SSL certificates:
- ✅ Vercel: Automatic SSL via Let's Encrypt
- ✅ Netlify: Automatic SSL
- ✅ Railway: Automatic SSL

No action needed - SSL will be configured automatically once DNS is set up.

## Step 6: Verify Domain Connection

1. **Wait for DNS Propagation:**
   - Check DNS propagation: https://dnschecker.org
   - Enter: `addictivepaintattoo.studio`
   - Look for your hosting platform's IP/CNAME

2. **Test Your Site:**
   - Visit: https://addictivepaintattoo.studio
   - Should load your Next.js app
   - Check SSL certificate (should be valid)

3. **Test www Subdomain:**
   - Visit: https://www.addictivepaintattoo.studio
   - Should redirect to or load the same site

## Troubleshooting

### Domain Not Working?
- **Check DNS propagation:** Use https://dnschecker.org
- **Verify DNS records:** Make sure they match your hosting platform
- **Check hosting platform:** Ensure deployment is successful
- **Wait longer:** DNS can take up to 48 hours

### SSL Certificate Issues?
- Wait 24-48 hours after DNS setup
- Most platforms auto-renew SSL certificates
- Check hosting platform's SSL status page

### Can't Find DNS Settings in Squarespace?
- Look for "Advanced DNS" or "DNS Settings"
- May be under "Domain Settings" → "Advanced"
- Contact Squarespace support if needed

## Quick Checklist

- [ ] Deploy website to hosting platform (Vercel/Netlify/etc.)
- [ ] Add custom domain in hosting platform dashboard
- [ ] Get DNS records from hosting platform
- [ ] Add DNS records in Squarespace
- [ ] Update NEXTAUTH_URL environment variable
- [ ] Wait for DNS propagation (1-48 hours)
- [ ] Test domain: https://addictivepaintattoo.studio
- [ ] Verify SSL certificate is active

## Need Help?

If you get stuck, provide:
1. Your hosting platform (Vercel, Netlify, etc.)
2. The DNS records your platform gave you
3. Screenshot of Squarespace DNS settings page

I can help you configure the exact DNS records needed!
