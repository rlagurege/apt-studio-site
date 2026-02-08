# Quick Start: Deploy Your Website

## Fastest Path to Go Live

### 1. Deploy to Vercel (5 minutes)

**Option A: Via GitHub (Recommended)**
```bash
# 1. Create a GitHub repository (if you don't have one)
cd "/Users/rlagurege/Tattoo studios/apt-studio-site"
git init
git add .
git commit -m "Initial commit"
# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Then:
1. Go to https://vercel.com
2. Click "Import Project"
3. Select your GitHub repository
4. Vercel auto-detects Next.js
5. Add environment variables (see below)
6. Click "Deploy"

**Option B: Via Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd "/Users/rlagurege/Tattoo studios/apt-studio-site"
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? apt-studio-site (or your choice)
# - Directory? ./
# - Override settings? No
```

### 2. Add Environment Variables in Vercel

After deployment, go to:
**Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these (copy from your `.env` file):
```
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://addictivepaintattoo.studio
DATABASE_URL=your-database-url
ARTIST_PASSWORDS={"big-russ":"password","kenny-briggs":"password"}
STAFF_PASSWORDS={"tammy-gomula":"password"}
NOTION_SECRET=your-notion-secret
NOTION_DATABASE_ID=your-database-id
TAMMY_EMAIL=email@example.com
EMAIL_FROM=no-reply@addictivepaintattoo.studio
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890
```

**Important:** After adding env vars, redeploy:
- Go to Deployments tab
- Click "..." on latest deployment
- Click "Redeploy"

### 3. Add Custom Domain in Vercel

1. Go to **Settings → Domains**
2. Click **"Add Domain"**
3. Enter: `addictivepaintattoo.studio`
4. Click **"Add"**
5. Also add: `www.addictivepaintattoo.studio`

Vercel will show you DNS records to configure.

### 4. Configure DNS in Squarespace

**What Vercel Will Show You:**
- Usually an `A` record or `CNAME` record
- Example: `A` record pointing `@` to `76.76.21.21`
- Or `CNAME` record pointing `@` to `cname.vercel-dns.com`

**In Squarespace:**
1. Go to **Domains → addictivepaintattoo.studio**
2. Click **"DNS Settings"** or **"Advanced DNS"**
3. Add the records Vercel provided
4. Save

**Common Vercel DNS Records:**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: Auto

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
TTL: Auto
```

### 5. Wait & Test

- **DNS Propagation:** 1-48 hours (usually 1-2 hours)
- **SSL Certificate:** Auto-configured by Vercel (takes a few minutes after DNS)

**Test:**
```bash
# Check if DNS is working
nslookup addictivepaintattoo.studio

# Visit your site
open https://addictivepaintattoo.studio
```

## Alternative: Deploy to Netlify

1. Go to https://netlify.com
2. Sign up/login
3. Click "Add new site" → "Import an existing project"
4. Connect GitHub or drag & drop folder
5. Add environment variables
6. Add custom domain: `addictivepaintattoo.studio`
7. Configure DNS (Netlify will show you records)

## Database Setup

Your app uses PostgreSQL. Options:

**Option 1: Vercel Postgres (Easiest)**
- In Vercel dashboard → Storage → Create Database
- Choose PostgreSQL
- Vercel auto-adds `DATABASE_URL` env var
- Run migrations: `npx prisma migrate deploy`

**Option 2: Supabase (Free tier available)**
- Sign up at https://supabase.com
- Create project → Get connection string
- Add to Vercel env vars as `DATABASE_URL`

**Option 3: Railway/Render/Neon**
- Similar process - create DB, get connection string, add to env vars

## Post-Deployment Checklist

- [ ] Website loads at https://addictivepaintattoo.studio
- [ ] SSL certificate is valid (green lock)
- [ ] www subdomain works (or redirects)
- [ ] Environment variables are set
- [ ] Database is connected
- [ ] Authentication works
- [ ] File uploads work
- [ ] Email notifications work (if configured)

## Need Help?

Share:
1. Which hosting platform you're using
2. Any error messages
3. Screenshot of DNS settings page

I can help troubleshoot!
