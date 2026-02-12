# 🔧 Fix Vercel Deployment - Step by Step

## ✅ Your Code Builds Successfully Locally!

The build works fine, so the issue is likely **missing environment variables** in Vercel.

## 🚨 Most Common Issue: Missing Environment Variables

### Step 1: Check Your Deployment Status

1. Go to: https://vercel.com
2. Click your **`apt-studio-site`** project
3. Check the **"Deployments"** tab
4. Look at the latest deployment:
   - ✅ **"Ready"** = Working! (Check if site loads)
   - ❌ **"Error"** = Click it to see error logs
   - ⏳ **"Building"** = Wait for it to finish

### Step 2: Add Environment Variables (CRITICAL!)

**Go to:** Vercel → Your Project → **Settings** → **Environment Variables**

**Add these REQUIRED variables:**

```
NEXTAUTH_SECRET=your-secret-at-least-32-characters-long
NEXTAUTH_URL=https://apt-studio-site.vercel.app
DATABASE_URL=your-database-connection-string
ARTIST_PASSWORDS={"big-russ":"416769","kenny-briggs":"changeme","gavin-gomula":"000123","tom-bone":"110244","ron-holt":"666666"}
STAFF_PASSWORDS={"tammi-gomula":"123456","big-russ":"416769","tom-bone":"110244"}
```

**Important:**
- Copy values from your `.env` file
- For `NEXTAUTH_URL`, use your Vercel URL: `https://apt-studio-site-xxxxx.vercel.app`
- After adding, **Redeploy** (see Step 3)

### Step 3: Redeploy After Adding Env Vars

1. Go to **Deployments** tab
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**
4. Wait for build to complete

### Step 4: Test Your Site

Visit your Vercel URL:
- `https://apt-studio-site-xxxxx.vercel.app`

Should load your homepage!

## 🔍 If Still Not Working

### Check Build Logs:

1. Go to Vercel → Deployments
2. Click on the deployment
3. Click **"Build Logs"** tab
4. Look for error messages
5. Share the error with me!

### Common Errors:

**"Missing NEXTAUTH_SECRET"**
→ Add `NEXTAUTH_SECRET` environment variable

**"Database connection failed"**
→ Add `DATABASE_URL` environment variable

**"Build failed"**
→ Check build logs for specific error

## 📋 Quick Checklist

- [ ] Environment variables added in Vercel
- [ ] Redeployed after adding env vars
- [ ] Checked deployment status (should be "Ready")
- [ ] Tested site URL

## 💬 What Error Do You See?

Tell me:
1. What happens when you visit your Vercel URL?
2. What does the Vercel dashboard show? (Ready/Error/Building)
3. Any error messages?

I'll help you fix it!
