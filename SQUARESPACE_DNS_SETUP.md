# Squarespace DNS Setup Guide

## What You're Looking At

You're on your Squarespace domain management page for `addictivepaintattoo.studio`. Here's what you need to do:

## Step-by-Step Instructions

### Step 1: Find DNS Settings

On your Squarespace domain page, look for one of these:

**Option A: "DNS Settings" tab**
- Click on the "DNS Settings" tab at the top
- This is usually next to "Overview", "Email", etc.

**Option B: "Advanced DNS"**
- Look for a button/link that says "Advanced DNS" or "DNS"
- May be under "Settings" or "Advanced"

**Option C: "Use Squarespace Nameservers"**
- If you see "Use Squarespace Nameservers" toggle
- Make sure it's ON (enabled)
- Then look for "DNS Records" section below

### Step 2: What You'll See

Once you're in DNS Settings, you should see:
- A list of existing DNS records (if any)
- Options to "Add Record" or "+" button
- Fields for: Type, Name, Value, TTL

### Step 3: What DNS Records You Need

**IMPORTANT:** You need to get DNS records from your hosting platform FIRST!

**If using Vercel:**
1. Deploy your site to Vercel
2. Go to Vercel → Your Project → Settings → Domains
3. Add domain: `addictivepaintattoo.studio`
4. Vercel will show you DNS records like:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

**If using Netlify:**
1. Deploy to Netlify
2. Add custom domain
3. Netlify shows DNS records like:
   ```
   Type: A
   Name: @
   Value: 75.2.60.5
   
   Type: CNAME
   Name: www
   Value: your-site.netlify.app
   ```

### Step 4: Add Records in Squarespace

For each DNS record from your hosting platform:

1. Click "Add Record" or "+"
2. Fill in:
   - **Type:** A or CNAME (from hosting platform)
   - **Name:** @ (for root domain) or www (for www subdomain)
   - **Value:** The IP or hostname from hosting platform
   - **TTL:** Auto or 3600
3. Click "Save" or "Add"

**Example:**
```
Record 1:
Type: A
Name: @
Value: 76.76.21.21
TTL: Auto

Record 2:
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto
```

### Step 5: Remove Conflicting Records

- Look for any existing A or CNAME records pointing elsewhere
- Delete those (they'll conflict with your new records)
- Keep only the records pointing to your hosting platform

### Step 6: Save and Wait

- Click "Save" if there's a save button
- Changes usually apply immediately
- DNS propagation takes 1-48 hours (usually 1-2 hours)

## Common Issues

### Can't Find DNS Settings?
- Look for tabs at the top: "Overview", "DNS Settings", "Email"
- Check under "Settings" or "Advanced" menu
- May need to scroll down on the page

### See "Use Squarespace Nameservers"?
- Make sure this is ON (enabled)
- This allows you to manage DNS in Squarespace
- If it's OFF, you can't add DNS records here

### Already Have Records?
- You may see existing A or CNAME records
- These might be pointing to Squarespace hosting
- Replace them with records from your hosting platform

## What I Need From You

To give you exact instructions:

1. **Screenshot of your DNS Settings page** (if possible)
   - Shows what options you see
   - Helps me guide you exactly

2. **DNS records from your hosting platform**
   - After deploying and adding domain
   - Usually shown in hosting dashboard

3. **Which hosting platform?**
   - Vercel, Netlify, Railway, etc.
   - Or haven't deployed yet?

## Quick Checklist

- [ ] Found DNS Settings page in Squarespace
- [ ] Deployed website to hosting platform (Vercel/Netlify)
- [ ] Added domain in hosting platform
- [ ] Got DNS records from hosting platform
- [ ] Added DNS records in Squarespace
- [ ] Removed conflicting records
- [ ] Saved changes
- [ ] Waiting for DNS propagation (1-2 hours)

## Next Steps

1. **If you haven't deployed yet:**
   - Deploy to Vercel first (see `DEPLOYMENT_QUICK_START.md`)
   - Then come back here to configure DNS

2. **If you've already deployed:**
   - Get DNS records from your hosting platform
   - Add them in Squarespace using steps above
   - Share the records with me if you need help

3. **If you're stuck:**
   - Share screenshot of your Squarespace DNS page
   - Tell me which hosting platform you're using
   - I'll give you exact step-by-step instructions
