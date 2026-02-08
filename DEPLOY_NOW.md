# 🚀 Deploy Your Website NOW - Step by Step

## Quick Deploy to Vercel (5 minutes)

### Option 1: Deploy via Vercel Website (Easiest)

1. **Go to Vercel:**
   - Visit: https://vercel.com
   - Click "Sign Up" (top right)
   - Sign up with GitHub (recommended) or email

2. **Create New Project:**
   - After logging in, click "Add New Project" or "New Project"
   - You'll see options to import

3. **Upload Your Project:**
   
   **Option A: Drag & Drop (Fastest)**
   - Drag your entire `apt-studio-site` folder onto the Vercel page
   - Vercel will detect it's a Next.js project
   - Click "Deploy"

   **Option B: Connect GitHub (Better for updates)**
   - Click "Import Git Repository"
   - Connect your GitHub account
   - Create a new repo or select existing
   - Push your code to GitHub first:
     ```bash
     cd "/Users/rlagurege/Tattoo studios/apt-studio-site"
     git init
     git add .
     git commit -m "Initial commit"
     # Then create repo on GitHub and push
     ```

4. **Configure Project:**
   - Project Name: `apt-studio-site` (or your choice)
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install` (auto-detected)

5. **Click "Deploy"**
   - Wait 2-3 minutes for build to complete
   - You'll see a success message with a URL like: `apt-studio-site.vercel.app`

### Step 2: Add Environment Variables

**After deployment completes:**

1. **Go to Project Settings:**
   - Click on your project name
   - Click "Settings" tab
   - Click "Environment Variables" in left sidebar

2. **Add These Variables:**
   
   Click "Add New" for each:

   ```
   Name: NEXTAUTH_SECRET
   Value: [your-secret-from-env-file]
   Environment: Production, Preview, Development (select all)
   
   Name: NEXTAUTH_URL
   Value: https://addictivepaintattoo.studio
   Environment: Production, Preview, Development (select all)
   
   Name: DATABASE_URL
   Value: [your-database-url]
   Environment: Production, Preview, Development (select all)
   
   Name: ARTIST_PASSWORDS
   Value: {"big-russ":"416769","kenny-briggs":"changeme","gavin-gomula":"000123","tom-bone":"110244","ron-holt":"666666"}
   Environment: Production, Preview, Development (select all)
   
   Name: STAFF_PASSWORDS
   Value: {"tammy-gomula":"changeme"}
   Environment: Production, Preview, Development (select all)
   
   Name: NOTION_SECRET
   Value: [your-notion-secret]
   Environment: Production, Preview, Development (select all)
   
   Name: NOTION_DATABASE_ID
   Value: [your-notion-database-id]
   Environment: Production, Preview, Development (select all)
   ```

   **Copy these from your `.env` file!**

3. **Redeploy:**
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Click "Redeploy"
   - This applies the new environment variables

### Step 3: Add Your Domain

1. **Go to Domains:**
   - Click "Settings" tab
   - Click "Domains" in left sidebar

2. **Add Domain:**
   - Click "Add Domain" button
   - Enter: `addictivepaintattoo.studio`
   - Click "Add"
   - Vercel will verify the domain

3. **Add www Subdomain:**
   - Click "Add Domain" again
   - Enter: `www.addictivepaintattoo.studio`
   - Click "Add"

4. **Get DNS Records:**
   - Vercel will show you DNS records to configure
   - They'll look like:
     ```
     Type: A
     Name: @
     Value: 76.76.21.21
     
     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
     ```
   - **COPY THESE DOWN!** You'll need them for Squarespace

### Step 4: Configure DNS in Squarespace

**Now go back to Squarespace:**

1. **On your Squarespace domain page:**
   - You're already there: DNS Settings page
   - Click on "DNS Settings" tab

2. **Add DNS Records:**
   
   For each record from Vercel:
   
   **Record 1 (A Record):**
   - Click "Add Record" or "+"
   - Type: Select "A"
   - Name: `@` (or leave blank for root domain)
   - Value: `76.76.21.21` (use the IP from Vercel)
   - TTL: Auto or 3600
   - Click "Save" or "Add"

   **Record 2 (CNAME Record):**
   - Click "Add Record" or "+"
   - Type: Select "CNAME"
   - Name: `www`
   - Value: `cname.vercel-dns.com` (use the value from Vercel)
   - TTL: Auto or 3600
   - Click "Save" or "Add"

3. **Remove Old Records (if any):**
   - Look for any existing A or CNAME records
   - If they point to Squarespace or other places, delete them
   - Keep only the new Vercel records

4. **Save Changes:**
   - Make sure all records are saved
   - DNS changes apply immediately but take 1-48 hours to propagate

### Step 5: Wait & Test

1. **Wait 1-2 hours** for DNS to propagate

2. **Test Your Site:**
   - Visit: https://addictivepaintattoo.studio
   - Should load your website!
   - SSL certificate will auto-configure (may take a few minutes)

3. **Check DNS Propagation:**
   - Visit: https://dnschecker.org
   - Enter: `addictivepaintattoo.studio`
   - Should show Vercel's IP address

## Quick Checklist

- [ ] Signed up/logged into Vercel
- [ ] Deployed project to Vercel
- [ ] Added environment variables
- [ ] Redeployed with env vars
- [ ] Added domain in Vercel
- [ ] Got DNS records from Vercel
- [ ] Added DNS records in Squarespace
- [ ] Removed conflicting records
- [ ] Saved changes
- [ ] Waiting for DNS (1-2 hours)
- [ ] Tested site at https://addictivepaintattoo.studio

## Need Help?

If you get stuck:
- Share screenshot of Vercel dashboard
- Share DNS records Vercel shows you
- Tell me which step you're on

I'll help you through it!
