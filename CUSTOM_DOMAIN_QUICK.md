# 🚀 Quick: Add Custom Domain to Vercel

## 3 Steps to Replace .vercel.app

### 1️⃣ Add Domain in Vercel (2 minutes)

1. Go to: https://vercel.com
2. Click your **`apt-studio-site`** project
3. Click **Settings** → **Domains**
4. Click **"Add Domain"**
5. Enter: `addictivepaintattoo.studio`
6. Click **"Add"**

Vercel will show you DNS records - **copy them!**

### 2️⃣ Add DNS Records in Squarespace (3 minutes)

1. Log into Squarespace
2. Go to: **Domains** → **addictivepaintattoo.studio** → **DNS Settings**
3. Add the **A record** Vercel gave you:
   - Type: `A`
   - Name: `@`
   - Value: (from Vercel, usually `76.76.21.21`)
4. Add the **CNAME record**:
   - Type: `CNAME`
   - Name: `www`
   - Value: (from Vercel, usually `cname.vercel-dns.com`)
5. **Save**

### 3️⃣ Wait & Test (1-2 hours)

- Wait 1-2 hours for DNS to propagate
- Visit: `https://addictivepaintattoo.studio`
- Your site should load!

## ✅ That's It!

Your site will be live at `addictivepaintattoo.studio` instead of `.vercel.app`!

**Need help?** Share the DNS records Vercel shows you and I can help configure them!
