import { test, expect } from '@playwright/test';

test.describe('Signup Flow', () => {
  test('should successfully sign up a new user', async ({ page }) => {
    // Use a valid email address - you can use florian+test@designingit.com for testing
    // The +test part allows multiple signups with the same base email
    const testEmail = `florian+test${Date.now()}@designingit.com`;
    const testPassword = 'TestPassword123!';

    // Navigate to signup page
    await page.goto('/signup');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Verify we're on the signup page
    await expect(page).toHaveURL(/\/signup/);
    await expect(
      page.getByRole('heading', { name: /Create your account/i })
    ).toBeVisible();

    // Fill in the signup form
    await page.getByLabel('First name').fill('Test');
    await page.getByLabel('Last name').fill('User');
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password').fill(testPassword);

    // Submit the form
    await page.getByRole('button', { name: /Create account/i }).click();

    // Wait for the success message to appear
    // After successful signup, the app shows: "Please check your email to confirm your account before signing in."
    const successMessage = page.getByText(
      'Please check your email to confirm your account before signing in.'
    );

    // Wait for success message with longer timeout
    await expect(successMessage).toBeVisible({ timeout: 10000 });

    // Also verify we're still on the signup page (no redirect)
    await expect(page).toHaveURL(/\/signup/);

    // Verify no error messages are shown
    const errorAlert = page.locator('[role="alert"][class*="destructive"]');
    await expect(errorAlert).not.toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    // Try to submit without filling any fields
    await page.getByRole('button', { name: /Create account/i }).click();

    // Should show validation messages (exact text may vary)
    const hasValidationError = await page
      .getByText(/required|invalid|enter/i)
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    expect(hasValidationError).toBe(true);
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    // Find and click the login link
    await page.getByRole('link', { name: /Sign in/i }).click();

    // Should navigate to login page
    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.getByRole('heading', { name: /Welcome back/i })
    ).toBeVisible();
  });
});
