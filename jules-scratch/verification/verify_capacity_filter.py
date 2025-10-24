from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://localhost:3000/")

    # Test capacity filter
    page.locator('div.cursor-pointer:has(label[for="capacity"])').click()
    page.locator("li", has_text="100-200").wait_for(state="visible")
    page.locator("li", has_text="100-200").click()
    page.locator('button:has(svg)').click()
    page.wait_for_timeout(1000) # Wait for filtering

    page.screenshot(path="jules-scratch/verification/verification.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
