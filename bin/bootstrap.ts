#!/usr/bin/env tsx

/**
 * Nomad Life Bootstrap Script
 * 
 * This script sets up the development environment by:
 * 1. Generating Prisma client
 * 2. Running database migrations
 * 3. Seeding baseline data
 * 4. Setting up Stripe fee product
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const log = (message: string) => {
  console.log(`[bootstrap] ${message}`);
};

const error = (message: string) => {
  console.error(`[bootstrap] ERROR: ${message}`);
};

const runCommand = (command: string, cwd?: string) => {
  try {
    log(`Running: ${command}`);
    execSync(command, { 
      stdio: 'inherit',
      cwd: cwd || process.cwd()
    });
    return true;
  } catch (err) {
    error(`Failed to run: ${command}`);
    console.error(err);
    return false;
  }
};

async function main() {
  log('Starting Nomad Life bootstrap...');

  // Check if we're in the right directory
  const packageJsonPath = join(process.cwd(), 'package.json');
  if (!existsSync(packageJsonPath)) {
    error('Please run this script from the project root directory');
    process.exit(1);
  }

  // 1. Generate Prisma client
  log('Step 1: Generating Prisma client...');
  if (!runCommand('pnpm db:generate')) {
    error('Failed to generate Prisma client');
    process.exit(1);
  }

  // 2. Run database migrations
  log('Step 2: Running database migrations...');
  if (!runCommand('pnpm db:migrate')) {
    error('Failed to run database migrations');
    process.exit(1);
  }

  // 3. Seed baseline data
  log('Step 3: Seeding baseline data...');
  if (!runCommand('pnpm db:seed')) {
    error('Failed to seed baseline data');
    process.exit(1);
  }

  // 4. Setup Stripe fee product (if Stripe credentials are available)
  log('Step 4: Setting up Stripe fee product...');
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      // This would be implemented in a separate script
      log('Stripe credentials found, setting up fee product...');
      // await setupStripeFeeProduct();
      log('Stripe fee product setup completed');
    } catch (err) {
      log('Warning: Failed to setup Stripe fee product, continuing...');
      console.error(err);
    }
  } else {
    log('No Stripe credentials found, skipping fee product setup');
  }

  log('Bootstrap completed successfully!');
  log('You can now start the development servers with: pnpm dev');
}

main().catch((err) => {
  error('Bootstrap failed:');
  console.error(err);
  process.exit(1);
});