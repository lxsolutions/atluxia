#!/bin/bash
# Final GitHub push attempt script for PolyVerse v0.3

echo "🚀 Attempting to push PolyVerse v0.3 to GitHub..."

# Method 1: Direct token authentication
echo "🔐 Method 1: Direct token authentication"
git remote set-url origin https://x-access-token:${GITHUB_TOKEN}@github.com/lxsolutions/polyverse.git
git push origin monorepo/consolidation && echo "✅ Success!" && exit 0

# Method 2: Username token format
echo "🔐 Method 2: Username token format"
git remote set-url origin https://token:${GITHUB_TOKEN}@github.com/lxsolutions/polyverse.git
git push origin monorepo/consolidation && echo "✅ Success!" && exit 0

# Method 3: GitHub CLI with token
echo "🔐 Method 3: GitHub CLI"
GITHUB_TOKEN="$GITHUB_TOKEN" gh api repos/lxsolutions/polyverse -q '.html_url' && \
GITHUB_TOKEN="$GITHUB_TOKEN" gh pr create --title "PolyVerse v0.3" --body "Complete implementation" --head monorepo/consolidation --base main && echo "✅ Success!" && exit 0

# Method 4: Credential helper
echo "🔐 Method 4: Credential helper"
echo "https://token:${GITHUB_TOKEN}@github.com" > ~/.git-credentials
git config --global credential.helper 'store --file ~/.git-credentials'
git push origin monorepo/consolidation && echo "✅ Success!" && exit 0

# Method 5: Manual repository creation instructions
echo "❌ All authentication methods failed."
echo ""
echo "📋 MANUAL DEPLOYMENT INSTRUCTIONS:"
echo "1. Create new repository on GitHub: https://github.com/new"
echo "2. Name it 'polyverse' and make it public"
echo "3. Clone it locally: git clone https://github.com/YOUR_USERNAME/polyverse.git"
echo "4. Copy files: cp -r /workspace/polyverse/* ."
echo "5. Remove old .git: rm -rf .git && git init"
echo "6. Commit and push: git add . && git commit -m 'PolyVerse v0.3' && git push"
echo ""
echo "📦 OR use deployment package:"
echo "File: /workspace/polyverse_v0.3_complete_20250925_092519.tar.gz"
echo "Size: $(du -h /workspace/polyverse_v0.3_complete_20250925_092519.tar.gz | cut -f1)"
echo "Files: $(tar -tzf /workspace/polyverse_v0.3_complete_20250925_092519.tar.gz | wc -l)"

exit 1