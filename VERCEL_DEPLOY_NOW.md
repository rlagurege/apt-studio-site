# Deploy to Vercel - Quick Guide

## Step 1: Push to GitHub ✅
Your code is now pushed to: `https://github.com/rlagurege/apt-studio-site`

## Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (use GitHub to sign in)
2. Click **"Add New..."** → **"Project"**
3. Import your repository: `rlagurege/apt-studio-site`
4. Click **"Import"**

## Step 3: Configure Project Settings

### Framework Preset
- **Framework Preset:** Next.js (should auto-detect)
- **Root Directory:** `./` (leave as default)
- **Build Command:** Leave empty (Vercel will use `next build`)
- **Output Directory:** Leave empty (default)
- **Install Command:** `npm install` (default)

### Environment Variables
Click **"Environment Variables"** and add these (get values from your `.env` file):

**Required:**
```
DATABASE_URL=your_production_postgres_url
NEXTAUTH_SECRET=your_secret_at_least_32_chars
NEXTAUTH_URL=https://addictivepaintattoo.studio
```

**Optional (if you're using them):**
```
NOTION_SECRET=your_notion_secret
NOTION_DATABASE_ID=your_notion_database_id
ARTIST_PASSWORDS={"big-russ":"416769",...}
STAFF_PASSWORDS={"tammy-gomula":"changeme"}
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

## Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (may take 2-5 minutes)
3. Your site will be live at: `https://apt-studio-site-xxxxx.vercel.app`

## Step 5: Connect Your Domain

1. In Vercel dashboard, go to your project → **Settings** → **Domains**
2. Enter: `addictivepaintattoo.studio`
3. Click **"Add"**
4. Vercel will show you DNS records to add

### DNS Configuration in Squarespace

Go to your Squarespace domain settings and add these records:

**A Record:**
- **Host:** `@`
- **Type:** `A`
- **Value:** `76.76.21.21` (Vercel's IP - check Vercel dashboard for current IP)

**CNAME Record:**
- **Host:** `www`
- **Type:** `CNAME`
- **Value:** `cname.vercel-dns.com` (or what Vercel shows you)

**OR** use Vercel's nameservers (easier):
- In Squarespace, change nameservers to what Vercel provides
- Vercel will handle all DNS automatically

## Step 6: Wait for DNS Propagation

- DNS changes can take 24-48 hours (usually much faster)
- Check status in Vercel dashboard
- Once verified, your site will be live at `https://addictivepaintattoo.studio`

## Troubleshooting

### Build Fails?
- Check build logs in Vercel dashboard
- Make sure all environment variables are set
- Ensure `DATABASE_URL` points to a valid PostgreSQL database

### Prisma Issues?
- Vercel should auto-run `prisma generate` via `postinstall` script
- If not, add build command: `prisma generate && next build`

### Domain Not Working?
- Wait 24-48 hours for DNS propagation
- Check DNS records match Vercel's requirements
- Verify domain in Vercel dashboard shows "Valid Configuration"

## Your Site Features
✅ Cursive "Addictive Pain Tattoo Studio" navigation
✅ TattooWalls slideshow on both sides
✅ All navigation tabs
✅ Artist portfolios
✅ Appointment requests
✅ Security middleware
✅ All features restored

---

**Need Help?** Check Vercel docs: https://vercel.com/docs
