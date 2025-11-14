
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Navigate directly to the bookings page
        page.goto("http://localhost:3000/admin/dashboard/bookings")

        # Check for the main heading
        expect(page.get_by_role("heading", name="Bookings")).to_be_visible()

        # Take a screenshot
        page.screenshot(path="verification.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
