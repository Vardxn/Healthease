"""
capture_screens.py — log in to the running app and screenshot key pages.
Output: ml/screenshots/*.png
Run: venv/bin/python capture_screens.py
"""
import os
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
EMAIL = "user@healthease.demo"
PASSWORD = "User@123"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "screenshots")
os.makedirs(OUT, exist_ok=True)

PAGES = [
    ("dashboard", "/dashboard"),
    ("prescriptions", "/prescriptions"),
    ("upload", "/upload"),
    ("doctors", "/doctors"),
    ("medicine_tracker", "/medicine-tracker"),
    ("vitals", "/vitals"),
    ("health_score", "/health-score"),
    ("analytics", "/dashboard/analytics"),
]


def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1600, "height": 950},
                                  device_scale_factor=2)
        page = ctx.new_page()

        # --- login ---
        page.goto(f"{BASE}/login", wait_until="networkidle")
        page.fill('input[name="email"]', EMAIL)
        page.fill('input[name="password"]', PASSWORD)
        page.click('button[type="submit"]')
        page.wait_for_timeout(3500)
        print("logged in, url:", page.url)

        for name, route in PAGES:
            try:
                page.goto(f"{BASE}{route}", wait_until="networkidle")
                page.wait_for_timeout(2500)
                path = os.path.join(OUT, f"{name}.png")
                page.screenshot(path=path)
                print("captured", name, "->", path)
            except Exception as e:
                print("FAILED", name, e)

        browser.close()


if __name__ == "__main__":
    run()
