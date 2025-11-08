import { test, expect } from '@playwright/test';

test('should display hall images', async ({ page }) => {
  await page.goto('http://localhost:3001');

  // Wait for the hall cards to be visible
  await page.waitForSelector('[data-testid="hall-card"]');

  // Get all hall card image elements
  const hallImages = await page.locator('[data-testid="hall-card"] img').all();

  // Check that at least one image is not a placeholder
  let hasRealImage = false;
  for (const img of hallImages) {
    const src = await img.getAttribute('src');
    if (src && !src.includes('via.placeholder.com')) {
      hasRealImage = true;
      break;
    }
  }

  expect(hasRealImage).toBe(true);

  // Take a screenshot for visual verification
  await page.screenshot({ path: '/home/jules/verification/verification.png' });
});
