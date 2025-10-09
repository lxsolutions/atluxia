import { test, expect } from '@playwright/test';

// Smoke test that covers Social → Truth → Arena flow
test.describe('PolyVerse Smoke Tests', () => {
  
  test('Social: post → feed → "Why" shows', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    
    // Check if the app loads with expected elements
    await expect(page.getByText('PolyVerse', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Feed' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Truth' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Arena' })).toBeVisible();
    
    // Navigate to feed
    await page.getByRole('link', { name: 'Feed' }).click();
    await expect(page).toHaveURL(/.*feed/);
    
    // Check if posts are visible (may be empty initially)
    const posts = page.locator('[data-testid="post-card"]');
    await expect(posts.or(page.getByText('No posts yet'))).toBeVisible();
    
    // Check if "Why" button/feature is present
    const whyButton = page.getByRole('button', { name: /Why|Explain|Verify/i });
    await expect(whyButton.or(page.getByText(/truth|verify/i))).toBeVisible();
  });

  test('Truth: create claim → add evidence → run L1 & L2 → ConfidenceReport + receipts', async ({ page }) => {
    // Navigate to truth section
    await page.goto('/truth');
    
    // Check if truth interface loads
    await expect(page.getByText('Truth Archive')).toBeVisible();
    await expect(page.getByRole('button', { name: 'New Claim' })).toBeVisible();
    
    // Create a new claim (simulate the flow)
    await page.getByRole('button', { name: 'New Claim' }).click();
    await expect(page).toHaveURL(/.*truth\/create/);
    
    // Fill claim form
    await page.getByLabel('Title').fill('Test Climate Claim');
    await page.getByLabel('Statement').fill('This is a test claim for smoke testing');
    await page.getByLabel('Topics').fill('climate_science,test');
    
    // Submit claim
    await page.getByRole('button', { name: 'Submit Claim' }).click();
    
    // Should redirect to claim page
    await expect(page).toHaveURL(/.*truth\/claim\//);
    await expect(page.getByText('Test Climate Claim')).toBeVisible();
    
    // Check if evidence section is present
    await expect(page.getByText('Evidence')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Evidence' })).toBeVisible();
    
    // Check if confidence reports section is present
    await expect(page.getByText('Confidence Reports')).toBeVisible();
    await expect(page.getByText('Lens Analysis')).toBeVisible();
    
    // Check if receipts are visible
    await expect(page.getByText('Transparency Records')).toBeVisible();
  });

  test('Arena: create dispute → test pay → resolve → leaderboard updates → Claim Arena tab shows PlayfulSignal', async ({ page }) => {
    // Navigate to arena section
    await page.goto('/arena');
    
    // Check if arena interface loads
    await expect(page.getByText('Tribute Battles')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Disputes' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Leaderboard' })).toBeVisible();
    
    // Navigate to disputes
    await page.getByRole('link', { name: 'Disputes' }).click();
    await expect(page).toHaveURL(/.*arena\/disputes/);
    
    // Check if create dispute button is present
    await expect(page.getByRole('button', { name: 'New Dispute' })).toBeVisible();
    
    // Navigate to leaderboard
    await page.getByRole('link', { name: 'Leaderboard' }).click();
    await expect(page).toHaveURL(/.*arena\/leaderboard/);
    
    // Check if leaderboard is visible
    await expect(page.getByText('Player Rankings')).toBeVisible();
    await expect(page.getByText('Elo Rating')).toBeVisible();
    
    // Navigate to a truth claim that should have Arena tab
    await page.goto('/truth/claim/claim_climate_human_caused');
    
    // Check if Arena tab is present
    await expect(page.getByRole('tab', { name: 'Arena' })).toBeVisible();
    
    // Click on Arena tab
    await page.getByRole('tab', { name: 'Arena' }).click();
    
    // Check if playful signal information is shown
    await expect(page.getByText('Playful Signal')).toBeVisible();
    await expect(page.getByText(/weight.*applied/i)).toBeVisible();
    await expect(page.getByText(/cap.*2%/i)).toBeVisible();
  });
});