

import { test, expect } from '@playwright/test';

test.describe('Auth Guards Integration Tests', () => {
  test('should show sign in page when accessing host dashboard unauthenticated', async ({ page }) => {
    // Navigate to host dashboard
    await page.goto('/stays/host/dashboard');

    // Should show sign in prompt
    await expect(page.locator('text=Please sign in to access the host dashboard')).toBeVisible();
    await expect(page.locator('text=Sign In')).toBeVisible();
  });

  test('should show Stripe Connect setup when authenticated as host', async ({ page }) => {
    // Mock authentication by setting session cookie
    await page.context().addCookies([{
      name: 'next-auth.session-token',
      value: 'mock-session-token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
    }]);

    // Navigate to host dashboard
    await page.goto('/stays/host/dashboard');

    // Should show Connect setup card
    await expect(page.locator('text=Stripe Connect Setup')).toBeVisible();
    await expect(page.locator('text=Set up your Stripe Connect account')).toBeVisible();
  });

  test('should handle authentication errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/stripe/connect-status', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'User not authenticated'
        })
      });
    });

    // Navigate to host dashboard
    await page.goto('/stays/host/dashboard');

    // Should show sign in prompt
    await expect(page.locator('text=Please sign in to access the host dashboard')).toBeVisible();
  });
});

