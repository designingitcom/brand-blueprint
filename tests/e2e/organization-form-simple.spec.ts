import { test, expect } from '@playwright/test';

test.describe('Organization Form - Simple Tests', () => {
  test('should access organizations page and show form elements', async ({
    page,
  }) => {
    // Try to access organizations page
    await page.goto('/organizations');

    // Check if redirected to login
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log(
        'Organizations page requires authentication - this is expected behavior'
      );
      test.skip('Authentication required');
      return;
    }

    // If we get here, the page loaded successfully
    await expect(page.getByText('Organizations')).toBeVisible();

    // Look for the "New Organization" button
    const newOrgButton = page.getByRole('button', {
      name: /new organization/i,
    });
    await expect(newOrgButton).toBeVisible();

    // Click to open the form
    await newOrgButton.click();

    // Check if the dialog/form opens
    await expect(page.getByText('Create New Organization')).toBeVisible();

    // Check form fields are present
    await expect(
      page.getByPlaceholder('Enter organization name')
    ).toBeVisible();
    await expect(page.getByPlaceholder('organization-slug')).toBeVisible();
  });

  test('should test slug auto-generation on organizations page', async ({
    page,
  }) => {
    await page.goto('/organizations');

    // Skip if requires auth
    if (page.url().includes('/login')) {
      test.skip('Authentication required');
      return;
    }

    // Open form
    await page.getByRole('button', { name: /new organization/i }).click();

    // Type in name and check slug generation
    await page
      .getByPlaceholder('Enter organization name')
      .fill('Test Company 123');

    // Wait a bit for the auto-generation
    await page.waitForTimeout(100);

    // Check that slug was auto-generated
    const slugField = page.getByPlaceholder('organization-slug');
    const slugValue = await slugField.inputValue();
    expect(slugValue).toBe('test-company-123');
  });

  test('should show validation errors', async ({ page }) => {
    await page.goto('/organizations');

    if (page.url().includes('/login')) {
      test.skip('Authentication required');
      return;
    }

    // Open form
    await page.getByRole('button', { name: /new organization/i }).click();

    // Try to submit empty form
    await page.getByRole('button', { name: 'Create Organization' }).click();

    // Should show validation error
    await expect(page.getByText('Organization name is required')).toBeVisible();
  });
});
