# 🔧 Troubleshooting: What's Not Working?

## Quick Diagnosis

Tell me which issue you're seeing:

### ❌ Issue 1: Build Failed on Vercel
**Symptoms:** Deployment shows "Build Failed" or error messages

**Fix:**
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the failed deployment
3. Check the build logs for errors
4. Common issues:
   - Missing environment variables
   - Prisma build errors
   - TypeScript errors

**Quick Fix:**
- Make sure `NEXTAUTH_SECRET` is set (at least 32 characters)
- Make sure `DATABASE_URL` is set (even if placeholder)
- Check build logs for specific errors

### ❌ Issue 2: Site Shows Error Page
**Symptoms:** Site loads but shows error or blank page

**Fix:**
1. Check Vercel → Settings → Environment Variables
2. Make sure these are set:
   ```
   NEXTAUTH_SECRET=your-secret-here
   NEXTAUTH_URL=https://your-domain.vercel.app (or your custom domain)
   DATABASE_URL=your-database-url
   ```
3. After adding env vars, **Redeploy**:
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

### ❌ Issue 3: Domain Not Working
**Symptoms:** Custom domain shows error or doesn't load

**Fix:**
1. Check Vercel → Settings → Domains
2. Make sure domain shows "Valid Configuration"
3. If it shows "Invalid Configuration":
   - Check DNS records in Squarespace
   - Make sure A and CNAME records match Vercel's requirements
   - Wait 1-2 hours for DNS propagation

### ❌ Issue 4: Login Not Working
**Symptoms:** Can't log in as artist/admin

**Fix:**
1. Check environment variables:
   ```
   ARTIST_PASSWORDS={"big-russ":"416769","kenny-briggs":"changeme"}
   STAFF_PASSWORDS={"tammi-gomula":"123456"}
   ```
2. Make sure passwords match exactly (no extra spaces)
3. Redeploy after adding env vars

### ❌ Issue 5: Database Errors
**Symptoms:** Errors about database connection

**Fix:**
1. Make sure `DATABASE_URL` is set in Vercel
2. If using Neon/Supabase, make sure connection string is correct
3. Check database is accessible from Vercel's IPs

## 🚨 Most Common Fix

**90% of issues are missing environment variables!**

1. Go to: Vercel → Your Project → Settings → Environment Variables
2. Add ALL variables from your `.env` file
3. Click "Redeploy" after adding

## 📋 Required Environment Variables

**Minimum Required:**
```
NEXTAUTH_SECRET=your-secret-at-least-32-chars
NEXTAUTH_URL=https://your-site.vercel.app
DATABASE_URL=your-database-url
ARTIST_PASSWORDS={"big-russ":"416769"}
STAFF_PASSWORDS={"tammi-gomula":"123456"}
```

## 🔍 Check Deployment Status

1. Go to: https://vercel.com
2. Click your project
3. Check "Deployments" tab
4. Look for:
   - ✅ "Ready" = Working!
   - ❌ "Error" = Check logs
   - ⏳ "Building" = Wait

## 💬 Tell Me What You See

Share:
1. What error message do you see?
2. Where do you see it? (Vercel dashboard, website, etc.)
3. What were you trying to do?

I'll help you fix it!
