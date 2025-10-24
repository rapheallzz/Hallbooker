from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://localhost:3000/")

    # Check if clicking outside closes the location dropdown
    page.locator('div.cursor-pointer:has(label[for="location"])').click()
    page.wait_for_selector("ul") # Wait for dropdown
    page.locator("h1").click() # Click outside
    page.wait_for_timeout(500) # Wait for close animation

    # Check if past dates are disabled
    page.locator('div.cursor-pointer:has(label[for="date"])').click()
    page.wait_for_selector(".rdrCalendarWrapper")

    page.screenshot(path="jules-scratch/verification/verification.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
