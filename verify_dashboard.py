
import asyncio
from playwright.async_api import async_playwright
import os
import json
import base64
import time

async def run():
    payload = {
        "id": "user123",
        "fullName": "John Doe",
        "email": "john@example.com",
        "role": ["user"],
        "activeRole": "user",
        "exp": int(time.time()) + 3600
    }
    # JWT parts are base64url encoded
    def b64url_encode(data):
        return base64.urlsafe_b64encode(data).decode().rstrip("=")

    header = b64url_encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    payload_part = b64url_encode(json.dumps(payload).encode())
    token = f"{header}.{payload_part}.signature"

    async with async_playwright() as p:
        browser = await p.chromium.launch()

        # Mock data
        user_data = {
            "data": {
                "_id": "user123",
                "fullName": "John Doe",
                "email": "john@example.com",
                "role": ["user"],
                "activeRole": "user"
            }
        }

        bookings_data = {
            "data": [
                {
                    "_id": "b1",
                    "bookingId": "HBK-1001",
                    "eventDetails": "Wedding Reception",
                    "totalPrice": 150000,
                    "paymentStatus": "paid",
                    "hall": {
                        "_id": "h1",
                        "name": "Grand Ballroom",
                        "location": "Lagos, Nigeria"
                    },
                    "bookingDates": [
                        {
                            "startTime": "2026-06-20T10:00:00.000Z",
                            "endTime": "2026-06-20T18:00:00.000Z"
                        }
                    ]
                }
            ]
        }

        async def handle_route(route):
            url = route.request.url
            if "/api/v1/users/me" in url:
                await route.fulfill(status=200, body=json.dumps(user_data), content_type="application/json")
            elif "/api/v1/bookings/my-bookings" in url:
                await route.fulfill(status=200, body=json.dumps(bookings_data), content_type="application/json")
            elif "/api/v1/reservations/my-reservations" in url:
                await route.fulfill(status=200, body=json.dumps({"data": {"reservations": []}}), content_type="application/json")
            elif "/api/v1/halls/recommendations" in url:
                await route.fulfill(status=200, body=json.dumps({"data": []}), content_type="application/json")
            elif "/api/v1/bookings/search/" in url:
                await route.fulfill(status=200, body=json.dumps({"data": bookings_data["data"][0]}), content_type="application/json")
            elif "/api/v1/reviews/hall/" in url:
                await route.fulfill(status=200, body=json.dumps({"data": []}), content_type="application/json")
            else:
                await route.continue_()

        # Mobile Viewport
        context = await browser.new_context(viewport={'width': 375, 'height': 812}, is_mobile=True)
        page = await context.new_page()

        # Set mock token
        await page.add_init_script(f"localStorage.setItem('token', '{token}')")
        await page.route("**/api/v1/**", handle_route)

        print("Navigating to dashboard (Mobile)...")
        await page.goto('http://localhost:3006/dashboard', wait_until="networkidle")
        await page.wait_for_timeout(3000)

        os.makedirs('verification/dashboard', exist_ok=True)
        await page.screenshot(path='verification/dashboard/mobile_dashboard.png')
        print("Dashboard Mobile saved.")

        # Click View Receipt
        receipt_btn = page.get_by_role("button", name="View Receipt").first
        if await receipt_btn.is_visible():
            await receipt_btn.click()
            await page.wait_for_timeout(1000)
            await page.screenshot(path='verification/dashboard/mobile_details_modal.png')
            print("Booking Details Modal Mobile saved.")
            await page.get_by_role("button", name="Done").click()
            await page.wait_for_timeout(500)
        else:
            print("View Receipt button not found!")
            # Take another screenshot to see what's wrong
            await page.screenshot(path='verification/dashboard/mobile_error.png')

        # Try Review Modal (need to be in "Past" tab)
        await page.get_by_role("button", name="Past").click()
        await page.wait_for_timeout(500)
        # We need a past booking in mock data for this to work perfectly,
        # but let's see if we can just trigger it.

        await browser.close()

if __name__ == '__main__':
    asyncio.run(run())
