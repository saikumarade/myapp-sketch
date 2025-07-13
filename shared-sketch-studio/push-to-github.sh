#!/bin/bash

echo "🚀 Shared Sketch Studio - GitHub Push Helper"
echo "============================================="
echo ""

# Check if repository URL is provided
if [ -z "$1" ]; then
    echo "❌ Please provide your GitHub repository URL"
    echo ""
    echo "Usage: ./push-to-github.sh https://github.com/YOUR_USERNAME/shared-sketch-studio.git"
    echo ""
    echo "📝 Steps to create repository:"
    echo "1. Go to https://github.com/new"
    echo "2. Repository name: shared-sketch-studio"
    echo "3. Make it Public"
    echo "4. Don't initialize with README (we already have one)"
    echo "5. Click 'Create repository'"
    echo "6. Copy the repository URL and run this script again"
    exit 1
fi

REPO_URL=$1

echo "✅ Repository URL: $REPO_URL"
echo ""

# Add remote origin
echo "🔗 Adding remote origin..."
git remote add origin $REPO_URL

# Push to GitHub
echo "📤 Pushing code to GitHub..."
git push -u origin main

echo ""
echo "🎉 Success! Your code has been pushed to GitHub!"
echo "🌐 You can now view your repository at: $REPO_URL"
echo ""
echo "📋 Next steps:"
echo "1. Clone the repository on other devices: git clone $REPO_URL"
echo "2. Install dependencies: npm install"
echo "3. Start the server: npm run dev"
echo "4. Access via network IP for multiplayer testing" 