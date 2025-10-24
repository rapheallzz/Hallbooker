from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://localhost:3000/")
    page.locator('div.cursor-pointer:has(label[for="location"])').click()
    page.locator("li", has_text="New York, NY").wait_for(state="visible")
    page.locator("li", has_text="New York, NY").click()
    page.locator('button:has(svg)').click()
    page.wait_for_timeout(1000) # Wait for filtering to apply
    page.screenshot(path="jules-scratch/verification/verification.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
