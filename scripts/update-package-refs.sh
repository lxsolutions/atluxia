#!/bin/bash

# Script to update package references in the Atluxia monorepo

echo "🔄 Updating package references..."

# Update @nomad-life references to @atluxia
find apps services packages -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" | \
  xargs sed -i 's/@nomad-life\//@atluxia\//g'

# Update @polyverse references to @atluxia
find apps services packages -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" | \
  xargs sed -i 's/@polyverse\//@atluxia\//g'

# Update @everpath references to @atluxia
find apps services packages -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" | \
  xargs sed -i 's/@everpath\//@atluxia\//g'

# Update @curio-critters references to @atluxia
find apps services packages -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" | \
  xargs sed -i 's/@curio-critters\//@atluxia\//g'

echo "✅ Package references updated!"