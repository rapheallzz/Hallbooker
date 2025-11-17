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
            print("Usage: python verify_registration.py <server_url>")
            await browser.close()
            return

        server_url = sys.argv[1]

        try:
            # Navigate to the registration page
            await page.goto(f"{server_url}/auth/register")
            print("Navigated to the registration page.")

            # Fill out the registration form
            await page.locator('input[name="fullName"]').fill("Test Owner")
            await page.locator('input[name="email"]').fill("testowner12345@test.com")
            await page.locator('input[name="phone"]').fill("1234567890")
            await page.locator('input[name="password"]').fill("password123")
            await page.locator('input[name="confirmPassword"]').fill("password123")
            print("Filled out the registration form.")

            # Click the register button
            await page.locator('button[type="submit"]').click()
            print("Clicked the register button.")

            # Wait for either success or error message to appear
            await page.wait_for_selector("text=Registration successful, .text-red-600", timeout=10000)

            # Check for success message
            success_message = await page.query_selector("text=Registration successful")
            if success_message:
                print("Registration successful!")
            else:
                # Check for error message
                error_message_element = await page.query_selector(".text-red-600")
                if error_message_element:
                    error_text = await error_message_element.inner_text()
                    print(f"Registration failed with error: {error_text}")
                else:
                    print("Registration failed, but no error message was found.")

        except Exception as e:
            print(f"An error occurred: {e}")
            # Save screenshot for debugging
            screenshot_path = "registration_error.png"
            await page.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {os.path.abspath(screenshot_path)}")

        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
