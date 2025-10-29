
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        page.goto("http://localhost:3000/vendor/dashboard")
        page.click('button:has-text("Create")')
        page.click('button:has-text("Create Hall")')

        # Step 1
        page.wait_for_selector('h2:has-text("Create a New Hall")')
        page.fill('input[name="name"]', "Test Hall")
        page.fill('textarea[name="description"]', "This is a test hall.")
        page.fill('input[name="location"]', "Test Location")
        page.fill('input[name="capacity"]', "100")
        page.fill('input[name="openingHour"]', "09:00")
        page.fill('input[name="closingHour"]', "23:00")
        page.screenshot(path="jules-scratch/verification/verification_step1.png")
        page.click('button:has-text("Continue")')

        # Step 2
        page.wait_for_selector('input[name="pricePerHour"]')
        page.fill('input[name="pricePerHour"]', "1000")
        page.fill('input[name="pricePerDay"]', "10000")
        page.screenshot(path="jules-scratch/verification/verification_step2.png")
        page.click('button:has-text("Continue")')

        # Step 3
        page.wait_for_selector('h3:has-text("Upload Media")')
        page.screenshot(path="jules-scratch/verification/verification_step3.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
