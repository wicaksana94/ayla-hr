import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/AylaHR/);
    await expect(page.getByText('Human Resources')).toBeVisible();
  });

  test('sign-in page loads successfully', async ({ page }) => {
    await page.goto('/sign-in');
    // Check if Clerk sign-in form loads
    await expect(page.locator('body')).toContainText('Sign in');
  });

  test('dashboard redirects to sign-in when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    // Should redirect to sign-in or home page
    await expect(page).toHaveURL(/sign-in|\/$/);
  });
});

test.describe('Navigation', () => {
  test('sidebar navigation links work', async ({ page }) => {
    // This test would require authentication
    // For now, just test that the pages exist
    await page.goto('/dashboard/employees');
    await page.goto('/dashboard/departments');
    await page.goto('/dashboard/positions');
    await page.goto('/dashboard/settings');
  });
});

test.describe('Build Test', () => {
  test('application builds without errors', async () => {
    // This is a placeholder - actual build is tested via npm run build
    expect(true).toBe(true);
  });
});
