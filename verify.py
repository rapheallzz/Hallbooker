import asyncio
from playwright.async_api import async_playwright
import sys
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Get the server URL from the command line arguments
        if len(sys.argv) < 2:
            print("Usage: python verify.py <server_url>")
            await browser.close()
            return

        server_url = sys.argv[1]

        try:
            # Navigate to the temporary page
            await page.goto(f"{server_url}/temp-hall-modal")
            print("Navigated to the temporary page.")

            # Wait for the modal to be visible
            await page.wait_for_selector(".fixed.inset-0")
            print("Modal is visible.")

            # Take a screenshot of the modal
            screenshot_path = "hall_modal_facilities.png"
            await page.screenshot(path=screenshot_path)
            print(f"Screenshot of the modal saved to {os.path.abspath(screenshot_path)}")

        except Exception as e:
            print(f"An error occurred: {e}")
            # Save screenshot for debugging
            screenshot_path = "error.png"
            await page.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {os.path.abspath(screenshot_path)}")

        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
