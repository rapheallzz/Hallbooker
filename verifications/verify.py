
import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Create a directory for screenshots if it doesn't exist
        os.makedirs("/home/jules/verification", exist_ok=True)

        # Verify login page
        await page.goto("http://localhost:3000/auth/login")
        await page.wait_for_selector('img', state='visible')
        await page.screenshot(path="/home/jules/verification/login_page.png")

        # Verify register page
        await page.goto("http://localhost:3000/auth/register")
        await page.wait_for_selector('img', state='visible')
        await page.screenshot(path="/home/jules/verification/register_page.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
