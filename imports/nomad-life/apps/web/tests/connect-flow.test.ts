

import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const prisma = new PrismaClient();

test.describe('Stripe Connect Flow E2E Tests', () => {
  let testUserId: string;

  test.beforeEach(async ({ page }) => {
    // Mock authentication for each test
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'test-host-id',
            email: 'test-host@example.com',
            name: 'Test Host',
            role: 'host',
          },
          expires: new Date(Date.now() + 86400000).toISOString(),
        }),
      });
    });

    // Mock Stripe Connect status API
    await page.route('**/api/stripe/connect-status', async (route) => {
      const url = new URL(route.request().url());
      const accountId = url.searchParams.get('mockAccountId');
      
      if (accountId) {
        // Return existing account status
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            accountId: accountId,
            status: 'pending',
            requirements: {
              currently_due: [],
              eventually_due: [],
              past_due: [],
            },
            details_submitted: false,
            payouts_enabled: false,
            charges_enabled: false,
          }),
        });
      } else {
        // Return no account status
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(null),
        });
      }
    });
  });


  test('should show host dashboard when user is authenticated', async ({ page }) => {
    // Mock authentication to return authenticated state
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'test-host-id',
            email: 'test-host@example.com',
            name: 'Test Host',
            role: 'host',
          },
          expires: new Date(Date.now() + 86400000).toISOString(),
        }),
      });
    });

    // Navigate to host dashboard
    await page.goto('/stays/host/dashboard');

    // Wait for loading state to complete
    await page.waitForTimeout(2000);

    // Should show host dashboard heading
    await expect(page.getByRole('heading', { name: 'Host Dashboard' })).toBeVisible();
    // Should show welcome message with user's name
    await expect(page.getByText('Welcome back, Test Host!')).toBeVisible();
    // Should show Stripe Connect setup card
    await expect(page.getByText('Stripe Connect Setup')).toBeVisible();
    // Should show setup message
    await expect(page.getByText('Set up your Stripe Connect account to start receiving payouts for your listings.')).toBeVisible();
    // Should show "Set up Payouts" button
    await expect(page.getByRole('button', { name: 'Set up Payouts' })).toBeVisible();
  });

  test('should show Stripe Connect setup when no account exists', async ({ page }) => {
    // Mock create account API
    await page.route('**/api/stripe/create-connect-account', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accountId: 'acct_test_123',
          email: 'test-host@example.com'
        })
      });
    });

    // Mock account link API
    await page.route('**/api/stripe/create-account-link', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          url: 'https://connect.stripe.com/setup/test'
        })
      });
    });

    // Navigate to host dashboard
    await page.goto('/stays/host/dashboard');

    // Should show Connect setup card
    await expect(page.getByText('Stripe Connect Setup')).toBeVisible();
    await expect(page.getByText('Set up your Stripe Connect account to start receiving payouts for your listings.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Set up Payouts' })).toBeVisible();
  });

  test('should create Connect account when button is clicked', async ({ page }) => {
    // Mock create account API
    await page.route('**/api/stripe/create-connect-account', async (route) => {
      const postData = await route.request().postData();
      const data = JSON.parse(postData || '{}');
      
      // Verify the request contains the correct data
      expect(data.country).toBe('US');
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accountId: 'acct_test_123',
          email: 'test-host@example.com'
        })
      });
    });

    // Mock account link API to not redirect immediately
    await page.route('**/api/stripe/create-account-link', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          url: 'https://connect.stripe.com/setup/test'
        })
      });
    });

    // Prevent navigation to external URLs
    page.on('dialog', dialog => dialog.dismiss());
    page.on('page', popup => popup.close());

    // Navigate to host dashboard
    await page.goto('/stays/host/dashboard');

    // Click the "Set up Payouts" button
    await page.click('text=Set up Payouts');

    // Should show loading state
    await expect(page.getByText('Creating account...')).toBeVisible();
    
    // Wait a bit for the loading state to complete
    await page.waitForTimeout(1000);
  });

  test('should show existing Connect account status', async ({ page }) => {
    // Mock connect status API with existing account
    await page.route('**/api/stripe/connect-status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accountId: 'acct_test_existing',
          status: 'pending',
          details_submitted: false,
          payouts_enabled: false,
          charges_enabled: false,
          requirements: {
            currently_due: ['tos_accepted'],
            eventually_due: [],
            past_due: []
          }
        })
      });
    });

    // Mock account link API
    await page.route('**/api/stripe/create-account-link', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          url: 'https://connect.stripe.com/setup/test'
        })
      });
    });

    // Navigate to host dashboard
    await page.goto('/stays/host/dashboard');

    // Should show existing account status
    await expect(page.getByText('Stripe Connect Setup')).toBeVisible();
    await expect(page.getByText('pending', { exact: true })).toBeVisible(); // Status
    await expect(page.getByText('No')).nth(0).toBeVisible(); // Payouts enabled
    await expect(page.getByText('No')).nth(1).toBeVisible(); // Charges enabled
    await expect(page.getByText('Pending')).toBeVisible(); // Details submitted
    await expect(page.getByRole('button', { name: 'Complete Onboarding' })).toBeVisible();
  });

  test('should handle authentication errors gracefully', async ({ page }) => {
    // Mock authentication to return unauthenticated state
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(null),
      });
    });

    // Mock connect status API to return 401
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
    await expect(page.getByText('Please sign in to access the host dashboard.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock connect status API to return error
    await page.route('**/api/stripe/connect-status', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Failed to fetch Connect account status'
        })
      });
    });

    // Navigate to host dashboard
    await page.goto('/stays/host/dashboard');

    // Should show loading state initially, then potentially error message
    // In a real app, you'd want to show user-friendly error messages
    await expect(page.getByText('Loading...')).not.toBeVisible();
  });
});

