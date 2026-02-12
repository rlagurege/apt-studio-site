# 🌐 Add Custom Domain: addictivepaintattoo.studio

## Quick Steps to Replace .vercel.app

### Step 1: Add Domain in Vercel

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com
   - Sign in
   - Click on your `apt-studio-site` project

2. **Add Custom Domain:**
   - Click **"Settings"** tab (top right)
   - Click **"Domains"** in the left sidebar
   - Click **"Add Domain"** button
   - Enter: `addictivepaintattoo.studio`
   - Click **"Add"**

3. **Add www Subdomain (Optional but Recommended):**
   - Click **"Add Domain"** again
   - Enter: `www.addictivepaintattoo.studio`
   - Click **"Add"**

### Step 2: Get DNS Records from Vercel

After adding the domain, Vercel will show you DNS records like:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

**📝 Copy these - you'll need them!**

### Step 3: Configure DNS in Squarespace

1. **Log into Squarespace:**
   - Go to your Squarespace account
   - Navigate to **Domains** → **addictivepaintattoo.studio**

2. **Access DNS Settings:**
   - Click **"DNS Settings"** or **"Advanced DNS"**
   - You may need to enable "Use Squarespace Nameservers"

3. **Add DNS Records:**
   - Click **"Add Record"**
   - Add the **A record** from Vercel:
     - Type: `A`
     - Name: `@` (or leave blank)
     - Value: `76.76.21.21` (or what Vercel shows)
     - TTL: `3600`
   
   - Click **"Add Record"** again
   - Add the **CNAME record**:
     - Type: `CNAME`
     - Name: `www`
     - Value: `cname.vercel-dns.com` (or what Vercel shows)
     - TTL: `3600`

4. **Remove Old Records:**
   - Delete any old A or CNAME records pointing elsewhere
   - Keep only the Vercel records

5. **Save Changes**

### Step 4: Wait for DNS Propagation

- **Usually takes:** 1-2 hours
- **Can take up to:** 24-48 hours
- **Check status:** Vercel dashboard will show "Valid Configuration" when ready

### Step 5: Update Environment Variables

In Vercel → Settings → Environment Variables:

1. Update `NEXTAUTH_URL`:
   ```
   NEXTAUTH_URL=https://addictivepaintattoo.studio
   ```

2. **Redeploy** (Vercel usually does this automatically)

### Step 6: Test Your Domain

After DNS propagates:
- Visit: `https://addictivepaintattoo.studio`
- Should load your site!
- SSL certificate will be automatic

## ✅ Done!

Your site will now be accessible at:
- `https://addictivepaintattoo.studio` (main domain)
- `https://www.addictivepaintattoo.studio` (www redirects to main)

The `.vercel.app` URL will still work, but your custom domain will be the primary one!

## 🔍 Check DNS Status

You can check if DNS is ready:
- Vercel dashboard → Domains → Shows status
- Or use: https://dnschecker.org

## 💡 Pro Tip

Once DNS is configured, Vercel automatically:
- ✅ Provides SSL certificate (HTTPS)
- ✅ Redirects www to main domain
- ✅ Handles all domain routing

No additional configuration needed!
