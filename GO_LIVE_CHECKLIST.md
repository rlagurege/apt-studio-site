# 🚀 Go Live Checklist: addictivepaintattoo.studio

## Quick Steps to Get Online

### Step 1: Deploy Your Website (Choose One)

**✅ Option A: Vercel (Recommended - 5 minutes)**
1. Go to https://vercel.com and sign up/login
2. Click "Add New Project"
3. Import from GitHub OR drag & drop your project folder
4. Vercel auto-detects Next.js - click "Deploy"
5. Wait for deployment to complete

**✅ Option B: Netlify**
1. Go to https://netlify.com and sign up/login  
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub or drag & drop folder
4. Click "Deploy site"

### Step 2: Add Environment Variables

In your hosting platform dashboard (Vercel/Netlify):

**Go to:** Settings → Environment Variables

**Add these (copy from your `.env` file):**
```
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://addictivepaintattoo.studio
DATABASE_URL=your-database-url
ARTIST_PASSWORDS={"big-russ":"password","kenny-briggs":"password"}
STAFF_PASSWORDS={"tammy-gomula":"password"}
NOTION_SECRET=your-notion-secret
NOTION_DATABASE_ID=your-database-id
```

**After adding:** Redeploy your site (usually automatic, or click "Redeploy")

### Step 3: Add Custom Domain

**In Vercel:**
1. Go to: Your Project → Settings → Domains
2. Click "Add Domain"
3. Enter: `addictivepaintattoo.studio`
4. Click "Add"
5. Also add: `www.addictivepaintattoo.studio`

**In Netlify:**
1. Go to: Site Settings → Domain Management
2. Click "Add custom domain"
3. Enter: `addictivepaintattoo.studio`

### Step 4: Get DNS Records

**Vercel will show you something like:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www  
Value: cname.vercel-dns.com
```

**Netlify will show you something like:**
```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: your-site.netlify.app
```

**📝 Write these down - you'll need them!**

### Step 5: Configure DNS in Squarespace

1. **Log into Squarespace**
   - Go to your Squarespace account
   - Navigate to: **Domains → addictivepaintattoo.studio**

2. **Find DNS Settings**
   - Look for "DNS Settings" or "Advanced DNS"
   - May be under "Domain Settings" → "Advanced"

3. **Add DNS Records**
   - Click "Add Record" or "+"
   - Add the records from Step 4:
     - **Type:** A (or CNAME)
     - **Name:** @ (or leave blank for root domain)
     - **Value:** The IP/hostname from your hosting platform
     - **TTL:** Auto or 3600
   
   **Example for Vercel:**
   ```
   Record 1:
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Record 2:
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

4. **Remove Old Records** (if any)
   - Delete any existing A or CNAME records pointing elsewhere
   - Keep only your new records

5. **Save Changes**

### Step 6: Wait & Test

**DNS Propagation:** Usually 1-2 hours, can take up to 48 hours

**Test Your Site:**
1. Wait 30-60 minutes
2. Visit: https://addictivepaintattoo.studio
3. Check SSL certificate (should show green lock)

**Check DNS Propagation:**
- Visit: https://dnschecker.org
- Enter: `addictivepaintattoo.studio`
- Look for your hosting platform's IP

### Step 7: Database Setup (If Needed)

Your app uses PostgreSQL. Set up a database:

**Option 1: Vercel Postgres (Easiest)**
- Vercel Dashboard → Storage → Create Database
- Choose PostgreSQL
- Vercel auto-adds `DATABASE_URL`
- Run: `npx prisma migrate deploy` (in Vercel CLI or via dashboard)

**Option 2: Supabase (Free tier)**
- Sign up: https://supabase.com
- Create project → Get connection string
- Add to environment variables as `DATABASE_URL`

## ✅ Final Checklist

- [ ] Website deployed to hosting platform
- [ ] Environment variables added
- [ ] Custom domain added in hosting platform
- [ ] DNS records added in Squarespace
- [ ] DNS propagated (check dnschecker.org)
- [ ] Site loads at https://addictivepaintattoo.studio
- [ ] SSL certificate active (green lock)
- [ ] Database connected (if using)
- [ ] Test login/authentication
- [ ] Test form submissions

## 🆘 Need Help?

**If DNS isn't working:**
- Double-check DNS records match hosting platform
- Wait longer (can take 48 hours)
- Check dnschecker.org to see propagation status

**If site doesn't load:**
- Check hosting platform deployment status
- Verify environment variables are set
- Check hosting platform logs for errors

**If SSL certificate issues:**
- Wait 24-48 hours after DNS setup
- Most platforms auto-configure SSL
- Check hosting platform's SSL status

## 📞 What I Need From You

To help you configure DNS exactly:

1. **Which hosting platform?** (Vercel, Netlify, etc.)
2. **DNS records from your platform** (screenshot or copy/paste)
3. **Screenshot of Squarespace DNS page** (if you can't find settings)

Share these and I can give you exact step-by-step instructions!
