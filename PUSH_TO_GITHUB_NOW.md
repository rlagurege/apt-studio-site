# 🚀 Push to GitHub - Do This Now

## Step 1: Create Repository on GitHub

**Go to:** https://github.com/new

**Fill in:**
- Repository name: `apt-studio-site`
- Description: `Website for Addictive Pain Tattoo (APT Studio)`
- Visibility: **Private** (recommended) or Public
- **DO NOT** check "Initialize with README"
- Click **"Create repository"**

## Step 2: Copy Repository URL

After creating, GitHub will show you a page with setup instructions.

**Copy this URL** (it will look like):
```
https://github.com/rlagurege/apt-studio-site.git
```

## Step 3: Run These Commands

Open Terminal and run:

```bash
# Navigate to your project
cd "/Users/rlagurege/Tattoo studios/apt-studio-site"

# Add GitHub as remote (replace rlagurege if your username is different)
git remote add origin https://github.com/rlagurege/apt-studio-site.git

# Push to GitHub
git push -u origin main
```

## Step 4: Authentication

When you run `git push`, you'll be asked for credentials:

**Option A: Personal Access Token (Easiest)**

1. **Create Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Name: `APT Studio Site`
   - Expiration: `90 days` (or your choice)
   - Select scope: ✅ **`repo`** (full control)
   - Click "Generate token"
   - **COPY THE TOKEN** (you won't see it again!)

2. **Use Token:**
   - When `git push` asks for password:
   - Username: `rlagurege` (your GitHub username)
   - Password: **paste the token** (not your GitHub password)

**Option B: SSH (Better for long-term)**

If you prefer SSH, I can help you set that up.

## Step 5: Verify

After pushing successfully:

1. Go to: https://github.com/rlagurege/apt-studio-site
2. You should see all your files
3. Latest commit: "Initial commit: APT Studio website..."

## ✅ Quick Checklist

- [ ] Created repository on GitHub
- [ ] Copied repository URL
- [ ] Ran `git remote add origin https://github.com/rlagurege/apt-studio-site.git`
- [ ] Ran `git push -u origin main`
- [ ] Entered credentials (username + token)
- [ ] Verified files are on GitHub

## 🆘 Troubleshooting

### "Repository not found"
- Make sure repository exists: https://github.com/rlagurege/apt-studio-site
- Check repository name matches exactly

### "Authentication failed"
- Use Personal Access Token, not password
- Make sure token has `repo` scope

### "Remote origin already exists"
```bash
# Remove existing remote
git remote remove origin

# Add again
git remote add origin https://github.com/rlagurege/apt-studio-site.git
```

### "Permission denied"
- Check your GitHub username is correct
- Make sure you have access to the repository
- Try using SSH instead: `git@github.com:rlagurege/apt-studio-site.git`

## 🎯 Next Steps After GitHub

Once code is on GitHub:

1. **Deploy to Vercel:**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import from GitHub
   - Select `apt-studio-site`
   - Deploy!

2. **Add Domain:**
   - In Vercel → Settings → Domains
   - Add `addictivepaintattoo.studio`
   - Get DNS records
   - Add DNS records in Squarespace

## Need Help?

Share:
- Any error messages you see
- Whether repository was created successfully
- Your GitHub username (if different from rlagurege)

I'll help you troubleshoot!
