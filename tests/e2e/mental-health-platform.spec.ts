// E2E Tests using Playwright
// Free Testing Tool: Playwright (https://playwright.dev/)

import { test, expect } from '@playwright/test';

test.describe('Mental Health Platform E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5173');
  });

  test.describe('User Registration Flow', () => {
    test('should complete user registration successfully', async ({ page }) => {
      // Navigate to registration page
      await page.click('text=Sign Up');
      await expect(page).toHaveURL(/.*register/);

      // Fill registration form
      await page.fill('[data-testid="firstName"]', 'John');
      await page.fill('[data-testid="lastName"]', 'Doe');
      await page.fill('[data-testid="email"]', 'john.doe@example.com');
      await page.fill('[data-testid="password"]', 'SecurePass123!');
      await page.fill('[data-testid="confirmPassword"]', 'SecurePass123!');

      // Submit form
      await page.click('[data-testid="register-button"]');

      // Verify success
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Registration successful');
    });

    test('should show validation errors for invalid input', async ({ page }) => {
      await page.click('text=Sign Up');
      
      // Try to submit empty form
      await page.click('[data-testid="register-button"]');

      // Check for validation errors
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
    });

    test('should validate password strength', async ({ page }) => {
      await page.click('text=Sign Up');
      
      // Enter weak password
      await page.fill('[data-testid="password"]', '123');
      await page.locator('[data-testid="password"]').blur();

      // Check password strength indicator
      await expect(page.locator('[data-testid="password-strength"]')).toContainText('Weak');
      await expect(page.locator('[data-testid="password-requirements"]')).toBeVisible();
    });
  });

  test.describe('User Login Flow', () => {
    test('should login with valid credentials', async ({ page }) => {
      // Navigate to login page
      await page.click('text=Log In');
      await expect(page).toHaveURL(/.*login/);

      // Fill login form
      await page.fill('[data-testid="email"]', 'test@example.com');
      await page.fill('[data-testid="password"]', 'TestPass123!');

      // Submit form
      await page.click('[data-testid="login-button"]');

      // Verify successful login
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.click('text=Log In');
      
      // Enter invalid credentials
      await page.fill('[data-testid="email"]', 'invalid@example.com');
      await page.fill('[data-testid="password"]', 'WrongPassword');
      await page.click('[data-testid="login-button"]');

      // Check for error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
    });
  });

  test.describe('Dashboard Functionality', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each dashboard test
      await page.click('text=Log In');
      await page.fill('[data-testid="email"]', 'test@example.com');
      await page.fill('[data-testid="password"]', 'TestPass123!');
      await page.click('[data-testid="login-button"]');
      await expect(page).toHaveURL(/.*dashboard/);
    });

    test('should display user dashboard with key metrics', async ({ page }) => {
      // Check dashboard elements
      await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="mood-tracker"]')).toBeVisible();
      await expect(page.locator('[data-testid="recent-sessions"]')).toBeVisible();
      await expect(page.locator('[data-testid="progress-overview"]')).toBeVisible();
    });

    test('should navigate to mood tracker', async ({ page }) => {
      await page.click('[data-testid="mood-tracker-link"]');
      await expect(page).toHaveURL(/.*mood-tracker/);
      await expect(page.locator('[data-testid="mood-scale"]')).toBeVisible();
    });

    test('should log mood entry', async ({ page }) => {
      await page.click('[data-testid="mood-tracker-link"]');
      
      // Select mood rating
      await page.click('[data-testid="mood-rating-7"]');
      
      // Add notes
      await page.fill('[data-testid="mood-notes"]', 'Feeling good today after morning exercise');
      
      // Submit entry
      await page.click('[data-testid="save-mood-button"]');
      
      // Verify success
      await expect(page.locator('[data-testid="mood-saved-message"]')).toBeVisible();
    });
  });

  test.describe('Accessibility Tests', () => {
    test('should have proper heading structure', async ({ page }) => {
      // Check for proper heading hierarchy
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);
      
      const h1Text = await page.locator('h1').textContent();
      expect(h1Text).toBeTruthy();
    });

    test('should have alt text for images', async ({ page }) => {
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const alt = await images.nth(i).getAttribute('alt');
        expect(alt).toBeTruthy();
      }
    });

    test('should be keyboard navigable', async ({ page }) => {
      // Test tab navigation
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
      
      // Continue tabbing through interactive elements
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        await expect(focused).toBeVisible();
      }
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check mobile navigation
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
      
      // Open mobile menu
      await page.click('[data-testid="mobile-menu-button"]');
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    });

    test('should have readable text on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      
      // Check text is not overlapping
      const textElements = page.locator('p, span, div').filter({ hasText: /.+/ });
      const count = await textElements.count();
      
      for (let i = 0; i < Math.min(count, 10); i++) {
        const element = textElements.nth(i);
        const fontSize = await element.evaluate(el => window.getComputedStyle(el).fontSize);
        const fontSizeValue = parseInt(fontSize);
        expect(fontSizeValue).toBeGreaterThanOrEqual(14); // Minimum readable font size
      }
    });
  });

  test.describe('Performance Tests', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('http://localhost:5173');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    });

    test('should have no console errors', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      await page.goto('http://localhost:5173');
      await page.waitForLoadState('networkidle');
      
      expect(consoleErrors).toHaveLength(0);
    });
  });
});
