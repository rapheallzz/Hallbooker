import { test, expect } from '@playwright/test';

test('should log hall data to console', async ({ page }) => {
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push(msg.text());
  });

  await page.goto('http://localhost:3001');

  // Wait for the hall cards to be visible
  await page.waitForSelector('[data-testid="hall-card"]');

  // Write console logs to a file
  const fs = require('fs');
  fs.writeFileSync('/home/jules/verification/console.log', consoleLogs.join('\n'));

  // Also take a screenshot for visual verification
  await page.screenshot({ path: '/home/jules/verification/verification.png' });
});
