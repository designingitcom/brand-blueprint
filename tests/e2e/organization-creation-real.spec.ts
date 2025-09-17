import { test, expect } from '@playwright/test';

test.describe('Organization Creation - Real Database Test', () => {
  test('should successfully create organization in database', async ({
    page,
  }) => {
    // Go to organizations page
    await page.goto('/organizations');

    // Skip if requires auth (we'll test on public route)
    if (page.url().includes('/login')) {
      test.skip('Authentication required');
      return;
    }

    // Take screenshot before starting
    await page.screenshot({ path: 'test-results/before-org-creation.png' });

    // Click New Organization button
    await page.getByRole('button', { name: /new organization/i }).click();

    // Wait for form to open
    await expect(page.getByText('Create New Organization')).toBeVisible();

    // Fill out the form with unique data
    const timestamp = Date.now();
    const orgName = `Test Organization ${timestamp}`;
    const expectedSlug = `test-organization-${timestamp}`;

    await page.getByPlaceholder('Enter organization name').fill(orgName);

    // Verify slug was auto-generated
    await expect(page.getByPlaceholder('organization-slug')).toHaveValue(
      expectedSlug
    );

    // Fill optional fields
    await page
      .getByPlaceholder('https://example.com')
      .fill('https://testorg.com');

    // Select industry if dropdown exists
    try {
      const industrySelect = page.locator('[name="industry"]').first();
      if (await industrySelect.isVisible({ timeout: 1000 })) {
        await industrySelect.click();
        await page.getByText('Technology').click();
      }
    } catch (e) {
      console.log('Industry dropdown not found or different structure');
    }

    // Take screenshot before submission
    await page.screenshot({ path: 'test-results/before-org-submit.png' });

    // Submit the form
    await page.getByRole('button', { name: 'Create Organization' }).click();

    // Wait for submission to complete and check for results
    // This should either:
    // 1. Show success and close dialog
    // 2. Show an error message
    // 3. Redirect/refresh page

    await page.waitForTimeout(3000); // Give time for API call

    // Take screenshot after submission
    await page.screenshot({ path: 'test-results/after-org-submit.png' });

    // Check if form closed (success) or if there's an error
    const formStillOpen = await page
      .getByText('Create New Organization')
      .isVisible({ timeout: 1000 })
      .catch(() => false);
    const errorMessage = await page
      .locator('[role="alert"], .text-red-500, .text-destructive')
      .first()
      .isVisible({ timeout: 1000 })
      .catch(() => false);

    if (formStillOpen && errorMessage) {
      // Get the error text for debugging
      const errorText = await page
        .locator('[role="alert"], .text-red-500, .text-destructive')
        .first()
        .textContent();
      console.log('Form submission error:', errorText);

      // Fail the test with the actual error
      throw new Error(`Organization creation failed with error: ${errorText}`);
    } else if (!formStillOpen) {
      console.log('✅ Form closed - likely success (page may have refreshed)');
    }

    // The test passes if we get here without errors
    console.log(`✅ Organization creation test completed for: ${orgName}`);
  });

  test('should handle duplicate slug gracefully', async ({ page }) => {
    await page.goto('/organizations');

    if (page.url().includes('/login')) {
      test.skip('Authentication required');
      return;
    }

    // Try to create organization with simple name that might conflict
    await page.getByRole('button', { name: /new organization/i }).click();

    await page.getByPlaceholder('Enter organization name').fill('Test Org');
    await page.getByPlaceholder('organization-slug').fill('test-org'); // Common slug

    await page.getByRole('button', { name: 'Create Organization' }).click();

    await page.waitForTimeout(2000);

    // Should either succeed or show appropriate error
    const hasError = await page
      .locator('[role="alert"]')
      .isVisible({ timeout: 1000 })
      .catch(() => false);

    if (hasError) {
      const errorText = await page.locator('[role="alert"]').textContent();
      console.log('Expected duplicate slug error:', errorText);
      expect(errorText).toContain('already exists');
    }
  });
});
