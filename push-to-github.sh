#!/bin/bash
# Script to push code to GitHub

echo "🚀 GitHub Repository Setup"
echo "=========================="
echo ""

# Check if GitHub CLI is installed
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI found!"
    echo ""
    echo "Creating repository on GitHub..."
    gh repo create apt-studio-site --private --source=. --remote=origin --push
    echo ""
    echo "✅ Done! Your code is on GitHub."
    echo "Visit: https://github.com/$(gh api user --jq .login)/apt-studio-site"
else
    echo "📝 GitHub CLI not found. Follow these steps:"
    echo ""
    echo "1. Go to https://github.com and create a new repository:"
    echo "   - Name: apt-studio-site"
    echo "   - Private (recommended)"
    echo "   - DON'T initialize with README"
    echo ""
    echo "2. After creating, run these commands:"
    echo ""
    echo "   git remote add origin https://github.com/YOUR_USERNAME/apt-studio-site.git"
    echo "   git push -u origin main"
    echo ""
    echo "   (Replace YOUR_USERNAME with your GitHub username)"
    echo ""
    echo "3. If you need authentication, use a Personal Access Token:"
    echo "   - GitHub → Settings → Developer settings → Personal access tokens"
    echo "   - Generate new token with 'repo' scope"
    echo "   - Use token as password when pushing"
fi
