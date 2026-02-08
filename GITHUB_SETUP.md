# GitHub Repository Setup

## ✅ Code Committed!

Your code has been committed to git. Now let's create a GitHub repository and push it.

## Step 1: Create GitHub Repository

### Option A: Via GitHub Website (Easiest)

1. **Go to GitHub:**
   - Visit: https://github.com
   - Sign up/login to your account

2. **Create New Repository:**
   - Click the "+" icon (top right)
   - Click "New repository"

3. **Repository Settings:**
   - **Repository name:** `apt-studio-site` (or your choice)
   - **Description:** "Website for Addictive Pain Tattoo (APT Studio) in Gloversville, NY"
   - **Visibility:** Private (recommended) or Public
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

4. **Copy the Repository URL:**
   - GitHub will show you a URL like: `https://github.com/YOUR_USERNAME/apt-studio-site.git`
   - Copy this URL!

### Option B: Via GitHub CLI (If you have it installed)

```bash
cd "/Users/rlagurege/Tattoo studios/apt-studio-site"
gh repo create apt-studio-site --private --source=. --remote=origin --push
```

## Step 2: Connect and Push to GitHub

After creating the repository, run these commands:

```bash
cd "/Users/rlagurege/Tattoo studios/apt-studio-site"

# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/apt-studio-site.git

# Or if you prefer SSH:
# git remote add origin git@github.com:YOUR_USERNAME/apt-studio-site.git

# Push to GitHub
git push -u origin main
```

**If you get an error about authentication:**
- GitHub requires authentication
- Use a Personal Access Token (PAT) instead of password
- Or set up SSH keys

## Step 3: Set Up GitHub Authentication

### Option A: Personal Access Token (Recommended)

1. **Create Token:**
   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token (classic)"
   - Name: "APT Studio Site"
   - Select scopes: `repo` (full control)
   - Click "Generate token"
   - **COPY THE TOKEN** (you won't see it again!)

2. **Use Token:**
   - When pushing, use token as password
   - Username: your GitHub username
   - Password: the token you just created

### Option B: SSH Keys (Better for long-term)

1. **Generate SSH Key:**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   # Press Enter for default location
   # Enter passphrase (optional but recommended)
   ```

2. **Add SSH Key to GitHub:**
   ```bash
   # Copy public key
   cat ~/.ssh/id_ed25519.pub
   # Copy the output
   ```
   
   - GitHub → Settings → SSH and GPG keys → New SSH key
   - Paste the key
   - Click "Add SSH key"

3. **Use SSH URL:**
   ```bash
   git remote set-url origin git@github.com:YOUR_USERNAME/apt-studio-site.git
   git push -u origin main
   ```

## Step 4: Verify Push

After pushing, check:
- Go to your GitHub repository page
- You should see all your files
- Latest commit should show "Initial commit: APT Studio website..."

## Quick Commands Summary

```bash
# Navigate to project
cd "/Users/rlagurege/Tattoo studios/apt-studio-site"

# Check current status
git status

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/apt-studio-site.git

# Push to GitHub
git push -u origin main
```

## Next Steps After GitHub Setup

Once your code is on GitHub:

1. **Deploy to Vercel:**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import from GitHub
   - Select your `apt-studio-site` repository
   - Click "Deploy"

2. **Vercel will:**
   - Auto-detect Next.js
   - Build and deploy automatically
   - Give you a URL

3. **Then configure domain:**
   - Add domain in Vercel
   - Get DNS records
   - Add DNS records in Squarespace

## Troubleshooting

### "Repository not found" error
- Check repository name matches
- Verify you have access to the repo
- Make sure repository exists on GitHub

### Authentication failed
- Use Personal Access Token instead of password
- Or set up SSH keys

### "Remote origin already exists"
```bash
# Remove existing remote
git remote remove origin

# Add new remote
git remote add origin https://github.com/YOUR_USERNAME/apt-studio-site.git
```

## Need Help?

Share:
- Your GitHub username
- Any error messages
- Whether you created the repository

I can help you push the code!
