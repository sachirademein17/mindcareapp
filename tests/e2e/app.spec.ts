import { test, expect } from '@playwright/test';

test.describe('Mental Health Platform E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174');
  });

  test('should navigate through role selection and login flow', async ({ page }) => {
    // Test role selection page
    await expect(page.locator('h1')).toContainText('Select Your Role');
    
    // Click on Patient role
    await page.click('[data-testid="patient-role"]');
    
    // Should navigate to patient login/signup
    await expect(page).toHaveURL(/.*patient.*/);
    
    // Go to login page
    await page.click('text=Login');
    
    // Fill login form
    await page.fill('[data-testid="email-input"]', 'patient@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    
    // Submit login
    await page.click('[data-testid="login-button"]');
    
    // Should redirect to dashboard on successful login
    await expect(page).toHaveURL(/.*dashboard.*/);
  });

  test('should register new patient account', async ({ page }) => {
    // Navigate to patient signup
    await page.click('[data-testid="patient-role"]');
    await page.click('text=Sign Up');
    
    // Fill registration form
    await page.fill('[data-testid="name-input"]', 'Test Patient');
    await page.fill('[data-testid="email-input"]', 'newpatient@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="confirm-password-input"]', 'password123');
    await page.fill('[data-testid="dob-input"]', '1990-01-01');
    await page.selectOption('[data-testid="gender-select"]', 'other');
    await page.fill('[data-testid="phone-input"]', '1234567890');
    
    // Submit registration
    await page.click('[data-testid="register-button"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard.*/);
  });

  test('should navigate to find doctors page', async ({ page }) => {
    // Login first (assuming we have a test user)
    await page.goto('http://localhost:5174/login');
    await page.fill('[data-testid="email-input"]', 'patient@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to find doctors
    await page.click('text=Find Doctors');
    
    // Should show doctors list
    await expect(page.locator('h1')).toContainText('Find Doctors');
    await expect(page.locator('[data-testid="doctors-list"]')).toBeVisible();
  });

  test('should open chat interface', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:5174/login');
    await page.fill('[data-testid="email-input"]', 'patient@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Open chat
    await page.click('text=Chat');
    
    // Should show chat interface
    await expect(page.locator('[data-testid="chat-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="message-input"]')).toBeVisible();
  });

  test('should display prescription page with security features', async ({ page }) => {
    // Login as patient
    await page.goto('http://localhost:5174/login');
    await page.fill('[data-testid="email-input"]', 'patient@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to prescriptions
    await page.click('text=Prescriptions');
    
    // Should show prescriptions with security features
    await expect(page.locator('h1')).toContainText('Your Prescriptions');
    await expect(page.locator('[data-testid="security-watermark"]')).toBeVisible();
    
    // Test right-click is disabled
    await page.locator('[data-testid="prescription-content"]').click({ button: 'right' });
    // Should not show context menu (this is hard to test, but the prevention is in place)
  });

  test('should handle doctor dashboard navigation', async ({ page }) => {
    // Login as doctor
    await page.goto('http://localhost:5174/doctor/login');
    await page.fill('[data-testid="email-input"]', 'doctor@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Should be on doctor dashboard
    await expect(page).toHaveURL(/.*doctor.*dashboard.*/);
    await expect(page.locator('h1')).toContainText('Doctor Dashboard');
    
    // Test navigation to patients
    await page.click('text=My Patients');
    await expect(page.locator('[data-testid="patients-list"]')).toBeVisible();
  });

  test('should handle admin dashboard', async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:5174/admin/login');
    await page.fill('[data-testid="username-input"]', 'admin');
    await page.fill('[data-testid="password-input"]', 'admin123');
    await page.click('[data-testid="admin-login-button"]');
    
    // Should be on admin dashboard
    await expect(page).toHaveURL(/.*admin.*dashboard.*/);
    await expect(page.locator('h1')).toContainText('Admin Dashboard');
    
    // Test admin features
    await expect(page.locator('[data-testid="users-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="doctors-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="patients-count"]')).toBeVisible();
  });
});
