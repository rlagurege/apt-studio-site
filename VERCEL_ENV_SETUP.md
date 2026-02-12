# 🔐 Vercel Environment Variables Setup

## Copy These to Vercel

Go to: **Vercel → Your Project → Settings → Environment Variables**

### Required Variables:

```
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://apt-studio-site-xxxxx.vercel.app
DATABASE_URL=your-database-url
ARTIST_PASSWORDS={"big-russ":"416769","kenny-briggs":"changeme","gavin-gomula":"000123","tom-bone":"110244","ron-holt":"666666"}
STAFF_PASSWORDS={"tammi-gomula":"123456","big-russ":"416769","tom-bone":"110244"}
```

### How to Get Values:

1. **NEXTAUTH_SECRET**: 
   - Generate: `openssl rand -base64 32`
   - Or use any random string (at least 32 characters)

2. **NEXTAUTH_URL**: 
   - Use your Vercel URL: `https://apt-studio-site-xxxxx.vercel.app`
   - Or your custom domain: `https://addictivepaintattoo.studio`

3. **DATABASE_URL**: 
   - Your Neon/Supabase/PostgreSQL connection string
   - Format: `postgresql://user:password@host:5432/database?sslmode=require`

4. **ARTIST_PASSWORDS & STAFF_PASSWORDS**: 
   - Copy exactly from your `.env` file
   - Make sure no extra spaces

### After Adding:

1. Click **"Save"**
2. Go to **Deployments** tab
3. Click **"..."** → **"Redeploy"**
4. Wait for build

## ✅ That Should Fix It!
