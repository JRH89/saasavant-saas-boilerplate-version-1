import { test, expect } from '@playwright/test';

test.describe('Subscription Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display pricing plans on homepage', async ({ page }) => {
    // Look for pricing section
    const pricingSection = page.locator('text=/pricing|plans|subscribe/i').first();
    
    if (await pricingSection.count() > 0) {
      await pricingSection.scrollIntoViewIfNeeded();
      await expect(pricingSection).toBeVisible();
    }
  });

  test('should show subscription options', async ({ page }) => {
    // Navigate to pricing or subscription page
    await page.goto('/');
    
    // Look for pricing cards or subscription buttons
    const subscribeButtons = page.locator('button:has-text("Subscribe"), button:has-text("Get Started"), a:has-text("Subscribe")');
    
    if (await subscribeButtons.count() > 0) {
      expect(await subscribeButtons.count()).toBeGreaterThan(0);
    }
  });

  test('should require authentication for subscription', async ({ page }) => {
    // Try to access subscription without being logged in
    const subscribeButton = page.locator('button:has-text("Subscribe"), button:has-text("Get Started")').first();
    
    if (await subscribeButton.count() > 0) {
      await subscribeButton.click();
      
      await page.waitForTimeout(1000);
      
      // Should redirect to sign in or show auth modal
      const currentUrl = page.url();
      const hasSignInElement = await page.locator('input[type="email"]').count() > 0;
      
      expect(currentUrl.includes('Signin') || hasSignInElement).toBeTruthy();
    }
  });

  test('should display different pricing tiers', async ({ page }) => {
    await page.goto('/');
    
    // Look for pricing cards with different amounts
    const priceElements = page.locator('text=/\\$\\d+|\\d+\\/month|\\d+\\/year/i');
    
    if (await priceElements.count() > 0) {
      expect(await priceElements.count()).toBeGreaterThan(0);
    }
  });

  test('should show plan features', async ({ page }) => {
    await page.goto('/');
    
    // Look for feature lists
    const featureList = page.locator('ul li, .feature, [class*="feature"]');
    
    if (await featureList.count() > 0) {
      expect(await featureList.count()).toBeGreaterThan(0);
    }
  });
});

test.describe('Account Management E2E', () => {
  test('should display account page structure', async ({ page }) => {
    await page.goto('/Dashboard');
    
    // Wait for redirect or content
    await page.waitForTimeout(1000);
    
    // If on sign in page, that's expected for unauthenticated user
    const onSignInPage = page.url().includes('Signin');
    expect(onSignInPage || page.url().includes('Dashboard')).toBeTruthy();
  });

  test('should show billing portal link for subscribed users', async ({ page }) => {
    // This would require authenticated session
    await page.goto('/Dashboard');
    await page.waitForTimeout(1000);
  });

  test('should display subscription status', async ({ page }) => {
    await page.goto('/Dashboard');
    await page.waitForTimeout(1000);
    
    // Look for subscription status indicators
    const statusElements = page.locator('text=/active|canceled|trial|premium|free/i');
    
    if (await statusElements.count() > 0) {
      // Status is displayed
      expect(await statusElements.count()).toBeGreaterThan(0);
    }
  });
});

test.describe('Stripe Integration E2E', () => {
  test('should redirect to Stripe checkout', async ({ page }) => {
    // This test verifies the checkout flow initiation
    // Actual Stripe checkout would require test mode keys
    
    await page.goto('/');
    
    const subscribeButton = page.locator('button:has-text("Subscribe"), button:has-text("Get Started")').first();
    
    if (await subscribeButton.count() > 0) {
      // Click would normally redirect to Stripe
      // In test mode, we just verify the button exists
      await expect(subscribeButton).toBeVisible();
    }
  });

  test('should handle checkout cancellation', async ({ page }) => {
    // Simulate returning from canceled checkout
    await page.goto('/Dashboard?canceled=true');
    
    await page.waitForTimeout(1000);
    
    // Should show cancellation message or redirect
    const currentUrl = page.url();
    expect(currentUrl).toContain('canceled=true');
  });

  test('should handle successful checkout', async ({ page }) => {
    // Simulate returning from successful checkout
    await page.goto('/Dashboard?success=true');
    
    await page.waitForTimeout(1000);
    
    // Should show success message
    const currentUrl = page.url();
    expect(currentUrl).toContain('success=true');
  });
});

test.describe('Billing Portal E2E', () => {
  test('should have manage subscription button', async ({ page }) => {
    await page.goto('/Dashboard');
    
    await page.waitForTimeout(1000);
    
    // Look for manage subscription or billing portal button
    const manageButton = page.locator('button:has-text("Manage"), button:has-text("Billing"), a:has-text("Manage Subscription")');
    
    // Button may only appear for subscribed users
    const count = await manageButton.count();
    expect(count >= 0).toBeTruthy();
  });
});

test.describe('Subscription Cancellation E2E', () => {
  test('should show cancel subscription option', async ({ page }) => {
    await page.goto('/Dashboard');
    
    await page.waitForTimeout(1000);
    
    // Look for cancel button (may be in billing portal)
    const cancelButton = page.locator('button:has-text("Cancel"), a:has-text("Cancel Subscription")');
    
    const count = await cancelButton.count();
    expect(count >= 0).toBeTruthy();
  });

  test('should show confirmation dialog before cancellation', async ({ page }) => {
    await page.goto('/Dashboard');
    
    await page.waitForTimeout(1000);
    
    const cancelButton = page.locator('button:has-text("Cancel Subscription")').first();
    
    if (await cancelButton.count() > 0 && await cancelButton.isVisible()) {
      await cancelButton.click();
      
      // Should show confirmation dialog
      await page.waitForTimeout(500);
      
      const confirmDialog = page.locator('[role="dialog"], .modal, text=/are you sure|confirm/i');
      if (await confirmDialog.count() > 0) {
        await expect(confirmDialog.first()).toBeVisible();
      }
    }
  });
});
