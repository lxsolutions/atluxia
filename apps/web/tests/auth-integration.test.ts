


import { test, expect } from '@playwright/test';

test.describe('Authentication Integration Tests', () => {
  test('should show sign in page when accessing host dashboard unauthenticated', async ({ page }) => {
    // Navigate to host dashboard
    await page.goto('/stays/host/dashboard');

    // Should show sign in prompt
    await expect(page.getByText('Please sign in to access the host dashboard.')).toBeVisible();
    // Should show sign in link (more specific)
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
  });

  test('should show host dashboard with sign in prompt', async ({ page }) => {
    // Navigate to host dashboard
    await page.goto('/stays/host/dashboard');

    // Should show host dashboard heading (more specific)
    await expect(page.getByRole('heading', { name: 'Host Dashboard' })).toBeVisible();
    // Should show sign in prompt
    await expect(page.getByText('Please sign in to access the host dashboard')).toBeVisible();
  });

  test('should have working sign in page', async ({ page }) => {
    // Navigate to sign in page
    await page.goto('/auth/signin');

    // Should show sign in form
    await expect(page.getByRole('heading', { name: 'Sign in to Nomad Life' })).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send magic link' })).toBeVisible();
  });

  test('should show Google and Apple sign in options', async ({ page }) => {
    // Navigate to sign in page
    await page.goto('/auth/signin');

    // Should show social login options
    await expect(page.locator('button', { hasText: 'Google' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Apple' })).toBeVisible();
  });
});


