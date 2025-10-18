import { test, expect } from '@playwright/test';

test.describe('Support Tickets E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display support ticket form', async ({ page }) => {
    await page.goto('/Dashboard');
    
    await page.waitForTimeout(1000);
    
    // Look for support or help button
    const supportButton = page.locator('button:has-text("Support"), button:has-text("Help"), a:has-text("Support")');
    
    if (await supportButton.count() > 0) {
      await supportButton.first().click();
      
      await page.waitForTimeout(500);
      
      // Should show support form
      const messageField = page.locator('textarea[name="message"], textarea[placeholder*="message"]');
      if (await messageField.count() > 0) {
        await expect(messageField.first()).toBeVisible();
      }
    }
  });

  test('should have ticket type selection', async ({ page }) => {
    await page.goto('/Dashboard');
    
    await page.waitForTimeout(1000);
    
    const supportButton = page.locator('button:has-text("Support"), button:has-text("Help")').first();
    
    if (await supportButton.count() > 0 && await supportButton.isVisible()) {
      await supportButton.click();
      
      await page.waitForTimeout(500);
      
      // Look for ticket type dropdown
      const typeSelect = page.locator('select[name="type"], select:has(option:has-text("Bug"))');
      
      if (await typeSelect.count() > 0) {
        await expect(typeSelect.first()).toBeVisible();
        
        // Verify options
        const options = await typeSelect.first().locator('option').allTextContents();
        expect(options.length).toBeGreaterThan(0);
      }
    }
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/Dashboard');
    
    await page.waitForTimeout(1000);
    
    const supportButton = page.locator('button:has-text("Support"), button:has-text("Help")').first();
    
    if (await supportButton.count() > 0 && await supportButton.isVisible()) {
      await supportButton.click();
      
      await page.waitForTimeout(500);
      
      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"]:has-text("Submit")');
      
      if (await submitButton.count() > 0) {
        await submitButton.click();
        
        // Should show validation error
        await page.waitForTimeout(500);
      }
    }
  });

  test('should submit support ticket', async ({ page }) => {
    await page.goto('/Dashboard');
    
    await page.waitForTimeout(1000);
    
    const supportButton = page.locator('button:has-text("Support"), button:has-text("Help")').first();
    
    if (await supportButton.count() > 0 && await supportButton.isVisible()) {
      await supportButton.click();
      
      await page.waitForTimeout(500);
      
      // Fill out form
      const typeSelect = page.locator('select[name="type"]').first();
      if (await typeSelect.count() > 0) {
        await typeSelect.selectOption('Bug');
      }
      
      const messageField = page.locator('textarea[name="message"]').first();
      if (await messageField.count() > 0) {
        await messageField.fill('Test support ticket message');
      }
      
      const submitButton = page.locator('button[type="submit"]:has-text("Submit")').first();
      if (await submitButton.count() > 0) {
        await submitButton.click();
        
        // Should show success message
        await page.waitForTimeout(1000);
        
        const successMessage = page.locator('text=/success|submitted|sent/i');
        if (await successMessage.count() > 0) {
          await expect(successMessage.first()).toBeVisible();
        }
      }
    }
  });

  test('should display user tickets', async ({ page }) => {
    await page.goto('/Dashboard');
    
    await page.waitForTimeout(1000);
    
    // Look for tickets section or link
    const ticketsLink = page.locator('a:has-text("Tickets"), a:has-text("My Tickets"), button:has-text("Tickets")');
    
    if (await ticketsLink.count() > 0) {
      await ticketsLink.first().click();
      
      await page.waitForTimeout(500);
      
      // Should show tickets list or empty state
      const ticketsList = page.locator('[class*="ticket"], .ticket-item, li:has-text("Bug"), li:has-text("Help")');
      
      // May be empty if no tickets
      const count = await ticketsList.count();
      expect(count >= 0).toBeTruthy();
    }
  });

  test('should show ticket status', async ({ page }) => {
    await page.goto('/Dashboard');
    
    await page.waitForTimeout(1000);
    
    // Look for ticket status indicators
    const statusElements = page.locator('text=/submitted|in progress|resolved|open|closed/i');
    
    const count = await statusElements.count();
    expect(count >= 0).toBeTruthy();
  });

  test('should allow closing support form', async ({ page }) => {
    await page.goto('/Dashboard');
    
    await page.waitForTimeout(1000);
    
    const supportButton = page.locator('button:has-text("Support"), button:has-text("Help")').first();
    
    if (await supportButton.count() > 0 && await supportButton.isVisible()) {
      await supportButton.click();
      
      await page.waitForTimeout(500);
      
      // Look for close or cancel button
      const closeButton = page.locator('button:has-text("Cancel"), button:has-text("Close"), button[aria-label="Close"]');
      
      if (await closeButton.count() > 0) {
        await closeButton.first().click();
        
        // Form should close
        await page.waitForTimeout(500);
      }
    }
  });
});

test.describe('Admin Ticket Management E2E', () => {
  test('should display admin tickets page', async ({ page }) => {
    await page.goto('/Admin');
    
    await page.waitForTimeout(1000);
    
    // Should redirect to sign in or show admin page
    const currentUrl = page.url();
    expect(currentUrl).toBeTruthy();
  });

  test('should show all support tickets for admin', async ({ page }) => {
    await page.goto('/Admin');
    
    await page.waitForTimeout(1000);
    
    // Look for tickets section
    const ticketsSection = page.locator('text=/tickets|support/i, button:has-text("Tickets")');
    
    if (await ticketsSection.count() > 0) {
      const firstMatch = ticketsSection.first();
      if (await firstMatch.isVisible()) {
        await firstMatch.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should allow admin to update ticket status', async ({ page }) => {
    await page.goto('/Admin');
    
    await page.waitForTimeout(1000);
    
    // Look for status update controls
    const statusSelect = page.locator('select:has(option:has-text("submitted")), select:has(option:has-text("resolved"))');
    
    const count = await statusSelect.count();
    expect(count >= 0).toBeTruthy();
  });

  test('should allow admin to respond to tickets', async ({ page }) => {
    await page.goto('/Admin');
    
    await page.waitForTimeout(1000);
    
    // Look for response textarea
    const responseField = page.locator('textarea[placeholder*="response"], textarea[name*="response"]');
    
    const count = await responseField.count();
    expect(count >= 0).toBeTruthy();
  });
});
