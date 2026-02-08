# Vercel Deployment Troubleshooting

## Error: DEPLOYMENT_NOT_FOUND

This error means Vercel can't find the deployment. Here's how to fix it:

## Step 1: Check if Project Exists

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Sign in to your account

2. **Check Projects:**
   - Look for a project named `apt-studio-site` or similar
   - If you don't see it, you need to create it

## Step 2: Create/Import Project

### If Project Doesn't Exist:

1. **Click "Add New Project"**
2. **Import from GitHub:**
   - Click "Import Git Repository"
   - Select: `rlagurege/apt-studio-site`
   - Click "Import"

3. **Configure Project:**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install` (auto-detected)

4. **Environment Variables:**
   - Click "Environment Variables"
   - Add all variables from your `.env` file:
     ```
     NEXTAUTH_SECRET=your-secret
     NEXTAUTH_URL=https://addictivepaintattoo.studio
     DATABASE_URL=your-database-url
     ARTIST_PASSWORDS={"big-russ":"416769",...}
     STAFF_PASSWORDS={"tammy-gomula":"changeme"}
     NOTION_SECRET=your-notion-secret
     NOTION_DATABASE_ID=your-database-id
     ```
   - Make sure to set them for: Production, Preview, and Development

5. **Click "Deploy"**
   - Wait for deployment to complete (2-3 minutes)

## Step 3: Check Deployment Status

After clicking "Deploy":

1. **Watch the build logs:**
   - You'll see build progress
   - Look for any errors

2. **If build succeeds:**
   - You'll get a URL like: `apt-studio-site.vercel.app`
   - This is your deployment URL

3. **If build fails:**
   - Check the error messages
   - Fix any issues
   - Redeploy

## Step 4: Add Custom Domain

After deployment succeeds:

1. **Go to Project Settings:**
   - Click on your project
   - Click "Settings" tab
   - Click "Domains" in left sidebar

2. **Add Domain:**
   - Click "Add Domain"
   - Enter: `addictivepaintattoo.studio`
   - Click "Add"

3. **Verify Domain:**
   - Vercel will verify the domain
   - Make sure DNS is configured (you already did this ✅)
   - Wait for verification (can take a few minutes)

## Common Issues

### Issue 1: Project Not Created
**Solution:** Follow Step 2 above to create the project

### Issue 2: Build Fails
**Solution:** 
- Check build logs for errors
- Make sure environment variables are set
- Check that `package.json` has correct scripts

### Issue 3: Domain Not Verified
**Solution:**
- Wait 1-2 hours after DNS changes
- Check DNS propagation: https://dnschecker.org
- Make sure A record points to: `216.198.79.1`

### Issue 4: Environment Variables Missing
**Solution:**
- Go to Settings → Environment Variables
- Add all required variables
- Redeploy after adding variables

## Quick Checklist

- [ ] Project exists in Vercel dashboard
- [ ] Project is connected to GitHub repo
- [ ] Environment variables are set
- [ ] Build completed successfully
- [ ] Domain added in Vercel
- [ ] DNS configured in Squarespace
- [ ] DNS propagated (check dnschecker.org)

## Need Help?

Share:
- Screenshot of Vercel dashboard
- Build error messages (if any)
- Whether project exists or not

I can help you troubleshoot!
