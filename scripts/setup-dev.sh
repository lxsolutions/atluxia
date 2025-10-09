#!/bin/bash

# Atluxia Development Environment Setup Script
# This script sets up the development environment for the Atluxia monorepo

set -e

echo "🚀 Setting up Atluxia Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm 9+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version must be 20 or higher. Current version: $(node -v)"
    exit 1
fi

# Check pnpm version
PNPM_VERSION=$(pnpm -v | cut -d'.' -f1)
if [ "$PNPM_VERSION" -lt 9 ]; then
    echo "❌ pnpm version must be 9 or higher. Current version: $(pnpm -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) and pnpm $(pnpm -v) are compatible"

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update .env with your actual values"
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --force

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
pnpm db:generate

# Build all packages
echo "🔨 Building packages..."
pnpm build

echo ""
echo "🎉 Atluxia development environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your actual values"
echo "2. Start the development environment:"
echo "   - Full development: pnpm dev"
echo "   - Lite mode: pnpm dev:lite"
echo "3. Run database migrations: pnpm db:migrate"
echo "4. Seed the database: pnpm db:seed"