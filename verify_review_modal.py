
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
    def b64url_encode(data):
        return base64.urlsafe_b64encode(data).decode().rstrip("=")

    header = b64url_encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    payload_part = b64url_encode(json.dumps(payload).encode())
    token = f"{header}.{payload_part}.signature"

    async with async_playwright() as p:
        browser = await p.chromium.launch()

        # Mock data with a past booking
        bookings_data = {
            "data": [
                {
                    "_id": "b_past",
                    "bookingId": "HBK-999",
                    "eventDetails": "Past Event",
                    "totalPrice": 50000,
                    "paymentStatus": "paid",
                    "bookingStatus": "completed",
                    "hall": {
                        "_id": "h1",
                        "name": "Grand Ballroom",
                        "location": "Lagos, Nigeria"
                    },
                    "bookingDates": [
                        {
                            "startTime": "2024-01-01T10:00:00.000Z",
                            "endTime": "2024-01-01T18:00:00.000Z"
                        }
                    ]
                }
            ]
        }

        async def handle_route(route):
            url = route.request.url
            if "/api/v1/users/me" in url:
                await route.fulfill(status=200, body=json.dumps({"data": {"_id": "user123", "role": ["user"]}}), content_type="application/json")
            elif "/api/v1/bookings/my-bookings" in url:
                await route.fulfill(status=200, body=json.dumps(bookings_data), content_type="application/json")
            elif "/api/v1/reviews/hall/" in url:
                await route.fulfill(status=200, body=json.dumps({"data": []}), content_type="application/json")
            elif "/api/v1/reservations/my-reservations" in url:
                await route.fulfill(status=200, body=json.dumps({"data": {"reservations": []}}), content_type="application/json")
            else:
                await route.continue_()

        context = await browser.new_context(viewport={'width': 375, 'height': 812}, is_mobile=True)
        page = await context.new_page()
        await page.add_init_script(f"localStorage.setItem('token', '{token}')")
        await page.route("**/api/v1/**", handle_route)

        await page.goto('http://localhost:3006/dashboard', wait_until="networkidle")
        await page.get_by_role("button", name="Past").click()
        await page.wait_for_timeout(1000)

        # Click Review Hall
        await page.get_by_role("button", name="Review Hall").click()
        await page.wait_for_timeout(1000)

        os.makedirs('verification/dashboard', exist_ok=True)
        await page.screenshot(path='verification/dashboard/mobile_review_modal.png')
        print("Review Modal Mobile saved.")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(run())
